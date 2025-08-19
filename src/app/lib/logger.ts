// /lib/logger.ts
export const logsBuffer: any[] = [];

export function insertLog(data: {
  type: "api" | "db";
  path: string;
  method?: string;
  duration: number;
}) {
  console.log("called logger");
  logsBuffer.push({ ...data, timestamp: new Date() });
}
