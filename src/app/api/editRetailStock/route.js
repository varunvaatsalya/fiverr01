import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/Mongodb";
import { verifyTokenWithLogout } from "@/app/utils/jwt";
import Medicine from "@/app/models/Medicine";
import RetailStock from "@/app/models/RetailStock";

export async function GET(req) {
  await dbConnect();
  let letter = req.nextUrl.searchParams.get("letter");

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
  // console.log(userRole, userEditPermission);
  if (!decoded || !userRole) {
    let res = NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
    res.cookies.delete("authToken");
    return res;
  }
  if (
    (userRole !== "admin" && userRole !== "stockist") ||
    !userEditPermission
  ) {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  try {
    let finalStockList = await Medicine.aggregate([
      {
        $match: { name: { $regex: `^${letter || "A"}`, $options: "i" } },
      },
      {
        $sort: { name: 1 },
      },
      {
        $lookup: {
          from: "retailstocks", // collection ka naam exactly jo DB me hai
          localField: "_id",
          foreignField: "medicine",
          as: "stocksData",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          isTablets: 1,
          stocks: {
            $ifNull: [{ $arrayElemAt: ["$stocksData.stocks", 0] }, []],
          },
        },
      },
    ]);

    return NextResponse.json(
      { stocks: finalStockList, userEditPermission, success: true },
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
  if (userRole !== "admin" && userRole !== "stockist") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { editedMedicineStocks } = await req.json();

  try {
    let missingFieldsMedicines = [];

    for (const medicineStock of editedMedicineStocks) {
      if (!medicineStock.stocks) {
        missingFieldsMedicines.push(medicineStock.name);
        continue;
      }

      let isValid = true;

      medicineStock.stocks.forEach((stock) => {
        if (
          !stock.batchName ||
          !stock.expiryDate ||
          !stock.packetSize?.strips ||
          !stock.packetSize?.tabletsPerStrip ||
          stock.quantity?.totalStrips === undefined ||
          stock.quantity.tablets === undefined ||
          !stock.purchasePrice ||
          !stock.sellingPrice
        ) {
          isValid = false;
        }

        // Calculate totalStrips
        stock.quantity.boxes = Math.floor(
          stock.quantity.totalStrips / stock.packetSize.strips
        );
        stock.quantity.extra =
          stock.quantity.totalStrips % stock.packetSize.strips;
      });

      if (!isValid) {
        missingFieldsMedicines.push(medicineStock.name);
        continue;
      }

      // Update or Insert the retail stock
      const updatedStock = await RetailStock.findOneAndUpdate(
        { medicine: medicineStock._id },
        { $set: { stocks: medicineStock.stocks } },
        { new: true }
      );

      if (!updatedStock) {
        missingFieldsMedicines.push(medicineStock.name);
      }
    }

    if (missingFieldsMedicines.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Following medicines have missing stock fields: ${missingFieldsMedicines.join(
            ", "
          )}. Please refresh the page.`,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Updated Successfully!", success: true },
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
