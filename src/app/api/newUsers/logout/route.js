import dbConnect from "@/app/lib/Mongodb";
import { Users } from "@/app/models";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { NextResponse } from "next/server";

export async function PUT(req) {
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
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json(
      { message: "User ID required", success: false },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await Users.findByIdAndUpdate(
      id,
      {
        $set: {
          "logout.lastLogoutByAdmin": new Date(),
          "logout.isLogoutPending": true,
        },
      },
      { new: true } // return updated doc
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Logout info updated successfully",
        success: true,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
