import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "../errors/index.js";
import e from "express";

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Authentication invalid");
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    console.log(error);

    throw new UnauthenticatedError("Authentication invalid");
  }
};

export default auth;
