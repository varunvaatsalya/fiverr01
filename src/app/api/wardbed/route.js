import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import { Bed, Ward } from "../../models/WardsBeds";

// function generateUID() {
//   const prefix = "DT";
//   const timestamp = Math.floor(Date.now() / 1000).toString(); // Current timestamp in seconds
//   const uniqueID = `${prefix}${timestamp}`;
//   return uniqueID;
// }

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

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  //   const userEditPermission = decoded.editPermission;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }

  try {
    let wardBeds = await Ward.find()
      .sort({ _id: -1 })
      .populate({
        path: "beds",
        select: "bedName isOccupied price occupancy",
        populate: {
          path: "occupancy.patientId",
          select: "uhid name",
        },
      })
      .exec();

    return NextResponse.json({ wardBeds, success: true }, { status: 200 });
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

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. admins only.", success: false },
      { status: 403 }
    );
  }

  const { name, beds } = await req.json();

  try {
    const bedNames = beds.map((bed) => bed.bedName);
    if (new Set(bedNames).size !== bedNames.length) {
      return NextResponse.json(
        { message: "Bed Name Must be diffrent", success: false },
        { status: 400 }
      );
    }

    const existingWard = await Ward.findOne({ name });
    if (existingWard) {
      return NextResponse.json(
        { message: "Ward already exists", success: false },
        { status: 200 }
      );
    }

    // Generate a 6-digit UID
    // const uid = generateUID();

    // Create new user
    const newWard = new Ward({ name }); // Save the ward first to get its ID
    await newWard.save(); // Create and save beds associated with the new ward
    const bedPromises = beds.map((bed) => {
      return new Bed({
        ward: newWard._id,
        bedName: bed.bedName,
        isOccupied: false,
        price: bed.price || 0,
        occupancy: {
          patientId: null,
          admissionId: null,
          startDate: null // Any additional notes on occupancy (optional)
        }
      }).save();
    });
    const savedBeds = await Promise.all(bedPromises); // Update the ward with the saved beds
    newWard.beds = savedBeds.map((bed) => bed._id);
    await newWard.save();

    const wardbed = await Ward.findById(newWard._id).populate({
      path: "beds",
      select: "bedName isOccupied price",
    });

    // Send response with UID
    return NextResponse.json({ wardbed, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

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

  const decoded = await verifyToken(token.value);
  const userRole = decoded.role;
  if (!decoded || !userRole) {
    return NextResponse.json(
      { message: "Invalid token.", success: false },
      { status: 403 }
    );
  }
  if (userRole !== "admin") {
    return NextResponse.json(
      { message: "Access denied. Admins only.", success: false },
      { status: 403 }
    );
  }

  const { name, beds, _id } = await req.json();

  try {
    const bedNames = beds.map((bed) => bed.bedName);
    if (new Set(bedNames).size !== bedNames.length) {
      return NextResponse.json(
        { message: "Bed Name Must be diffrent", success: false },
        { status: 400 }
      );
    }
    const ward = await Ward.findById(_id);
    if (!ward) {
      return NextResponse.json(
        { message: "Ward not found.", success: false },
        { status: 400 }
      );
    }

    const bedPromises = beds.map((bed) => {
      if (bed._id) {
        // Update existing bed
        return Bed.findByIdAndUpdate(
          bed._id,
          {
            bedName: bed.bedName,
            isOccupied: bed.isOccupied,
            price: bed.price,
          },
          { new: true }
        );
      } else {
        // Create new bed
        return new Bed({
          ward: _id,
          bedName: bed.bedName,
          isOccupied: bed.isOccupied || false,
          price: bed.price || 0,
          occupancy: {
            patientId: null,
            admissionId: null,
            startDate: null // Any additional notes on occupancy (optional)
          }
        }).save();
      }
    });
    const updatedBeds = await Promise.all(bedPromises);
    // Update the ward with the new and updated beds
    ward.name = name;
    ward.beds = updatedBeds.map((bed) => bed._id);
    await ward.save();
    // Populate the beds in the response
    const updatedWard = await Ward.findById(_id).populate({
      path: "beds",
      select: "bedName isOccupied price",
    });

    // Send response with UID
    return NextResponse.json({ updatedWard, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
