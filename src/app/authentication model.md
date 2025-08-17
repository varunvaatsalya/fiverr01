samjha bhai. neeche ek **solid blueprint + pseudocode** de raha hoon jisme:

* **2-token model** (access + refresh) with short expiries
* **periodic server↔server re-auth (handshake)**
* **grace windows** (taaki active user bekaar me logout na ho)
* **rotation & reuse-detect**
* **“handover / autonomous mode”**: ek certain duration ke baad client apne aap owner ban sakta hai (tumhare server se verify ke bina) with a tiny config change

durations tumhare numbers ke hisaab se rakhe:

* **Access Token (AT)** = **1 hour**
* **Refresh Token (RT)** = **idle 2 days**, **absolute 15 days**
* **Handshake period (HP)** = **12 hours** (chaaho to 6h bhi kar sakte ho)
* **Grace windows**: RT idle grace = **30 min**, handshake grace = **2 hours**

---

# High-level design

## tokens

* **AT**: short-lived JWT (1h). stateless verify via JWKS.
* **RT**: opaque random (rotate on every refresh). DB me hashed + family tracking.
* **RT expiries**

  * **Idle expiry**: last use se 2 days (sliding)
  * **Absolute expiry**: issue time se 15 days (extend *sirf* successful handshake par)

## periodic re-auth (handshake)

* Har **12h** pe, refresh ke waqt **client server (CAP)** ko challenge bhejo:

  * CAP → signed response (HMAC ya better mTLS / Ed25519)
  * Pass ho to tokens issue + `last_reauth_at = now`
* Agar handshake window miss/failed → **handshake grace (2h)** allow karo (retry); fail rehe to refresh deny.

## active user logout na ho

* Agar **AT just renewed** aur RT **idle-expired** ho gaya:

  * **Idle grace (30 min)** me agar refresh hit aata hai, allow + rotate.
* **RT reuse detection**: agar purana RT dobara aaya, **entire family revoke** + force login.

## handover / autonomous mode

* “Managed” mode (default): sab refresh/handshake tumhare Auth Server (PAS) se.
* “Autonomous” mode (handover): ek **lease** ke baad client ko **Tenant Signing Key (TSK)** de do:

  * **Asymmetric keypair** (Ed25519/ECDSA). **Private key sirf client ke paas**.
  * Client apne aap **AT/RT issue** kar sakta hai; tumhara server ki zaroorat nahi.
  * Tumhare paas sirf **client JWKS (public keys)** register rahenge (audit/forensics ke liye optional).
* Tiny change: `tenant.mode = "autonomous"` + `tenant.trusted_kids = [...]`.

---

# Data model (tables)

**refresh\_tokens**

* `jti` (uuid), `user_id`, `device_id`, `family_id`
* `hash`, `issued_at`, `last_used_at`
* `idle_expires_at`, `absolute_expires_at`
* `last_reauth_at`, `status` ∈ {active, rotated, revoked, reused}
* indexes: `(user_id, family_id, status)`, `(hash)` unique

**clients / tenants**

* `tenant_id`, `mode` ∈ {managed, autonomous}
* `handshake_secret` (HMAC) *or* `mTLS cert` *or* `client_pubkeys`
* `handover_eligible_at`, `lease_state` ∈ {none, warming, issued}
* `tsk_kid`, `tsk_pub` (server-side), **TSK private key sirf client ke paas**

**handshake\_audit**

* `tenant_id`, `ts`, `result`, `reason`, `ip`, `mtls_dn`

---

# State machine (refresh decision)

```
ON /refresh(request: RT, device_id, tenant_id):

  t = now()

  token = DB.find_by_hash(hash(RT))
  IF !token OR token.status != 'active' => DENY (invalid)

  // ---- Idle expiry + grace ----
  IF t > token.idle_expires_at:
       IF t <= token.idle_expires_at + IDLE_GRACE (30m):
            // continue (allow one last rotation)
       ELSE DENY (idle expired)

  // ---- Reuse detect ----
  IF token.reused_flag == true => REVOKE_FAMILY + DENY

  // ---- Handshake check ----
  needHandshake = (t - token.last_reauth_at >= HANDSHAKE_PERIOD)
  IF needHandshake:
       result = performHandshake(tenant_id, device_id, token.user_id)
       IF result == FAIL:
            // grace for transient outages
            IF t - token.last_reauth_at <= HANDSHAKE_PERIOD + HANDSHAKE_GRACE (2h):
                 // allow one refresh but mark pending
                 pending_reauth = true
            ELSE
                 DENY ("handshake required")

  // ---- Absolute expiry policy ----
  IF t > token.absolute_expires_at:
       // Absolute means hard stop unless recent handshake succeeded
       IF needHandshake == true AND result == SUCCESS:
            // extend absolute because trust renewed
            extendAbsolute = true
       ELSE
            DENY ("absolute expired")

  // ---- Rotation ----
  newRT = randomOpaque()
  newAT = signAccessJWT(user_id, 1h, KID_current)

  // Sliding idle window
  new_idle_expires = t + 2d

  // Absolute extend logic
  IF extendAbsolute == true:
       new_absolute_expires = t + 15d
  ELSE
       // keep same absolute window if not exceeded
       new_absolute_expires = max(t + 2d, token.absolute_expires_at)

  // Persist atomically
  TX:
     DB.update token.status = 'rotated', token.last_used_at = t
     DB.insert new_token {
        jti, family_id = token.family_id,
        idle_expires_at = new_idle_expires,
        absolute_expires_at = new_absolute_expires,
        last_reauth_at = (result==SUCCESS? t : token.last_reauth_at),
        status='active'
     }
  COMMIT

  RETURN { access_token: newAT (1h), refresh_token: newRT }
```

---

# Handshake (server↔server)

**performHandshake(tenant\_id, device\_id, user\_id)**

**Option A (simple, fast)**: HMAC

```
nonce = random()
send -> client: {tenant_id, device_id, user_id, nonce, ts}
client_resp = HMAC_SHA256(handshake_secret, nonce||ts||device_id||user_id)
server_verify(HMAC == client_resp && |ts-now| < 60s)
```

**Option B (strong)**: mTLS ya Ed25519 signature

```
server -> challenge {nonce, ts}
client -> {sig = Sign_TSK(nonce||ts||device_id)}
server -> verify(sig, tenant.trusted_pubkeys)
```

* success ⇒ `last_reauth_at = now`
* audit row insert karo

---

# Edge cases (tumhari wali concern)

1. **AT just renewed but RT expired (idle)**
   → 30 min **Idle grace** me ek refresh allow + rotate, taaki active user logout na ho.

2. **RT absolute about to expire, user active**
   → next refresh pe **handshake success** to **absolute window reset (15d)**.
   → handshake fail + grace end ⇒ login required.

3. **RT theft**
   → rotation pe **old RT reuse** detect ⇒ **family revoke** + force login.

---

# Handover: “Managed → Autonomous” (complete ownership)

**Goal:** ek “complete duration” ke baad client tumhare bina chal sake.

**Warming phase (recommended)**

* Criteria (examples):

  * pichhle **15 din** me handshake success rate > 99%, koi fraud signal nahi
  * time ≥ `handover_eligible_at`
* Action:

  * Issue **TSK (Tenant Signing Key)** (Ed25519).
  * `tenant.mode = "autonomous"` flag **off** rehta (abhi managed), par **client ko key mil chuki**.

**Flip (tiny change):**

* Set `tenant.mode = "autonomous"` = true
* Add `tenant.trusted_kids += TSK.kid` to **global JWKS** so tumhare gateways bhi CAP-signed AT verify kar sakte (optional).
* Ab **CAP khud**:

  * **AT (1h)** sign karega TSK se
  * **RT (2d/15d)** issue & verify karega locally
  * Handshake to **skip** (no dependency on PAS)

**Rollback path:**

* If kabhi issue aaye, `tenant.mode="managed"` + rotate out `TSK.kid` (public key revoke list).
* Client ko new TSK re-issue after fix.

---

# Client-side refresh loop (pseudo)

```js
// runs in app
scheduleEvery(5m, () => {
  if (timeToExpire(accessToken) < 10m) {
     try {
        call('/refresh', { RT, device_id, tenant_id })
        // update AT/RT from response
     } catch (e) {
        if (e.code == 'HANDSHAKE_REQUIRED') retryBackoff( up to 2h )
        else promptLogin()
     }
  }
});
```

---

# Defaults (tune as needed)

* `AT_TTL = 1h`
* `RT_IDLE_TTL = 48h`
* `RT_ABS_TTL = 15d`
* `HANDSHAKE_PERIOD = 12h`
* `IDLE_GRACE = 30m`
* `HANDSHAKE_GRACE = 2h`

---

# Quick checklist (prod hardening)

* RT **hashed** store (argon2/bcrypt), **family id** per login
* **Replay protection** (jti + rotated status)
* **SameSite=Strict, HttpOnly, Secure** cookies for RT (web)
* **Bound to device\_id**; optional IP/device fingerprint
* **mTLS** preferred for handshake (HMAC as fallback)
* **Audit logs** for refresh/handshake/ownership flip
* **Kill switch**: revoke tenant TSK (autonomous rollback)

---

ye structure laga do, tumhe exactly wahi behavior milega jo chahiye:

* short tokens (1h / 2d / 15d)
* periodic mutual auth
* active users never get surprise logout
* aur “complete duration” ke baad **1 flag flip** se client pure owner (autonomous) ban sakta hai.
