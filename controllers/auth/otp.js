import User from "../../models/user.js";
import OTP from "../../models/otp.js";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnauthenticatedError } from "../../errors/index.js";
import { generatOTP } from "../../services/mailSender.js";
import mongoose from "mongoose";

const verifyOtp = async (req, res) => {
  const { email, otp, otp_type, data } = req.body;

  if (!email || !otp || !otp_type) {
    throw new BadRequestError("Please provide all values");
  } else if (otp_type !== "email" && !data) {
    throw new BadRequestError("Please provide all values");
  }

  const otpRecord = await OTP.findOne({ email, otp_type })
    .sort({ createdAt: -1 })
    .limit(1);

  if (!otpRecord) {
    throw new BadRequestError("Invalid OTP or OTP expired");
  }

  const isVerified = await otpRecord.compareOtp(otp);

  if (!isVerified) {
    throw new BadRequestError("Invalid OTP");
  }

  await OTP.findByIdAndDelete(otpRecord._id);

  switch (otp_type) {
    case "phone":
      await User.findOneAndUpdate({ email }, { phone_number: data });
      break;
    case "email":
      break;
    case "rest_pin":
      if (!data || data.length !== 4) {
        throw new BadRequestError("Please provide a valid pin");
      }
      await User.updatePIN(email, data);
      break;
    case "rest_password":
      await User.updatePassword(email, data);
      break;
    default:
      throw new BadRequestError("Invalid OTP type");
  }

  const user = await User.findOne({ email });

  if (otp_type === "email" && !user) {
    const register_token = jwt.sign({ email }, process.env.REGISTER_SECRET, {
      expiresIn: "10m",
    });
    return res
      .status(StatusCodes.OK)
      .json({ msg: "User registered successfully", register_token });
  }

  res.status(StatusCodes.OK).json({ msg: "OTP verified successfully" });
};

const sendOtp = async (req, res) => {
  const { email, otp_type } = req.body;

  if (!email || !otp_type) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ email });

  if (otp_type === "phone" && !user) {
    throw new BadRequestError("User not found");
  }

  if (otp_type === "email" && user) {
    throw new BadRequestError("Email already in use");
  }

  if (otp_type === "phone" && user.phone_number) {
    throw new BadRequestError("Phone number already in use");
  }

  const otp = await generatOTP();
  const otpPlayload = { email, otp, otp_type };
  await OTP.create(otpPlayload);

  res.status(StatusCodes.OK).json({ msg: "OTP sent successfully" });
};

export { verifyOtp, sendOtp };
