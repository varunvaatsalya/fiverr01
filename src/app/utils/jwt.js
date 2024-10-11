// import jwt from "jsonwebtoken";
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const secret = new TextEncoder().encode(JWT_SECRET);

export const generateToken = async (user) => {
    
  // const payload = {
  //   id: user.id,
  //   email: user.email,
  //   role: user.role,
  // };

  // return jwt.sign(payload, JWT_SECRET, { expiresIn: "2d" }); 

  // Create the JWT
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })  // Algorithm to use
    .setIssuedAt()
    .setExpirationTime('2d')  // Token expiration time
    .sign(secret);

  return token;
};

export const verifyToken = async (token) => {
  // try {
  //   return jwt.verify(token, JWT_SECRET);
  // } catch (error) {
  //   return null;
  // }


  try {
    const { payload } = await jwtVerify(token, secret); // Verify the token
    console.log(payload, "nidhi")
    return payload; // This will contain the role and any other claims
  } catch (error) {
    console.error('Invalid or expired token:', error);
    return null; // Token is invalid or expired
  }
};
