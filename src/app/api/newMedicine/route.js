import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Medicine from "../../models/Medicine";
import PurchaseInvoice from "../../models/PurchaseInvoice";

export async function GET(req) {
  await dbConnect();
  let basicInfo = req.nextUrl.searchParams.get("basicInfo");
  let ids = req.nextUrl.searchParams.get("ids");
  let id = req.nextUrl.searchParams.get("id");

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

  try {
    let response = {};
    if (basicInfo === "1") {
      response = await Medicine.find()
        .sort({ name: 1 })
        .populate({
          path: "manufacturer",
        })
        .populate({
          path: "salts",
        });

      let ids = await PurchaseInvoice.find(
        { isPaid: false },
        "_id invoiceNumber manufacturer vendor"
      )
        .sort({ _id: -1 })
        .populate({
          path: "manufacturer",
          select: "name",
        })
        .populate({
          path: "vendor",
          select: "name",
        })
        .exec();

      return NextResponse.json(
        {
          response,
          ids,
          success: true,
        },
        { status: 200 }
      );
    }

    if (id) {
      response = await Medicine.findById(id);

      return NextResponse.json(
        {
          response,
          success: true,
        },
        { status: 200 }
      );
    }

    if (ids === "1") {
      response = await Medicine.find({}, { name: 1, _id: 1 }).sort({ name: 1 });

      return NextResponse.json(
        {
          response,
          success: true,
        },
        { status: 200 }
      );
    }

    response = await Medicine.find()
      .sort({ name: 1 })
      .populate({
        path: "manufacturer",
      })
      .populate({
        path: "salts",
      });

    return NextResponse.json(
      {
        response,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching details:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  // let manufacturer = req.nextUrl.searchParams.get("manufacturer");

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
  const { medicines } = await req.json();

  try {
    let savedMedicines = [];

    for (const med of medicines) {
      const { name, manufacturer, medicineType, packetSize, isTablets, salts } =
        med;

      // Ensure tabletsPerStrip is not empty, default to 1
      const finalPacketSize = {
        strips: packetSize?.strips || 0,
        tabletsPerStrip: packetSize?.tabletsPerStrip || 1,
      };

      let newMedicine = new Medicine({
        name,
        manufacturer,
        packetSize: finalPacketSize,
        isTablets,
        medicineType,
        salts,
      });

      await newMedicine.save();
      savedMedicines.push({
        name,
        success: true,
        message: `${name} saved successfully`,
      });
    }

    return NextResponse.json(
      {
        medicines: savedMedicines,
        message: "Medicine Saved Successfully!",
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

export async function PUT(req) {
  // let minqty = req.nextUrl.searchParams.get("minqty");

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
  // if (userRole !== "admin") {
  //   return NextResponse.json(
  //     { message: "Access denied. admins only.", success: false },
  //     { status: 403 }
  //   );
  // }

  const { id, godownMinQty, retailsMinQty, medicines } = await req.json();

  try {
    let updatedMedicines = [];

  if (medicines && Array.isArray(medicines)) {
    // Multiple medicines update
    for (const med of medicines) {
      const {
        id,
        name,
        manufacturer,
        medicineType,
        packetSize,
        isTablets,
        salts,
      } = med;

      // Ensure packetSize.tabletsPerStrip is always at least 1
      if (!packetSize?.tabletsPerStrip) {
        packetSize.tabletsPerStrip = 1;
      }

      let updateFields = {
        name,
        manufacturer,
        packetSize,
        medicineType,
        isTablets,
        salts,
      };

      let updatedMedicine = await Medicine.findOneAndUpdate(
        { _id: id },
        { $set: updateFields },
        { new: true, upsert: true }
      );

      updatedMedicines.push({
        updatedMedicine,
        success: true,
        message: `${name} updated successfully`,
      });
    }

    return NextResponse.json(
      { medicines: updatedMedicines, success: true },
      { status: 201 }
    );
  } else if (id && (godownMinQty !== undefined || retailsMinQty !== undefined)) {
    // Only stock count update
    let updateFields = {
      "minimumStockCount.retails": retailsMinQty,
      "minimumStockCount.godown": godownMinQty,
    };

    let medicine = await Medicine.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json(
      { medicine, message: "Stock count updated successfully!", success: true },
      { status: 201 }
    );
  }

  return NextResponse.json(
    { message: "Invalid request data", success: false },
    { status: 400 }
  );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
