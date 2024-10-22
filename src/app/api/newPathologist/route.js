import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import Pathologist from "../../models/Pathologist";

export async function GET(req) {
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
  if (userRole !== "admin" && userRole !== "pathologist") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    const pathologist = await Pathologist.find().sort({ _id: -1 });
    return NextResponse.json({ pathologist, success: true }, { status: 200 });
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
  if (userRole !== "admin" && userRole !== "pathologist") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  const { name, email, password } = await req.json();

  try {
    // Check if email is unique
    const existingPathologist = await Pathologist.findOne({ email });
    if (existingPathologist) {
      return NextResponse.json(
        { message: "Email already exists", success: false },
        { status: 400 }
      );
    }

    // Generate a 6-digit UID

    // Create new user
    const newPathologist = new Pathologist({
      name,
      email,
      password,
      role: "pathologist",
    });

    // Save user to the database
    await newPathologist.save();

    // Send response with UID
    return NextResponse.json(
      { pathologist: newPathologist, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

// export async function DELETE(req) {
//   await dbConnect();
//   const { id } = await req.json();

//   try {
//     const deletedAdmin = await Admin.findByIdAndDelete(id);
//     if (!deletedAdmin) {
//       return NextResponse.json(
//         { message: "Admin not found", success: false },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Admin deleted successfully", success: true },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error deleting admin:", error);
//     return NextResponse.json(
//       { message: "Internal server error", success: false },
//       { status: 500 }
//     );
//   }
// }