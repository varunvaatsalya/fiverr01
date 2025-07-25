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
  let { pathname } = req.nextUrl;

  try {
    const token = req.cookies.get("authToken");

    if (!token) {
      // return NextResponse.redirect(new URL("/login", req.url));
      const loginUrl = new URL("/login", req.url);
      if (pathname !== "/") loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const decoded = await verifyToken(token.value);
    const userRole = decoded?.role;
    if (!decoded || !userRole) {
      const loginUrl = new URL("/login", req.url);
      if (pathname !== "/") loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const dashboardPath = roleRoutes[userRole];

    if (!dashboardPath) {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL(dashboardPath, req.url));
    }

    if (pathname.startsWith(dashboardPath)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/403", req.url));
  } catch (error) {
    console.error("Token verification failed:", error.message);
    // return NextResponse.redirect(new URL("/login", req.url));
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard-admin/:path*",
    "/dashboard-owner/:path*",
    "/dashboard-salesman/:path*",
    "/dashboard-pathologist/:path*",
    "/dashboard-nurse/:path*",
    "/dashboard-dispenser/:path*",
    "/dashboard-stockist/:path*",
    // "/api/:path*",
  ],
};
