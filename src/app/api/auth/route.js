import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateToken, verifyToken } from "../../utils/jwt";
import User from "../../models/Users";
import Admin from "../../models/Admins";
import { credentials } from "../../credentials";
import Pathologist from "../../models/Pathologist";

export async function GET(req) {
  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { route: "/login", success: false },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { route: "/login", success: false },
      { status: 403 }
    );
  }

  return NextResponse.json(
    { route: `/dashboard-${userRole}`, success: true },
    { status: 200 }
  );
}

export async function POST(req) {
  const userRole = {
    admin: "/dashboard-admin",
    owner: "/dashboard-owner",
    salesman: "/dashboard-salesman",
    pathologist: "/dashboard-pathologist",
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
        email,
        password,
        role,
        editPermission: true,
      });

      cookies().set({
        name: "authToken",
        value: token,
        path: "/",
      });

      return NextResponse.json({
        messages: "Login successful",
        route: userRole.admin,
        editPermission: true,
        role,
        success: true,
      });
    } else if (role === "pathologist") {
      const pathologist = await Pathologist.findOne({ email });
      if (!pathologist) {
        return NextResponse.json(
          { message: "User not found", success: false },
          { status: 404 }
        );
      }

      // Check if the role matches
      if (pathologist.role !== role) {
        return NextResponse.json(
          { message: "Role mismatch", success: false },
          { status: 403 }
        );
      }

      // Check if the password matches
      if (pathologist.password !== password) {
        return NextResponse.json(
          { message: "Invalid password", success: false },
          { status: 401 }
        );
      }

      const token = await generateToken(pathologist);

      cookies().set({
        name: "authToken",
        value: token,
        path: "/",
      });
      // If everything matches, return success
      return NextResponse.json(
        {
          message: "Login successful",
          role: pathologist.role,
          route: userRole.pathologist,
          success: true,
        },
        { status: 200 }
      );
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

    cookies().set({
      name: "authToken",
      value: token,
      path: "/",
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
