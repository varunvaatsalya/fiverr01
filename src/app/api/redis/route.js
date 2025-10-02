import { NextResponse } from "next/server";
import { connectionServices } from "@/app/lib/redis";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  if (!action) {
    return NextResponse.json(
      { message: "Action query parameter is required" },
      { status: 400 }
    );
  }
  try {
    if (action === "refetchStatus") {
      const isConnected = connectionServices.isRedisConnected();
      return NextResponse.json(
        { active: isConnected, success: true },
        { status: 200 }
      );
    } else if (action === "retry") {
      const isConnected = await connectionServices.retryConnection();
      return NextResponse.json(
        { active: isConnected, success: true },
        { status: 200 }
      );
    } else if (action === "disconnect") {
      const isDisconnected = connectionServices.disconnect();
      return NextResponse.json(
        {
          active: !isDisconnected,
          success: true,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Redis operation failed",
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { message: "Invalid action", success: false },
    { status: 400 }
  );
}
