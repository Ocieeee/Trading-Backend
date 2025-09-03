import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import e from "express";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
    unique: true,
    match: ["", "Please add a value email"],
  },
  password: {
    type: String,
  },
  name: {
    type: String,
    maxLength: 50,
    minlength: 3,
  },
  login_pin: {
    type: String,
    minlength: 4,
    maxLength: 4,
  },
  phone_number: {
    type: String,
    match: [],
    unique: true,
    sparse: true,
  },
  date_of_birth: Date,
  biometricKey: String,
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  wrong_pin_attempts: {
    type: Number,
    default: 0,
  },
  blocked_until_pin: {
    type: Date,
    default: null,
  },
  wrong_password_attempts: {
    type: Number,
    default: 0,
  },
  blocked_until_attempts: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 50000.0,
  },
});
