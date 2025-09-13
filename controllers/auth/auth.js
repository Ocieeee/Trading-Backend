import User from "../../models/User.js";

import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from "../../errors/index.js";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  const { email, password, register_token } = req.body;

  if (!email || !password || !register_token) {
    throw new BadRequestError(`Please provide all value `);
  }

  const user = await User.findOne({ email });
  if (user) {
    throw new BadRequestError(`User already exists`);
  }

  try {
    const payload = jwt.verify(register_token, process.env.REGISTER_SECRET);
    if (payload.email != email) {
      throw new BadRequestError(`Invaild register token`);
    }
    const newUser = new User.create({ email, password });
    const access_token = newUser.createAccessToken();
    const refresh_token = newUser.createRefreshToken();
    res.status(StatusCodes.CREATED).json({
      user: { email: newUser.email, userId: newUser.id },
      tokens: { access_token, refresh_token },
    });
  } catch (error) {
    console.log(error);

    throw new BadRequestError("Invaild Body");
  }
};

const login = async (res, req) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError(`Please provide all value `);
  }
  const user = await User.find({ email });
  if (!user) {
    throw new BadRequestError(`Invaild credentials`);
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    let message;

    if (
      user.blocked_until_password &&
      user.blocked_until_password > new Date()
    ) {
      const remainingMinutes = Math.ceil(
        (user.blocked_until_password = new Date()) / (60 * 1000)
      );
      message = `Your account is blocked for  password . Please try again after ${remainingMinutes} minute(s)`;
    } else {
      const attmptsRemaining = 3 - user.wrong_password_attempts;
      message =
        attmptsRemaining > 0
          ? `Invaild password ${attmptsRemaining} attempts remainig`
          : `Invaild Login attempts exceeded Please try after 30 min`;
    }
    throw new UnauthenticatedError(message);
  }
  const access_token = user.createAccessToken();
  const refresh_token = user.createRefreshToken();

  let phone_exist = false;
  let login_pin_exist = false;

  if (user.phone_number) {
    phone_exist = true;
  }
  if (user.login_pin) {
    login_pin_exist = true;
  }

  res.status(StatusCodes.OK).json({
    user: {
      user: {
        name: user.name,
        email: user.email,
        userId: user.id,
        phone_exist,
        login_pin_exist,
      },
      tokens: { access_token, refresh_token },
    },
  });
};

export const refreshtoken = async (req, res) => {
  const { type, refresh_token } = req.body;
  if (!type || !["socket", "app"].includes(type) || !refresh_token) {
    throw new BadRequestError("Please provide all values");
  }
  try {
    let accessToken, newRefreashtoken;
    if (type === "socket") {
      ({ accessToken, newRefreashtoken } = await generateRefreshToken(
        refresh_token,
        process.env.REFRESH_SOCKET_TOKEN_SECRET,
        process.env.REFRESH_SOCKET_TOKEN_EXPIRY,
        process.env.SOCKET_TOKEN_SECRET,
        process.env.SOCKET_TOKEN_EXPIRY
      ));
    } else if (type === "app") {
      ({ accessToken, newRefreashtoken } = await generateRefreshToken(
        refresh_token,
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_SOCKET_TOKEN_EXPIRY,
        process.env.JWT_SECRET,
        process.env.ACCESS_TOKEN_EXPIRY
      ));
    }
    res
      .status(StatusCodes.OK)
      .json({ access_token: accessToken, refresh_token: newRefreashtoken });
  } catch (error) {
    console.log(error);
    throw new UnauthenticatedError("Invaild Token");
  }
};

async function generateRefreshToken(
  token,
  refresh_secret,
  refresh_expiry,
  access_secret,
  access_expiry
) {
  try {
    const payload = jwt.verify(token, refresh_secret);
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new NotFoundError("User Not Found");
    }
    const access_token = jwt.sign({ userId: payload.userId }, access_secret, {
      expiresIn: access_expiry,
    });

    const newRefreashtoken = jwt.sign(
      { userId: payload.userId },
      refresh_secret,
      {
        expiresIn: refresh_expiry,
      }
    );

    return { access_token, newRefreashtoken };
  } catch (error) {
    console.log(error);
    throw new UnauthenticatedError("Invaild Token");
  }
}

const logout = async (req, res) => {
  const accesssToken = req.headers.authorization.split(" ")[1];
  const decodeToken = jwt.decode(accesssToken, process.env.JWT_SECRET);
  console.log(decodeToken);
  const userId = decodeToken.userId;
  await User.updateOne({ _id: userId }, { $unset: { biometricKey: 1 } });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

export { register, login, logout };
