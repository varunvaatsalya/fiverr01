import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import Doctor from "@/app/models/Doctors";
import { verifyTokenWithLogout } from "@/app/utils/jwt";

export async function GET(req) {
  return NextResponse.json(
    { message: "Service unavailable", success: false },
    { status: 200 }
  );

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
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    const doctors = await Doctor.find();

    const updatedDoctors = await Promise.all(
      doctors.map(async (doc) => {
        let needUpdate = false;

        if (
          doc.department &&
          !doc.departments.some(
            (d) => d.toString() === doc.department.toString()
          )
        ) {
          doc.departments.push(doc.department);
          needUpdate = true;
        }
        const uniqueDepartments = [
          ...new Map(doc.departments.map((d) => [d.toString(), d])).values(),
        ];
        if (uniqueDepartments.length !== doc.departments.length) {
          doc.departments = uniqueDepartments;
          needUpdate = true;
        }

        if (needUpdate) {
          await doc.save();
        }

        return doc;
      })
    );
    return NextResponse.json(
      {
        doctors: updatedDoctors,
        message: "Departments updated",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
