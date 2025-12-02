import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "./error.js";
import { CHAT_APP_TOKEN } from "../constants/config.js";
import { User } from "../models/user.js";

const isAuthenticated = TryCatch((req, res, next) => {
  

  const token = req.cookies[CHAT_APP_TOKEN];
  if (!token)
    return next(new ErrorHandler("Please login to access this route", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodedData._id;

  next();
});


const adminOnly = TryCatch(async (req, res, next) => {
  const token = req.cookies[CHAT_APP_TOKEN];

 

  if (!token) {
   
    return next(new ErrorHandler("Only Admin can access this route", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    

    // Check if it's an admin token (contains admin: true)
    if (decodedData.admin === true) {
      return next(); // Admin access granted
    }

    return next(new ErrorHandler("Only Admin can access this route", 401));
  } catch (error) {
    return next(new ErrorHandler("Invalid token", 401));
  }
});
const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authToken = socket.request.cookies[CHAT_APP_TOKEN];

    if (!authToken)
      return next(new ErrorHandler("Please login to access this route", 401));

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await User.findById(decodedData._id);

    if (!user)
      return next(new ErrorHandler("Please login to access this route", 401));

    socket.user = user;

    return next();
  } catch (error) {
    return next(new ErrorHandler("Please login to access this route", 401));
  }
};

export { isAuthenticated, adminOnly, socketAuthenticator };
