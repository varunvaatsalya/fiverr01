// // /lib/startLogDump.ts
// import LogModel from "@/app/models/LoadLogs";
// import { logsBuffer } from "./logger";

// const MIN_GAP_MS = 5 * 60 * 1000;
// let lastDumpTime = 0;

// export async function startLogDump() {
//   if (logsBuffer.length === 0) return;

//   const now = Date.now();
//   if (now - lastDumpTime < MIN_GAP_MS) return;

//   const dump = [...logsBuffer];
//   logsBuffer.length = 0;

//   try {
//     await LogModel.insertMany(dump);
//     console.log(`Dumped ${dump.length} logs`);
//     lastDumpTime = now;
//   } catch (err) {
//     console.error("Error dumping logs", err);
//     logsBuffer.push(...dump); // put back if failed
//   }
// }
