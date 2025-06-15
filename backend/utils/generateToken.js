import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });

  // Set cookie options based on environment
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    domain: "skillsutra-backend-vm62.onrender.com" || "localhost"
  };

  // Only set secure in production
  // if (process.env.NODE_ENV === "production") {
  //   cookieOptions.secure = true;
  // }
  cookieOptions.secure = true;
  
  // Log cookie options for debugging
  console.log('Setting cookie with options:', cookieOptions);

  return res
    .status(200)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message,
      user,
    });
};
