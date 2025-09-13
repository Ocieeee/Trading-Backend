import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { mailSender } from "../utils/mailSender.js";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
  },
  otp: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
  otp_type: {
    type: String,
    enum: ["phone", "mail", "rest_password", "rest_pin"],
    require: true,
  },
});

otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    const salt = await bcrypt.genSalt(10);
    await sendVerificationMail(this.email, this.otp);
    this.otp = await bcrypt.hash(this.otp, salt);
  }
  next();
});

otpSchema.methods.compareOtp = async function (enteredOtp) {
  return await bcrypt.compare(enteredOtp, this.otp);
};

async function sendVerificationMail(email, otp, otp_type) {
  try {
    const mailResponse = await mailSender(email, otp, otp_type);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const OTP = mongoose.model("Otp", otpSchema);
export default OTP;
