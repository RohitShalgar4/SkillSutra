import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });

  // Set cookie options based on environment
  const cookieOptions = {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };

  // Only set secure in production
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      user,
    });
};
