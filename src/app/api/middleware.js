
import { NextResponse } from "next/server";
import { verifyTokenWithLogout } from "../utils/jwt";

export async function middleware(req) {
    const token = req.cookies.get("authToken");
    if (!token) {
      console.log("Token not found. Redirecting to login.");
      return NextResponse.json({message: 'Access denied. No token provided.'},{ success: false }, { status: 401 });
    }

    const decoded = await verifyTokenWithLogout(token.value);
    const userRole = decoded?.role;
    if(!decoded || !userRole){
        return NextResponse.json({message: 'Invalid token.'},{ success: false }, { status: 403 });
    }
    if(userRole !== "admin"){
        return NextResponse.json({message: 'Access denied. admins only.'},{ success: false }, { status: 403 });
    }
    req.user = decoded
}

