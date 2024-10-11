import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import User from "../../models/Users";
import { verifyToken } from "../../utils/jwt";

function generateUID() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function GET(req) {
  await dbConnect();
  const role = req.nextUrl.searchParams.get('role');
  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { message: "Access denied. No token provided." , success: false },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token." , success: false },
      { status: 403 }
    );
  }
  if (userRole !== "Admin") {
    return NextResponse.json(
      { message: "Access denied. Admins only." , success: false },
      { status: 403 }
    );
  }

  try {
    const query = role ? { role } : {};
    const users = await User.find(query);
    return NextResponse.json({ users, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();
  const token = req.cookies.get("authToken");
  if (!token) {
    console.log("Token not found. Redirecting to login.");
    return NextResponse.json(
      { message: "Access denied. No token provided.", success: false },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  if (userRole !== "Admin") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  const { name, email, password, role } = await req.json();
  console.log("calleed: ",name, email, password, role)

  try {
    // Check if email is unique
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists", success: false },
        { status: 400 }
      );
    }

    // Generate a 6-digit UID
    const uid = generateUID();

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role,
      uid,
    });

    // Save user to the database
    await newUser.save();

    // Send response with UID
    return NextResponse.json({ user: newUser, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
