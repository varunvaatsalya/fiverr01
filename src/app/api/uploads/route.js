import { NextResponse } from "next/server";
import dbConnect from "../../lib/Mongodb";
import { verifyTokenWithLogout } from "../../utils/jwt";
import { Manufacturer, Salt, Vendor } from "../../models/MedicineMetaData";
import Medicine from "../../models/Medicine";
import { Stock } from "../../models/Stock";
import RetailStock from "../../models/RetailStock";

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
    let resultMessage = [];
    if (type === "Manufacturer") {
      const result = await Manufacturer.insertMany(
        data.map((name) => ({ name })),
        { ordered: false }
      );
      resultMessage.push({
        info: `Manufacturer data updated successfully. Inserted Count: ${result.insertedCount}`,
        success: true,
      });
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
          resultMessage.push({
            info: `Vendor ${vendor.Vendor} processed successfully.`,
            success: true,
          });
        } catch (error) {
          resultMessage.push({
            info: `Error processing vendor ${vendor.Vendor}`,
            success: false,
          });
        }
      }
    } else if (type === "Salts") {
      const result = await Salt.insertMany(
        data.map((name) => ({ name })),
        { ordered: false }
      );
      resultMessage.push({
        info: `Salts data updated successfully. Inserted Count: ${result.insertedCount}`,
        success: true,
      });
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
            resultMessage.push({
              info: `Medicine ${medicine.Name} already exists. Skipped...`,
              success: false,
            });
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
          resultMessage.push({
            info: `Medicine ${medicine.Name} processed successfully.`,
            success: true,
          });
        } catch (error) {
          resultMessage.push({
            info: `Error inserting ${medicine.Name}`,
            success: false,
          });
          console.log(error);
        }
      }
    } else if (type === "Stocks") {
      for (let stock of data) {
        if (!stock.Name) continue;
        try {
          const medicine = await Medicine.findOne({ name: stock.Name });
          if (!medicine) {
            resultMessage.push({
              info: `${stock.Name} Not found`,
              success: false,
            });
            continue;
          }
          // if (!stock.Expiry || isNaN(new Date(stock.Expiry).getTime())) {
          //   resultMessage.push({info:`Skipped for wrong Expiry Date for ${stock.Name}`, success:false});
          //   continue;
          // }

          let stripsPerBox = medicine.packetSize.strips;
          let totalStrips = stock.Stock || 0;
          let boxes = Math.floor(totalStrips / stripsPerBox) || 0;
          let extra = totalStrips % stripsPerBox || 0;
          // let stripsPerBox = medicine.packetSize.strips;
          // let totalStrips = stock.Stock ? stock.Stock * stripsPerBox : 0;

          const existingStock = await Stock.findOne({
            medicine: medicine._id,
          });

          let defaultExpiry = () => {
            let date = new Date();
            date.setMonth(date.getMonth() - 6);
            return date;
          };

          if (existingStock) {
            // Update existing stock
            existingStock.quantity.boxes = boxes || 0;
            existingStock.quantity.totalStrips = totalStrips || 0;
            existingStock.quantity.extra = extra || 0;
            existingStock.expiryDate = stock.Expiry || defaultExpiry();
            existingStock.initialQuantity.boxes = boxes || 0;
            existingStock.initialQuantity.totalStrips = totalStrips || 0;
            existingStock.initialQuantity.extra = extra || 0;
            existingStock.purchasePrice = stock.PRate ? stock.PRate : 0;
            existingStock.sellingPrice = stock.MRP ? stock.MRP : 0;
            existingStock.totalAmount = stock.PRate * totalStrips;
            existingStock.invoiceId = stock.Invoice || "N/A";

            await existingStock.save();
            resultMessage.push({
              info: `Updated stock for ${stock.Name}`,
              success: true,
            });
          } else {
            // Create new stock entry
            const stocks = new Stock({
              medicine: medicine._id,
              batchName: stock.Batch || "N/A",
              expiryDate: stock.Expiry || defaultExpiry(),
              quantity: { boxes, extra, totalStrips },
              initialQuantity: { boxes, extra, totalStrips },
              purchasePrice: stock.PRate ? stock.PRate : 0,
              sellingPrice: stock.MRP ? stock.MRP : 0,
              totalAmount: stock.PRate * totalStrips,
              invoiceId: stock.Invoice || "N/A",
            });

            await stocks.save();
            resultMessage.push({
              info: `Inserted new stock for ${stock.Name}`,
              success: true,
            });
          }
        } catch (error) {
          resultMessage.push({
            info: `Error processing ${stock.Name}`,
            success: false,
          });
          console.error(`Error processing ${stock.Name}: ${error}`);
        }
      }
    } else if (type === "RetailStocks") {
      for (let stock of data) {
        if (!stock.Name) continue;
        try {
          const medicine = await Medicine.findOne({ name: stock.Name });

          if (!medicine) {
            resultMessage.push({
              info: `${stock.Name} Not found`,
              success: false,
            });
            continue;
          }
          // if (!stock.Expiry || isNaN(new Date(stock.Expiry).getTime())) {
          //   resultMessage.push({info:`Skipped for wrong Expiry Date for ${stock.Name}`, success:false});
          //   continue;
          // }

          let stripsPerBox = medicine.packetSize.strips;
          let totalStrips = stock.Unit ? stock.Unit : 0;
          let boxes = Math.floor(totalStrips / stripsPerBox);
          let extra = totalStrips % stripsPerBox;

          const existingStock = await RetailStock.findOne({
            medicine: medicine._id,
          });

          let defaultExpiry = () => {
            let date = new Date();
            date.setMonth(date.getMonth() - 6);
            return date;
          };

          let data = {
            batchName: stock.Batch || "N/A",
            expiryDate: stock.Expiry || defaultExpiry(),
            packetSize: medicine.packetSize,
            quantity: {
              boxes,
              extra,
              tablets: medicine.isTablets ? stock.Tablets || 0 : 0,
              totalStrips,
            },
            purchasePrice: stock.PRate,
            sellingPrice: stock.MRP,
          };

          if (existingStock && existingStock.stocks) {
            const existing = existingStock.stocks[0]; // Assuming one entry per medicine
            const mergedData = {
              batchName: stock.Batch || existing.batchName,
              expiryDate: stock.Expiry || existing.expiryDate,
              packetSize: existing.packetSize,
              quantity: {
                boxes: boxes || existing.quantity.boxes,
                extra: extra || existing.quantity.extra,
                tablets: stock.Tablets || existing.quantity.tablets,
                totalStrips: totalStrips || existing.quantity.totalStrips,
              },
              purchasePrice: stock.PRate || existing.purchasePrice,
              sellingPrice: stock.MRP || existing.sellingPrice,
            };
            existingStock.stocks = [mergedData];
            await existingStock.save();
            resultMessage.push({
              info: `Updated stock for ${stock.Name}`,
              success: true,
            });
          } else {
            // Create new stock entry
            const stocks = new RetailStock({
              medicine: medicine._id,
              stocks: [data],
            });

            await stocks.save();
            resultMessage.push({
              info: `Inserted new stock for ${stock.Name}`,
              success: true,
            });
          }
        } catch (error) {
          resultMessage.push({
            info: `Error processing ${stock.Name}`,
            success: false,
          });
          console.error(`Error processing ${stock.Name}: ${error}`);
        }
      }
    } else if (type === "StocksQty") {
      // Step 1: Prepare input map for quick access
      //   const inputMap = new Map();
      //   for (const stock of data) {
      //     if (stock.Name && stock.Batch) {
      //       inputMap.set(`${stock.Name}|${stock.Batch}`, {
      //         ...stock,
      //         processed: false,
      //       });
      //     }
      //   }

      //   // Step 2: Get all stocks and populate medicine
      //   const allStocks = await Stock.find({}).populate("medicine");

      //   // Step 3: Process & build bulk update ops
      //   const bulkOps = [];

      //   for (const stock of allStocks) {
      //     if (!stock.medicine || !stock.medicine.name) continue;

      //     const key = `${stock.medicine.name}|${stock.batchName}`;
      //     const matched = inputMap.get(key);

      //     if (matched && !matched.processed) {
      //       // Calculate new quantities
      //       const totalStrips = Number(matched.Qty);
      //       const stripsPerBox = stock.medicine.packetSize?.strips || 1;

      //       if (isNaN(totalStrips)) {
      //         resultMessage.push({
      //           info: `Invalid Qty for ${matched.Name}, Batch ${matched.Batch}`,
      //           success: false,
      //         });
      //         continue;
      //       }

      //       const boxes = Math.floor(totalStrips / stripsPerBox);
      //       const extra = totalStrips % stripsPerBox;

      //       bulkOps.push({
      //         updateOne: {
      //           filter: { _id: stock._id },
      //           update: {
      //             $set: {
      //               "quantity.totalStrips": totalStrips,
      //               "quantity.boxes": boxes,
      //               "quantity.extra": extra,
      //             },
      //           },
      //         },
      //       });

      //       resultMessage.push({
      //         info: `Updated stock for ${matched.Name}, Batch ${matched.Batch}`,
      //         success: true,
      //       });

      //       matched.processed = true;
      //     } else {
      //       // Zero out unmatched stocks
      //       bulkOps.push({
      //         updateOne: {
      //           filter: { _id: stock._id },
      //           update: {
      //             $set: {
      //               "quantity.totalStrips": 0,
      //               "quantity.boxes": 0,
      //               "quantity.extra": 0,
      //             },
      //           },
      //         },
      //       });
      //     }
      //   }

      //   // Step 4: Apply all updates in bulk
      //   if (bulkOps.length > 0) {
      //     await Stock.bulkWrite(bulkOps);
      //   }

      //   // Step 5: Log unmatched input entries
      //   for (const [key, entry] of inputMap.entries()) {
      //     if (!entry.processed) {
      //       resultMessage.push({
      //         info: `Medicine or Batch not found for ${entry.Name}, Batch ${entry.Batch}`,
      //         success: false,
      //       });
      //     }
      //   }

      const inputMap = new Map();
      for (const stock of data) {
        if (stock.Name && stock.Batch) {
          inputMap.set(`${stock.Name}|${stock.Batch}`, {
            ...stock,
            processed: false,
          });
        }
      }

      // Step 1: Get all stocks
      const allStocks = await Stock.find({}).populate("medicine");

      const bulkOps = [];
      const zeroedStockMap = new Map(); // To collect zeroed stocks by medicine name
      const updatedStockIds = new Set(); // Prevent re-updates

      // Step 2: Phase 1 – Try to match by batch
      for (const stock of allStocks) {
        const medName = stock.medicine?.name;
        const batchName = stock.batchName;
        if (!medName || !batchName) continue;

        const key = `${medName}|${batchName}`;
        const matched = inputMap.get(key);

        if (matched && !matched.processed) {
          const totalStrips = Number(matched.Qty);
          const stripsPerBox = stock.medicine.packetSize?.strips || 1;

          if (isNaN(totalStrips)) {
            resultMessage.push({
              info: `Invalid Qty for ${matched.Name}, Batch ${matched.Batch}`,
              success: false,
            });
            continue;
          }

          const boxes = Math.floor(totalStrips / stripsPerBox);
          const extra = totalStrips % stripsPerBox;

          bulkOps.push({
            updateOne: {
              filter: { _id: stock._id },
              update: {
                $set: {
                  "quantity.totalStrips": totalStrips,
                  "quantity.boxes": boxes,
                  "quantity.extra": extra,
                },
              },
            },
          });

          resultMessage.push({
            info: `Updated stock for ${matched.Name}, Batch ${matched.Batch}`,
            success: true,
          });

          matched.processed = true;
          updatedStockIds.add(stock._id.toString());
        } else {
          // Phase 1: Temporarily zero the stock, but save it to use later
          bulkOps.push({
            updateOne: {
              filter: { _id: stock._id },
              update: {
                $set: {
                  "quantity.totalStrips": 0,
                  "quantity.boxes": 0,
                  "quantity.extra": 0,
                },
              },
            },
          });

          if (!zeroedStockMap.has(medName)) zeroedStockMap.set(medName, []);
          zeroedStockMap.get(medName).push(stock);
        }
      }

      // Step 3: Phase 2 – Handle unmatched input entries
      for (const [key, entry] of inputMap.entries()) {
        if (entry.processed) continue;

        const stocks = zeroedStockMap.get(entry.Name);
        if (!stocks || stocks.length === 0) {
          resultMessage.push({
            info: `Medicine found but no usable stock for ${entry.Name}, Batch ${entry.Batch}`,
            success: false,
          });
          continue;
        }

        // Pick stock with nearest expiry
        const unupdated = stocks.filter(
          (s) => !updatedStockIds.has(s._id.toString())
        );
        if (unupdated.length === 0) {
          resultMessage.push({
            info: `All stock entries already used for ${entry.Name}, Batch ${entry.Batch}`,
            success: false,
          });
          continue;
        }

        const chosen = unupdated.sort(
          (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
        )[0];

        const totalStrips = Number(entry.Qty);
        const stripsPerBox = chosen.medicine.packetSize?.strips || 1;

        if (isNaN(totalStrips)) {
          resultMessage.push({
            info: `Invalid Qty for ${entry.Name}, Batch ${entry.Batch}`,
            success: false,
          });
          continue;
        }

        const boxes = Math.floor(totalStrips / stripsPerBox);
        const extra = totalStrips % stripsPerBox;

        bulkOps.push({
          updateOne: {
            filter: { _id: chosen._id },
            update: {
              $set: {
                "quantity.totalStrips": totalStrips,
                "quantity.boxes": boxes,
                "quantity.extra": extra,
              },
            },
          },
        });

        resultMessage.push({
          info: `Batch ${entry.Batch} not found; updated ${entry.Name} stock with Batch ${chosen.batchName}`,
          success: true,
        });

        updatedStockIds.add(chosen._id.toString());
        entry.processed = true;
      }

      // Step 4: Apply all updates
      if (bulkOps.length > 0) {
        await Stock.bulkWrite(bulkOps);
      }

      // Step 5: Final unmatched logs
      for (const [key, entry] of inputMap.entries()) {
        if (!entry.processed) {
          resultMessage.push({
            info: `No stock found for ${entry.Name}, Batch ${entry.Batch}`,
            success: false,
          });
        }
      }
    }

    return NextResponse.json(
      {
        message: "Documents inserted successfully.",
        result: resultMessage,
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
