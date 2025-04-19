import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Unit from "../../models/Units";

export async function GET(req) {
  await dbConnect();

    // const token = req.cookies.get("authToken");
    // if (!token) {
    //   console.log("Token not found. Redirecting to login.");
    //   return NextResponse.json(
    //     { message: "Access denied. No token provided.", success: false },
    //     { status: 401 }
    //   );
    // }

    // const decoded = await verifyTokenWithLogout(token.value);
    // const userRole = decoded?.role;
    // const userEditPermission = decoded?.editPermission;
    // if (!decoded || !userRole) {
    //   return NextResponse.json(
    //     { message: "Invalid token.", success: false },
    //     { status: 403 }
    //   );
    // }

    // if (userRole !== "admin" && userRole !== "pathologist") {
    //   return NextResponse.json(
    //     { message: "Access denied. admins only.", success: false },
    //     { status: 403 }
    //   );
    // }

  try {
    let units = await Unit.find().sort({ _id: -1 });
    return NextResponse.json(
      //   { units, userRole, userEditPermission, success: true },
      { units, success: true },
      { status: 200 }
    );
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

  const decoded = await verifyTokenWithLogout(token.value);
  const userRole = decoded?.role;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }
  if (userRole !== "admin" && userRole !== "pathologist") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { units } = await req.json();

  try {
    if (!Array.isArray(units) || units.length === 0) {
      return NextResponse.json(
        {
          message: "Invalid input, array of units is required.",
          success: false,
        },
        { status: 400 }
      );
    }

    // Create new user
    const Units = await Unit.insertMany(units);

    return NextResponse.json(
      {
        Units,
        success: true,
      },
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
