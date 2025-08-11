import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Medicine from "../../models/Medicine";
import RetailStock from "../../models/RetailStock";

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
    let allMedicines = await Medicine.find({}, "_id name isTablets").sort({
      name: 1,
    });
    let retailStocks = await RetailStock.find().populate({
      path: "medicine",
      select: "_id name isTablets",
    });
    let stockMap = new Map(
      retailStocks.map((stock) => [stock.medicine._id.toString(), stock])
    );

    // Step 4: Create the final list with the same structure as RetailStock.find()
    let finalStockList = allMedicines.map((med) => {
      return (
        stockMap.get(med._id.toString()) || {
          medicine: { _id: med._id, name: med.name, isTablets: med.isTablets }, // Include medicine name
          stocks: [],
        }
      );
    });
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

  const { data } = await req.json();

  try {
    // for (const medicineStock of data) {
    //   medicineStock.stocks.forEach((stock) => {
    //     stock.quantity.totalStrips =
    //       stock.quantity.boxes * stock.packetSize.strips + stock.quantity.extra;
    //   });

    //   await RetailStock.findOneAndUpdate(
    //     { medicine: medicineStock.medicine },
    //     { stocks: medicineStock.stocks },
    //     { upsert: true, new: true }
    //   );
    // }
    let missingFieldsMedicines = [];

    for (const medicineStock of data) {
      // Check if stocks exist and have all required fields
      if (!medicineStock.stocks || medicineStock.stocks.length === 0) {
        missingFieldsMedicines.push(medicineStock.medicine.name);
        continue;
      }

      let isValid = true;

      medicineStock.stocks.forEach((stock) => {
        // Check if all required fields exist
        // console.log(stock, 111);
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
        missingFieldsMedicines.push(medicineStock.medicine.name);
        continue;
      }

      // Update or Insert the retail stock
      await RetailStock.findOneAndUpdate(
        { medicine: medicineStock.medicine._id },
        { medicine: medicineStock.medicine, stocks: medicineStock.stocks },
        { upsert: true, new: true }
      );
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
