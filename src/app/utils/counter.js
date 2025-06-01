import Counters from "../models/Counters";
import dbConnect from "../lib/Mongodb";
import PharmacyInvoice from "../models/PharmacyInvoice";
import Prescriptions from "../models/Prescriptions";

export async function generateUniqueId(entityType, anyDate = null) {
  await dbConnect();
  const now = new Date(anyDate || Date.now());
  const todayDate = `${now.getFullYear().toString().slice(-2)}${(
    now.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

  if (anyDate) {
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    let Model = entityType === "prescription" ? Prescriptions : PharmacyInvoice;

    const count = await Model.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    return `${todayDate}${String(count + 1).padStart(3, "0")}`;
  }

  let record = await Counters.findOneAndUpdate(
    {},
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (record.date !== todayDate) {
    record.date = todayDate;
    record.prescriptionCounter = 1;
    record.patientCounter = 1;
    record.reportCounter = 1;
    record.ipdCounter = 1;
    record.pharmacyInvoiceCounter = 1;
  }

  let uniqueId;

  if (entityType === "prescription") {
    uniqueId = `${record.date}${String(record.prescriptionCounter).padStart(
      3,
      "0"
    )}`;
    record.prescriptionCounter += 1;
  } else if (entityType === "patient") {
    uniqueId = `${record.date}${String(record.patientCounter).padStart(
      3,
      "0"
    )}`;
    record.patientCounter += 1;
  } else if (entityType === "report") {
    uniqueId = `${record.date}${String(record.reportCounter).padStart(3, "0")}`;
    record.reportCounter += 1;
  } else if (entityType === "ipd") {
    uniqueId = `${record.date}${String(record.ipdCounter).padStart(2, "0")}`;
    record.ipdCounter += 1;
  } else if (entityType === "pharmacyInvoice") {
    uniqueId = `${record.date}${String(record.pharmacyInvoiceCounter).padStart(
      3,
      "0"
    )}`;
    record.pharmacyInvoiceCounter += 1;
  } else {
    throw new Error(
      "Invalid entityType. Must be 'prescription', 'patient', or 'report'."
    );
  }

  await record.save();

  return uniqueId;
}

export function generateUID() {
  const now = new Date();

  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  let uniqueDigit = `${year}${month}${date}${hours}${minutes}${seconds}`;

  return uniqueDigit;
}
