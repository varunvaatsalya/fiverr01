// import jwt from "jsonwebtoken";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
const secret = new TextEncoder().encode(JWT_SECRET);

export const generateToken = async (user) => {
  
  const token = await new SignJWT({ _id: user._id, email: user.email, role: user.role, editPermission:user.editPermission })
    .setProtectedHeader({ alg: "HS256" }) // Algorithm to use
    .setIssuedAt()
    .setExpirationTime("2d") // Token expiration time
    .sign(secret);

  return token;
};

export const verifyToken = async (token) => {

  try {
    const { payload } = await jwtVerify(token, secret); // Verify the token
    return payload; // This will contain the role and any other claims
  } catch (error) {
    console.error("Invalid or expired token:", error);
    return null; // Token is invalid or expired
  }
};
