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

  // if (pathname.startsWith("/api/auth")) {
  //   return NextResponse.next();
  // }

  try {
    const token = req.cookies.get("authToken");

    if (!token) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      return response;
    }

    const decoded = await verifyToken(token.value);

    const userRole = decoded?.role;
    // const userId = decoded._id;

    // Check if the user has the correct role for the requested route
    if (userRole === "admin" && pathname.startsWith(roleRoutes.admin)) {
      const response = NextResponse.next();
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      return response;
    } else if (userRole === "owner" && pathname.startsWith(roleRoutes.owner)) {
      const response = NextResponse.next();
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      return response;
    } else if (
      userRole === "salesman" &&
      pathname.startsWith(roleRoutes.salesman)
    ) {
      const response = NextResponse.next();
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      return response;
    } else if (
      userRole === "pathologist" &&
      pathname.startsWith(roleRoutes.pathologist)
    ) {
      const response = NextResponse.next();
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      return response;
    } else if (userRole === "nurse" && pathname.startsWith(roleRoutes.nurse)) {
      const response = NextResponse.next();
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      return response;
    } else if (
      userRole === "dispenser" &&
      pathname.startsWith(roleRoutes.dispenser)
    ) {
      const response = NextResponse.next();
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      return response;
    } else if (
      userRole === "stockist" &&
      pathname.startsWith(roleRoutes.stockist)
    ) {
      const response = NextResponse.next();
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      return response;
      // } else if (pathname.startsWith("/api")) {
      //   const requestHeaders = new Headers(req.headers);
      //   requestHeaders.set("x-user-role", userRole);
      //   requestHeaders.set("x-user-id", userId);

      //   return NextResponse.next({
      //     request: {
      //       headers: requestHeaders,
      //     },
      //   });
    } else {
      console.log("User role mismatch. Redirecting to 403.");
      const response = NextResponse.redirect(new URL("/403", req.url));
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      return response;
    }
  } catch (error) {
    console.error("Token verification failed:", error.message);
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard-admin/:path*",
    "/dashboard-owner/:path*",
    "/dashboard-salesman/:path*",
    "/dashboard-pathologist/:path*",
    "/dashboard-nurse/:path*",
    // "/api/:path*",
  ],
};
