// import { NextResponse } from "next/server";

// // const JWT_SECRET = process.env.JWT_SECRET;
// import { verifyToken } from "./app/utils/jwt";
// // Define which paths require certain roles
// const roleRoutes = {
//   admin: "/dashboard-admin",
//   owner: "/dashboard-owner",
//   salesman: "/dashboard-salesman",
// };

// // Middleware function to check for JWT and user role
// export async function middleware(req) {
//   console.log("middleware called");
//   try {
//     // Get the token from cookies (if not in cookies, log it)
//     const token = req.cookies.get("authToken");
//     console.log("token", token);
//     if (!token) {
//       console.log("Token not found. Redirecting to login.");
//       // Redirect to login if no token is found
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     // Verify the token and get decoded information
//     console.log(1);
//     // const decoded = jwt.verify(token.value, JWT_SECRET);
//     const decoded = await verifyToken(token.value);
//     console.log(2);
//     console.log("Decoded Token:", decoded);

//     // Get user's role from the decoded token
//     const userRole = decoded.role;

//     // Get the current path the user is trying to access
//     const pathname = req.nextUrl.pathname;
//     console.log(userRole, roleRoutes.admin);
//     // Check if the user has the correct role for the requested route
//     if (userRole === "Admin" && pathname.startsWith(roleRoutes.admin)) {
//       return NextResponse.next(); // Allow access to admin dashboard
//     } else if (userRole === "Owner" && pathname.startsWith(roleRoutes.owner)) {
//       return NextResponse.next(); // Allow access to owner dashboard
//     } else if (
//       userRole === "SalesMan" &&
//       pathname.startsWith(roleRoutes.salesman)
//     ) {
//       return NextResponse.next(); // Allow access to salesman dashboard
//     } else {
//       console.log("User role mismatch. Redirecting to 403.");
//       // Forbidden: user does not have permission to access this route
//       return NextResponse.redirect(new URL("/403", req.url)); // Redirect to 403 Forbidden page
//     }
//   } catch (error) {
//     console.error("Token verification failed:", error.message);
//     // Redirect to login if token is invalid or expired
//     return NextResponse.redirect(new URL("/login", req.url));
//   }
// }

// export async function userRouteMiddleware(req) {
//   const token = req.cookies.get("authToken");
//   if (!token) {
//     console.log("Token not found. Redirecting to login.");
//     return NextResponse.json(
//       { message: "Access denied. No token provided." , success: false },
//       { status: 401 }
//     );
//   }

//   const decoded = await verifyToken(token.value);
//   const userRole = decoded.role;
//   if (!decoded || !userRole) {
//     return NextResponse.json(
//       { message: "Invalid token." , success: false },
//       { status: 403 }
//     );
//   }
//   if (userRole !== "Admin") {
//     return NextResponse.json(
//       { message: "Access denied. Admins only." , success: false },
//       { status: 403 }
//     );
//   }
//   req.user = decoded;
// }

// // Define the paths where this middleware should run (protect dashboard routes)
// export const config = {
//   matcher: [
//     "/dashboard-admin/:path*",
//     "/dashboard-owner/:path*",
//     "/dashboard-salesman/:path*",
//   ],
// };




import { NextResponse } from "next/server";

// const JWT_SECRET = process.env.JWT_SECRET;
import { verifyToken } from "./app/utils/jwt";
// Define which paths require certain roles
const roleRoutes = {
  admin: "/dashboard-admin",
  owner: "/dashboard-owner",
  salesman: "/dashboard-salesman",
};

// Middleware function to check for JWT and user role
export async function middleware(req) {
  console.log("middleware called");
  try {
    // Get the token from cookies (if not in cookies, log it)
    const token = req.cookies.get("authToken");
    // console.log("token", token);
    if (!token) {
      console.log("Token not found. Redirecting to login.");
      // Redirect to login if no token is found
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }

    // Verify the token and get decoded information
    // console.log(1);
    const decoded = await verifyToken(token.value);
    // console.log(2);
    // console.log("Decoded Token:", decoded);

    // Get user's role from the decoded token
    const userRole = decoded.role;

    // Get the current path the user is trying to access
    const pathname = req.nextUrl.pathname;
    // console.log(userRole, roleRoutes.admin);
    // console.log(userRole, pathname, token)
    
    // Check if the user has the correct role for the requested route
    if (userRole === "admin" && pathname.startsWith(roleRoutes.admin)) {
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response; // Allow access to admin dashboard
    } else if (userRole === "owner" && pathname.startsWith(roleRoutes.owner)) {
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response; // Allow access to owner dashboard
    } else if (userRole === "salesman" && pathname.startsWith(roleRoutes.salesman)) {
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response; // Allow access to salesman dashboard
    } else {
      console.log("User role mismatch. Redirecting to 403.");
      const response = NextResponse.redirect(new URL("/403", req.url));
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response; // Redirect to 403 Forbidden page
    }
  } catch (error) {
    console.error("Token verification failed:", error.message);
    // Redirect to login if token is invalid or expired
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }
}

// export async function userRouteMiddleware(req) {
//   const token = req.cookies.get("authToken");
//   if (!token) {
//     console.log("Token not found. Redirecting to login.");
//     const response = NextResponse.json(
//       { message: "Access denied. No token provided.", success: false },
//       { status: 401 }
//     );
//     response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
//     return response;
//   }

//   const decoded = await verifyToken(token.value);
//   const userRole = decoded.role;
//   if (!decoded || !userRole) {
//     const response = NextResponse.json(
//       { message: "Invalid token.", success: false },
//       { status: 403 }
//     );
//     response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
//     return response;
//   }
//   if (userRole !== "Admin") {
//     const response = NextResponse.json(
//       { message: "Access denied. Admins only.", success: false },
//       { status: 403 }
//     );
//     response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
//     return response;
//   }
//   req.user = decoded;
// }

// Define the paths where this middleware should run (protect dashboard routes)
export const config = {
  matcher: [
    "/dashboard-admin/:path*",
    "/dashboard-owner/:path*",
    "/dashboard-salesman/:path*",
  ]
};
