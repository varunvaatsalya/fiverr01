import dbConnect from "@/app/lib/Mongodb";
import FileAssets from "@/app/models/FileAssets";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
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
  // const userEditPermission = decoded?.editPermission;
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }

  if (userRole !== "admin" && userRole !== "owner" && userRole !== "stockist") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }
  try {
    await dbConnect();

    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const multiple = searchParams.get("multiple") === "1";

    if (multiple) {
      const { ids = [] } = body || {};
      if (!Array.isArray(ids) || !ids.length) {
        return NextResponse.json(
          { success: false, message: "No ids provided" },
          { status: 400 }
        );
      }

      const images = await FileAssets.find({ _id: { $in: ids } });

      if (!images.length) {
        return NextResponse.json(
          { success: false, message: "No matching images found" },
          { status: 404 }
        );
      }

      for (const image of images) {
        try {
          const filePath = path.join(process.cwd(), image.filepath);
          await fs.access(filePath);
          await fs.unlink(filePath);
        } catch (err) {
          console.warn(`File for ${image._id} missing, skipping`);
        }
      }

      await FileAssets.deleteMany({ _id: { $in: ids } });

      return NextResponse.json({
        success: true,
        message: `Deleted ${images.length} images`,
      });
    }

    const { id } = body || {};

    const image = await FileAssets.findById(id);
    if (!image)
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );

    const filePath = path.join(process.cwd(), image.filepath);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (err) {
      console.warn("File doesn't exist or already deleted.");
      return NextResponse.json(
        { success: false, message: "File doesn't exist or already deleted." },
        { status: 404 }
      );
    }

    await FileAssets.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (err) {
    console.error("DELETE ERROR", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
