// import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const secret = new TextEncoder().encode(JWT_SECRET);

export const verifyToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, secret); // Verify the token
    return payload; // This will contain the role and any other claims
  } catch (error) {
    console.error("Invalid or expired token:", error);
    return null; // Token is invalid or expired
  }
};

