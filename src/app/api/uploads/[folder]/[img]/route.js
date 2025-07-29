// /app/api/uploads/[folder]/[img]/route.js
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { verifyTokenWithLogout } from "@/app/utils/jwt";

export async function GET(req, { params }) {
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
//   const userEditPermission = decoded?.editPermission;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }

  try {
    const { folder, img } = params;
    const filePath = path.join(process.cwd(), "uploads", folder, img);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "private, max-age=3600");

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
