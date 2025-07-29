import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import Medicine from "../../models/Medicine";

export async function GET(req) {
  await dbConnect();
  let sellRecord = req.nextUrl.searchParams.get("sellRecord");
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

    if (sellRecord === "1") {
      response = await Medicine.find(
        {},
        { name: 1, _id: 1, avgMonthlyBoxes: 1 }
      ).sort({ name: 1 });

      return NextResponse.json(
        {
          records: response,
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
  if (userRole !== "admin" && userRole !== "stockist") {
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
  // const userEditPermission = decoded?.editPermission;
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

  const {
    id,
    godownMinQty,
    godownMaxQty,
    retailsMinQty,
    retailsMaxQty,
    sectionType,
    medicines,
  } = await req.json();

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
    } else if (
      id &&
      (retailsMinQty !== undefined ||
        godownMinQty !== undefined ||
        retailsMaxQty !== undefined ||
        godownMaxQty !== undefined)
    ) {
      const existingMedicine = await Medicine.findById(id).select({
        minimumStockCount: 1,
        maximumStockCount: 1,
        minimumHospitalStockCount: 1,
        maximumHospitalStockCount: 1,
      });

      if (!existingMedicine) {
        return NextResponse.json(
          { success: false, message: "Medicine not found." },
          { status: 404 }
        );
      }

      // Validation: retails
      const existingRetailMin =
        sectionType === "hospital"
          ? existingMedicine.minimumHospitalStockCount?.retails ?? 0
          : existingMedicine.minimumStockCount?.retails ?? 0;

      const existingRetailMax =
        sectionType === "hospital"
          ? existingMedicine.maximumHospitalStockCount?.retails ?? 0
          : existingMedicine.maximumStockCount?.retails ?? 0;

      const newRetailMin = retailsMinQty ?? existingRetailMin;
      const newRetailMax = retailsMaxQty ?? existingRetailMax;

      if (
        newRetailMin !== undefined &&
        newRetailMax !== undefined &&
        newRetailMax < newRetailMin
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Retail max quantity cannot be less than min quantity.",
          },
          { status: 400 }
        );
      }

      // Validation: godown
      const existingGodownMin =
        sectionType === "hospital"
          ? existingMedicine.minimumHospitalStockCount?.godown ?? 0
          : existingMedicine.minimumStockCount?.godown ?? 0;

      const existingGodownMax =
        sectionType === "hospital"
          ? existingMedicine.maximumHospitalStockCount?.godown ?? 0
          : existingMedicine.maximumStockCount?.godown ?? 0;

      const newGodownMin = godownMinQty ?? existingGodownMin;
      const newGodownMax = godownMaxQty ?? existingGodownMax;

      if (
        newGodownMin !== undefined &&
        newGodownMax !== undefined &&
        newGodownMax < newGodownMin
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Godown max quantity cannot be less than min quantity.",
          },
          { status: 400 }
        );
      }

      let updateFields = {};

      const minPrefix =
        sectionType === "hospital"
          ? "minimumHospitalStockCount"
          : "minimumStockCount";
      const maxPrefix =
        sectionType === "hospital"
          ? "maximumHospitalStockCount"
          : "maximumStockCount";

      if (retailsMinQty !== undefined) {
        updateFields[`${minPrefix}.retails`] = retailsMinQty;
      }

      if (godownMinQty !== undefined) {
        updateFields[`${minPrefix}.godown`] = godownMinQty;
      }

      if (retailsMaxQty !== undefined) {
        updateFields[`${maxPrefix}.retails`] = retailsMaxQty;
      }

      if (godownMaxQty !== undefined) {
        updateFields[`${maxPrefix}.godown`] = godownMaxQty;
      }

      const updatedMedicine = await Medicine.findOneAndUpdate(
        { _id: id },
        { $set: updateFields },
        { new: true }
      );

      return NextResponse.json(
        {
          medicine: updatedMedicine,
          message: "Stock count updated successfully!",
          success: true,
        },
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
