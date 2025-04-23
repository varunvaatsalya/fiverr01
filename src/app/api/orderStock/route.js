import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import OrderHistory from "../../models/OrderHistory";
import Medicine from "../../models/Medicine";

export async function GET(req) {
  await dbConnect();

  let info = req.nextUrl.searchParams.get("info");
  let page = req.nextUrl.searchParams.get("page");

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
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }

  try {
    if (info === "1" && page) {
      page = parseInt(page) || 1;
      const limit = 50;
      const skip = (page - 1) * limit;
      const orderHistory = await OrderHistory.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const totalOrderHistory = await OrderHistory.countDocuments();
      return NextResponse.json(
        {
          orderHistory,
          totalPages: Math.ceil(totalOrderHistory / limit),
          success: true,
        },
        { status: 200 }
      );
    }
    const medicinesWithStock = await Medicine.aggregate([
      // {
      //   $match: { _id: new mongoose.Types.ObjectId(id) },
      // },
      {
        $lookup: {
          from: "stocks",
          localField: "_id",
          foreignField: "medicine",
          as: "stocks",
        },
      },
      {
        $addFields: {
          totalBoxes: {
            $sum: "$stocks.quantity.boxes",
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          manufacturer: 1,
          medicineType: 1,
          "minimumStockCount.godown": 1,
          totalBoxes: 1,
          stockOrderInfo: 1,
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    return NextResponse.json(
      {
        medicinesWithStock,
        message:
          medicinesWithStock.length > 0
            ? "Medicines fetched successfully"
            : "No Medicine found.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
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
  // if (userRole !== "admin") {
  //   return NextResponse.json(
  //     { message: "Access denied. Admins only.", success: false },
  //     { status: 403 }
  //   );
  // }
  const { to, mrName, contact, medicines } = await req.json();

  try {
    console.log(to, mrName, contact, medicines);
    if (!to || !contact) {
      return NextResponse.json(
        {
          message: "Name or contact is blank",
          success: false,
        },
        { status: 400 }
      );
    }

    const invalidMedicines = medicines.filter(
      (medicine) => !medicine.name || !medicine.quantity
    );

    if (invalidMedicines.length > 0) {
      return NextResponse.json(
        {
          message: "Some medicines have blank name or quantity",
          success: false,
        },
        { status: 400 }
      );
    }

    // Create new user
    const newHistory = new OrderHistory({
      to,
      mrName,
      contact,
      medicines,
    });

    // Save History to the database
    await newHistory.save();

    for (const med of medicines) {
      if (!med.medicineId || !med.quantity) continue;

      await Medicine.findByIdAndUpdate(med.medicineId, {
        stockOrderInfo: {
          quantity: med.quantity,
          orderedAt: new Date(),
        },
      });
    }

    // Send response with UID
    return NextResponse.json(
      { message: "Order recorded successfully!", success: true },
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
