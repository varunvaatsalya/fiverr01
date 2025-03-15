import { NextResponse } from "next/server";
import dbConnect from "../../../lib/Mongodb";
import { verifyToken } from "../../../utils/jwt";
import { ExpenseCategory } from "../../../models/Expenses";


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
  //   if (userRole !== "admin" && userRole !== "owner" && userRole !== "salesman") {
  //     return NextResponse.json(
  //       { message: "Access denied. admins only.", success: false },
  //       { status: 403 }
  //     );
  //   }

  try {
    let categories = await ExpenseCategory.find().sort({ _id: -1 });
    return NextResponse.json({ categories, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
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
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { name, subCategory } = await req.json();

  try {
    // Create new user
    const newCategory = new ExpenseCategory({
      name,
      subCategory,
    });

    // Save user to the database
    await newCategory.save();

    // Send response with UID
    return NextResponse.json(
      { category: newCategory, success: true },
      { status: 201 }
    );
  } catch (err) {
    if (err.code === 11000) {
      // MongoDB duplicate key error code
      return NextResponse.json(
        {
          success: false,
          message: "Category name must be unique. Please use a different name.",
        },
        { status: 400 }
      );
    }
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
