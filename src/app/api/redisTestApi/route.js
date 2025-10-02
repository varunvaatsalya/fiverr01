import { redisService } from "@/app/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json(
    { message: "Service Unavailble, its under maintenance" },
    { status: 200 }
  );
  try {
    const data = await redisService.get("testKey");
    if (data) {
      return NextResponse.json(
        { message: "response sent from redis", data },
        { status: 200 }
      );
    }
    await redisService.set("testKey", "testValue", 10);
    return NextResponse.json(
      { message: "No data found for 'testKey', and now set it to 'testValue'" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Redis is not connected", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  return NextResponse.json(
    { message: "Service Unavailble, its under maintenance" },
    { status: 200 }
  );

  try {
    await redisService.del("testKey");
    return NextResponse.json(
      { message: "'delete testKey' successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Redis is not connected", error: error.message },
      { status: 500 }
    );
  }
}
