import Counters from "../models/Counters";
import dbConnect from "../lib/Mongodb";

export async function generateUniqueId(entityType) {
  await dbConnect();
  const now = new Date();
  const todayDate = `${now.getFullYear().toString().slice(-2)}${(
    now.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

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
  } else {
    throw new Error(
      "Invalid entityType. Must be 'prescription', 'patient', or 'report'."
    );
  }

  await record.save();

  return uniqueId;
}
