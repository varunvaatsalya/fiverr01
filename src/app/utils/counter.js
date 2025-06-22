import Counters from "../models/Counters";
import dbConnect from "../lib/Mongodb";
import PharmacyInvoice from "../models/PharmacyInvoice";
import Prescriptions from "../models/Prescriptions";
import Admissions from "../models/Admissions";
import { Patients } from "../models";

const ENTITY_CONFIG = {
  prescription: {
    model: Prescriptions,
    counterField: "prescriptionCounter",
    padLength: 3,
  },
  pharmacyInvoice: {
    model: PharmacyInvoice,
    counterField: "pharmacyInvoiceCounter",
    padLength: 3,
  },
  ipd: {
    model: Admissions,
    counterField: "ipdCounter",
    padLength: 2,
  },
  patient: {
    model: Patients,
    counterField: "patientCounter",
    padLength: 3,
  },
  report: {
    model: Prescriptions,
    counterField: "reportCounter",
    padLength: 3,
  },
};

export async function generateUniqueId(entityType, anyDate = null) {
  await dbConnect();

  const config = ENTITY_CONFIG[entityType];
  if (!config) {
    throw new Error(
      `Invalid entityType. Must be one of: ${Object.keys(ENTITY_CONFIG).join(
        ", "
      )}`
    );
  }

  const now = new Date(anyDate || Date.now());

  const todayDate = `${now.getFullYear().toString().slice(-2)}${(
    now.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

  if (anyDate) {
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    let query = {
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    };

    if (entityType === "report") {
      query.tests = {
        $elemMatch: {
          isCompleted: true,
        },
      };
    }

    const count = await config.model.countDocuments(query);

    return `${todayDate}${String(count + 1).padStart(config.padLength, "0")}`;
  }

  let record = await Counters.findOneAndUpdate(
    {},
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (record.date !== todayDate) {
    record.date = todayDate;
    // reset all counters on new day
    for (const key in ENTITY_CONFIG) {
      const field = ENTITY_CONFIG[key].counterField;
      record[field] = 1;
    }
  }

  const counterValue = record[config.counterField] || 1;

  const uniqueId = `${record.date}${String(counterValue).padStart(
    config.padLength,
    "0"
  )}`;

  record[config.counterField] = counterValue + 1;
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
