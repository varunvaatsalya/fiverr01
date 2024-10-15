import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateToken } from "../../utils/jwt";
import User from "../../models/Users";

export async function POST(req) {
  const users = [
    {
      id: 1,
      email: "admin@example.com",
      password: "admin123", // Note: In real apps, use hashed passwords
      role: "admin",
      route: "/dashboard-admin",
    },
    {
      id: 2,
      email: "owner@example.com",
      password: "owner123",
      role: "Owner",
      route: "/dashboard-owner",
    },
    {
      id: 3,
      email: "salesman@example.com",
      password: "salesman123",
      role: "SalesMan",
      route: "/dashboard-salesman",
    },
  ];
  const userRole = {
    admin: "/dashboard-admin",
    owner: "/dashboard-owner",
    salesman: "/dashboard-salesman",
  };

  // Replace with a strong secret

  const { email, password, role } = await req.json(); // Get email, password, role from request body

  // Find user in the mock database

  try {
    if (role === "admin") {
      if (
        email == process.env.ADMIN_EMAIL &&
        password == process.env.ADMIN_PASSWORD
      ) {
        const token = await generateToken({ email, password, role, editPermission:true });

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
      } else {
        return NextResponse.json(
          { message: "Invalid Credentials", success: false },
          { status: 401 }
        );
      }
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

  return NextResponse.json({
    messages: "Login successful",
    route: user.route,
    success: true,
  });
}
