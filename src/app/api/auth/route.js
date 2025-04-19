import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "../../lib/Mongodb";
import { generateToken, verifyTokenWithLogout } from "../../utils/jwt";

import User from "../../models/Users";
import Admin from "../../models/Admins";
import { credentials } from "../../credentials";
import LoginInfo from "../../models/LoginInfo";

const storeRoleLatestLogin = async (userEmail, role, req) => {
  try {
    const ip = req.headers.get("x-forwarded-for") || "Unknown IP";
    const userAgent = req.headers.get("user-agent") || "Unknown User-Agent"; // Get browser details

    const loginData = {
      lastUserEmail: userEmail || "unknown@example.com",
      deviceType:
        userAgent !== "Unknown User-Agent" && userAgent.includes("Mobile")
          ? "Mobile"
          : "Unknown",
      ipAddress: ip,
      userAgent,
      lastLogin: new Date(),
    };

    const existingRole = await LoginInfo.findOne({ role });

    if (existingRole) {
      // Update existing role's latest login
      await LoginInfo.updateOne({ role }, loginData);
      console.log(`Updated latest login for role '${role}'`);
    } else {
      await LoginInfo.create({ role, ...loginData });
      console.log(`Created latest login for role '${role}'`);
    }
  } catch (error) {
    console.error("Error storing login details:", error);
  }
};

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
  console.log(decoded)
  // const decoded = null;
  const userRole = decoded?.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { route: "/login", success: false },
      { status: 403 }
    );
  }
  await storeRoleLatestLogin(decoded.email, decoded.role, req);

  return NextResponse.json(
    { route: `/dashboard-${userRole}`, success: true },
    { status: 200 }
  );
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

  const { email, password, role } = await req.json(); // Get email, password, role from request body

  // Find user in the mock database

  try {
    if (role === "admin") {
      let admin;
      if (email == credentials.email) {
        admin = credentials;
      } else {
        admin = await Admin.findOne({ email });
        if (!admin) {
          return NextResponse.json(
            { message: "User not found", success: false },
            { status: 404 }
          );
        }
      }
      if (admin.password !== password) {
        return NextResponse.json(
          { message: "Invalid password", success: false },
          { status: 401 }
        );
      }

      const token = await generateToken({
        _id: credentials.id,
        email,
        password,
        role,
        editPermission: true,
      });

      await storeRoleLatestLogin(email, role, req);

      cookies().set({
        name: "authToken",
        value: token,
        path: "/",
        maxAge: 2 * 24 * 60 * 60,
      });

      return NextResponse.json({
        messages: "Login successful",
        route: userRole.admin,
        editPermission: true,
        role,
        success: true,
      });
    }
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    // Check if the role matches
    if (user.role !== role) {
      return NextResponse.json(
        { message: "Role mismatch", success: false },
        { status: 403 }
      );
    }

    // Check if the password matches
    if (user.password !== password) {
      return NextResponse.json(
        { message: "Invalid password", success: false },
        { status: 401 }
      );
    }

    const token = await generateToken(user);
    await storeRoleLatestLogin(user.email, user.role, req);

    cookies().set({
      name: "authToken",
      value: token,
      path: "/",
      maxAge: 2 * 24 * 60 * 60,
    });
    // If everything matches, return success
    return NextResponse.json(
      {
        message: "Login successful",
        role: user.role,
        editPermission: user.editPermission,
        route: userRole[user.role],
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
