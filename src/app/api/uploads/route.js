import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyToken } from "../../utils/jwt";
import { Manufacturer, Salt, Vendor } from "../../models/MedicineMetaData";
import Medicine from "../../models/Medicine";
import Stock from "../../models/Stock";

export async function POST(req) {
  let type = req.nextUrl.searchParams.get("type");

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

  //   if (userRole !== "admin" && userRole !== "pathologist") {
  //     return NextResponse.json(
  //       { message: "Access denied. admins only.", success: false },
  //       { status: 403 }
  //     );
  //   }

  async function findOrCreateModel(Model, name) {
    let doc = await Model.findOne({ name });
    if (!doc) {
      doc = new Model({ name });
      await doc.save();
    }
    return doc._id;
  }

  const { data } = await req.json();

  try {
    let message = [];
    if (type === "Manufacturer") {
      const result = await Manufacturer.insertMany(
        data.map((name) => ({ name })),
        { ordered: false }
      );
      message.push(
        {info:`Manufacturer data updated successfully. Inserted Count: ${result.insertedCount}`, success:true}
      );
    } else if (type === "Vendor") {
      for (let vendor of data) {
        if (!vendor.Vendor) continue;
        try {
          await Vendor.updateOne(
            { name: vendor.Vendor },
            {
              $set: {
                contact: vendor.Contact,
                address: vendor.Address,
                bank: vendor.Bank,
                acNo: vendor.AcNo,
                branch: vendor.Branch,
                ifsc: vendor.IFSC,
              },
            },
            { upsert: true }
          );
          message.push({info:`Vendor ${vendor.Vendor} processed successfully.`, success:true});
        } catch (error) {
          message.push({info:`Error processing vendor ${vendor.Vendor}`, success:false});
        }
      }
    } else if (type === "Salts") {
      const result = await Salt.insertMany(
        data.map((name) => ({ name })),
        { ordered: false }
      );
      message.push(
        {info:`Salts data updated successfully. Inserted Count: ${result.insertedCount}`, success:true}
      );
    } else if (type === "Medicine") {
      for (let medicine of data) {
        if (!medicine.Company || !medicine.Salt || !medicine.Name) continue;
        try {
          const manufacturerId = await findOrCreateModel(
            Manufacturer,
            medicine.Company
          );
          const saltId = await findOrCreateModel(Salt, medicine.Salt);

          const existingMedicine = await Medicine.findOne({
            name: medicine.Name,
            manufacturer: manufacturerId,
            salts: saltId,
          });

          if (existingMedicine) {
            message.push(
              {info:`Medicine ${medicine.Name} already exists. Skipped...`, success:false}
            );
            continue;
          }

          const medicineDocs = new Medicine({
            name: medicine.Name,
            manufacturer: manufacturerId,
            salts: saltId,
            isTablets: medicine.isTablets == 1 ? true : false,
            medicineType: medicine.medicineType || "N/A",
            packetSize: {
              strips: medicine.boxSize ? medicine.boxSize : 1,
              tabletsPerStrip: medicine.tabletsPerStrip
                ? medicine.tabletsPerStrip
                : 1,
            },
          });

          await medicineDocs.save();
          message.push({info:`Medicine ${medicine.Name} processed successfully.`, success:true});
        } catch (error) {
          message.push({info:`Error inserting ${medicine.Name}`, success:false});
          console.log(error)
        }
      }
    } else if (type === "Stocks") {
      for (let stock of data) {
        if (!stock.Name) continue;
        try {
          const medicine = await Medicine.findOne({ name: stock.Name });

          if (!stock.Expiry || isNaN(new Date(stock.Expiry).getTime())) {
            message.push({info:`Skipped for wrong Expiry Date for ${stock.Name}`, success:false});
            continue;
          }

          let stripsPerBox = medicine.packetSize.strips;
          let totalStrips = stock.Stock ? stock.Stock * stripsPerBox : 0;

          const existingStock = await Stock.findOne({
            medicine: medicine._id,
            batchName: stock.Batch || "N/A",
          });

          if (existingStock) {
            // Update existing stock
            existingStock.quantity.boxes = stock.Stock ? stock.Stock : 0;
            existingStock.quantity.totalStrips = totalStrips;
            existingStock.purchasePrice = stock.PRate ? stock.PRate : 0;
            existingStock.sellingPrice = stock.MRP ? stock.MRP : 0;
            await existingStock.save();
            message.push({info:`Updated stock for ${stock.Name}`, success:true});
          } else {
            // Create new stock entry
            const stocks = new Stock({
              medicine: medicine._id,
              batchName: stock.Batch || "N/A",
              expiryDate: stock.Expiry ? stock.Expiry : false,
              quantity: { boxes: stock.Stock ? stock.Stock : 0, totalStrips },
              purchasePrice: stock.PRate ? stock.PRate : 0,
              sellingPrice: stock.MRP ? stock.MRP : 0,
            });

            await stocks.save();
            message.push({info:`Inserted new stock for ${stock.Name}`, success:true});
          }
        } catch (error) {
          message.push({info:`Error processing ${stock.Name}`, success:false});
          console.error(`Error processing ${stock.Name}: ${error}`);
        }
      }
    }

    return NextResponse.json(
      {
        message: message ? message : "Documents inserted successfully.",
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
