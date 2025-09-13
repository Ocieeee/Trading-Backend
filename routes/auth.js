import express from "express";
import {
  login,
  logout,
  register,
  refreshtoken,
} from "../controllers/auth/auth.js";
import auth from "../middleware/authentication.js";
const router = express.Router();

router.post("/refresh-token", refreshtoken);
router.post("/logout", auth, logout);
router.post("/login", login);
router.post("/register", register);

export default router;
