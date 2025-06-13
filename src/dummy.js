import { NextResponse } from "next/server";
import { verifyToken } from "./app/utils/verification";

const roleRoutes = {
  admin: "/dashboard-admin",
  owner: "/dashboard-owner",
  salesman: "/dashboard-salesman",
  pathologist: "/dashboard-pathologist",
  nurse: "/dashboard-nurse",
  stockist: "/dashboard-stockist",
  dispenser: "/dashboard-dispenser",
};


export async function middleware(req) {
  const pathname = req.nextUrl.pathname;


  try {
    const token = req.cookies.get("authToken");

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const decoded = await verifyToken(token.value);

    const userRole = decoded?.role;
    if (userRole === "admin" && pathname.startsWith(roleRoutes.admin)) {
      return NextResponse.next();
    } else if (userRole === "owner" && pathname.startsWith(roleRoutes.owner)) {
      return NextResponse.next();
    } else if (
      userRole === "salesman" &&
      pathname.startsWith(roleRoutes.salesman)
    ) {
      return NextResponse.next();
    } else if (
      userRole === "pathologist" &&
      pathname.startsWith(roleRoutes.pathologist)
    ) {
      return NextResponse.next();
    } else if (userRole === "nurse" && pathname.startsWith(roleRoutes.nurse)) {
      return NextResponse.next();
    } else if (
      userRole === "dispenser" &&
      pathname.startsWith(roleRoutes.dispenser)
    ) {
      return NextResponse.next();
    } else if (
      userRole === "stockist" &&
      pathname.startsWith(roleRoutes.stockist)
    ) {
      return NextResponse.next();
    } else {
      console.log("User role mismatch. Redirecting to 403.");
      return NextResponse.redirect(new URL("/403", req.url));
    }
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard-admin/:path*",
    "/dashboard-owner/:path*",
    "/dashboard-salesman/:path*",
    "/dashboard-pathologist/:path*",
    "/dashboard-nurse/:path*",
  ],
};
