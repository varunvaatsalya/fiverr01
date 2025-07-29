import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import FileAssets from "@/app/models/FileAssets";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import fs from "fs/promises";
import path from "path";

// export const config = {
//   api: { bodyParser: false },
// };

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
  const userEditPermission = decoded?.editPermission;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }

  if (
    userRole !== "admin" &&
    (userRole !== "stockist" || !userEditPermission)
  ) {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image"); // type: File
    const folder = formData.get("folder") || "general";
    const purpose = formData.get("purpose") || "unspecified";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No image found" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name}`;
    const uploadDir = path.join(process.cwd(), "uploads", folder);
    const filePath = path.join(uploadDir, fileName);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    const imageDoc = await FileAssets.create({
      filename: file.name,
      filepath: `/uploads/${folder}/${fileName}`,
      uploadedBy: {
        email: decoded.email,
        role: decoded.role,
      },
      purpose,
      folder,
    });

    return NextResponse.json({
      success: true,
      imageId: imageDoc._id,
      filepath: imageDoc.filepath,
    });
  } catch (err) {
    console.error("UPLOAD ERROR", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}


