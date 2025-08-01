import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "../../lib/Mongodb";
import { generateToken, verifyTokenWithLogout } from "../../utils/jwt";

import User from "../../models/Users";
import Admin from "../../models/Admins";
import { credentials as DEFAULT_ADMIN } from "@/app/credentials";
import LoginHistory from "@/app/models/LoginHistory";
// import LoginInfo from "../../models/LoginInfo";

export async function GET(req) {
  await dbConnect();
  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { route: "/login", success: false },
      { status: 401 }
    );
  }

  const decoded = await verifyTokenWithLogout(token.value);
  // console.log(decoded);
  // const decoded = null;
  const userRole = decoded?.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { route: "/login", success: false },
      { status: 403 }
    );
  }

  return NextResponse.json({ user: decoded, success: true }, { status: 200 });
}

export async function POST(req) {
  await dbConnect();
  const userRole = {
    admin: "/dashboard-admin",
    owner: "/dashboard-owner",
    salesman: "/dashboard-salesman",
    pathologist: "/dashboard-pathologist",
    nurse: "/dashboard-nurse",
    dispenser: "/dashboard-dispenser",
    stockist: "/dashboard-stockist",
  };

  // Replace with a strong secret

  const { email, password, role, redirect } = await req.json();

  const logLoginAttempt = async (status, reason) => {
    const ip = req.headers.get("x-forwarded-for") || "Unknown IP";
    const userAgent = req.headers.get("user-agent") || "Unknown User-Agent";

    try {
      await LoginHistory.create({
        attemptedUserEmail: email || "Invalid",
        role: role || null,
        ipAddress: ip,
        reason,
        userAgent,
        status,
      });
    } catch (err) {
      console.error("Failed to save login history:", err);
    }
  };

  try {
    if (role === "admin") {
      let admin;
      if (email === DEFAULT_ADMIN.email) {
        admin = DEFAULT_ADMIN;
        admin._id = DEFAULT_ADMIN.id || "0";
      } else {
        admin = await Admin.findOne({ email });
        if (!admin) {
          await logLoginAttempt("failed", `Incorrect email: ${email}`);
          return NextResponse.json(
            { message: "User not found", success: false },
            { status: 404 }
          );
        }
      }
      if (admin.password !== password) {
        await logLoginAttempt("failed", "Wrong Password");
        return NextResponse.json(
          { message: "Invalid password", success: false },
          { status: 401 }
        );
      }

      const token = await generateToken({
        _id: admin._id,
        name: admin.name,
        email,
        password,
        role,
        editPermission: true,
      });

      cookies().set({
        name: "authToken",
        value: token,
        path: "/",
        maxAge: 2 * 24 * 60 * 60,
      });

      await logLoginAttempt("success");
      return NextResponse.json({
        messages: "Login successful",
        route: redirect || userRole.admin,
        editPermission: true,
        role,
        success: true,
      });
    }
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      await logLoginAttempt("failed", `Incorrect Email: ${email}`);
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    // Check if the role matches
    if (user.role !== role) {
      await logLoginAttempt("failed");
      return NextResponse.json(
        { message: "Role mismatch", success: false },
        { status: 403 }
      );
    }

    // Check if the password matches
    if (user.password !== password) {
      await logLoginAttempt("failed", "Wrong Password");
      return NextResponse.json(
        { message: "Invalid password", success: false },
        { status: 401 }
      );
    }

    const token = await generateToken(user);

    cookies().set({
      name: "authToken",
      value: token,
      path: "/",
      maxAge: 2 * 24 * 60 * 60,
    });
    // If everything matches, return success
    await logLoginAttempt("success");
    return NextResponse.json(
      {
        message: "Login successful",
        role: user.role,
        editPermission: user.editPermission,
        route: redirect || userRole[user.role],
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
