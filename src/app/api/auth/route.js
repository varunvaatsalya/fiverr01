import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateToken } from "../../utils/jwt";


export async function POST(req) {

const users = [
  {
    id: 1,
    email: "admin@example.com",
    password: "admin123", // Note: In real apps, use hashed passwords
    role: "Admin",
    route:'/dashboard-admin'
  },
  {
    id: 2,
    email: "owner@example.com",
    password: "owner123",
    role: "Owner",
    route:'/dashboard-owner'
  },
  {
    id: 3,
    email: "salesman@example.com",
    password: "salesman123",
    role: "SalesMan",
    route:'/dashboard-salesman'
  },
];

// Replace with a strong secret

  const { email, password, role } = await req.json(); // Get email, password, role from request body

  // Find user in the mock database
  const user = users.find(
    (user) =>
      user.email === email && user.password === password && user.role === role
  );

  if (!user) {
    // return res.status(401).json({ message: 'Invalid credentials' });
    return NextResponse.json({
      messages: "Invalid credentials",
      success: false,
    });
  }

  const token = await generateToken(user);

  cookies().set({
    name: "authToken",
    value: token,
    path: "/",
  });

  return NextResponse.json({ messages: "Login successful", route:user.route, success: true });
}
