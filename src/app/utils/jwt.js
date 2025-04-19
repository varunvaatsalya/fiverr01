// import jwt from "jsonwebtoken";
import { jwtVerify, SignJWT } from "jose";
import Users from "../models/Users";
import RoleLogout from "../models/RoleLogouts";
import dbConnect from "../lib/Mongodb";

const JWT_SECRET = process.env.JWT_SECRET;
const secret = new TextEncoder().encode(JWT_SECRET);

export const generateToken = async (user) => {
  const token = await new SignJWT({
    _id: user._id,
    email: user.email,
    role: user.role,
    editPermission: user.editPermission,
  })
    .setProtectedHeader({ alg: "HS256" }) // Algorithm to use
    .setIssuedAt()
    .setExpirationTime("2d") // Token expiration time
    .sign(secret);

  return token;
};

export const verifyToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, secret); // Verify the token
    return payload; // This will contain the role and any other claims
  } catch (error) {
    console.error("Invalid or expired token:", error);
    return null; // Token is invalid or expired
  }
};

export const verifyTokenWithLogout = async (token) => {
  try {
    const { payload } = await jwtVerify(token, secret); // Verify the token

    const userId = payload._id;
    const userRole = payload.role;
    const tokenIssuedAt = payload.iat * 1000; // Convert to ms

    await dbConnect();
    let isInvalidated = false;

    let role =
      userRole === "admin" && userId === "0" ? "default admin" : userRole;
    // Check role-level logout
    const logoutDoc = await RoleLogout.findOne({ role });
    if (logoutDoc && logoutDoc.lastLogoutAt.getTime() > tokenIssuedAt) {
      isInvalidated = true;
    }

    // Check individual user logout
    if (userRole !== "admin") {
      const user = await Users.findById(userId).select("logout");
      if (
        user?.logout?.lastLogoutByAdmin &&
        user.logout.lastLogoutByAdmin.getTime() > tokenIssuedAt
      ) {
        isInvalidated = true;

        await Users.findByIdAndUpdate(userId, {
          $set: { "logout.isLogoutPending": false },
        });
      }
    }
    if (isInvalidated) return null;
    return payload; // This will contain the role and any other claims
  } catch (error) {
    console.error("Invalid or expired token:", error);
    return null; // Token is invalid or expired
  }
};
