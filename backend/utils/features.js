import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { getBase64, getSockets } from "../lib/helper.js";
import { CHAT_APP_TOKEN } from "../constants/config.js";

// ===================== CLOUDINARY CONFIG ===================== //
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ===================== COOKIE OPTIONS ===================== //

const cookieOptions = {
  maxAge: 15 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV?.trim() === "PRODUCTION",
  sameSite: process.env.NODE_ENV?.trim() === "PRODUCTION" ? "none" : "lax", 
  path: "/", 
};

// ===================== CONNECT DB ===================== //
const connectDB = (uri) => {
  mongoose
    .connect(uri, { dbName: "Synx-MernChatApp" })
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => {
      console.error("DB Connection Failed:", err);
      process.exit(1);
    });
};

// ===================== SEND TOKEN ===================== //
const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  return res
    .status(code)
    .cookie(CHAT_APP_TOKEN, token, cookieOptions)
    .json({
      success: true,
      user,
      message,
    });
};

// ===================== SOCKET EVENT EMIT ===================== //
const emitEvent = (req, event, users, data) => {
  const io = req.app.get("io");
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};

// ===================== UPLOAD SINGLE FILE TO CLOUDINARY ===================== //
const uploadSingleFileToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(getBase64(file), {
      resource_type: "auto",
      public_id: uuid(),
      folder: "group_avatars" 
    });

    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (err) {
    throw new Error("Error uploading file to Cloudinary: " + err.message);
  }
};

// ===================== DELETE SINGLE FILE FROM CLOUDINARY ===================== //
const deleteSingleFileFromCloudinary = async (public_id) => {
  try {
    if (!public_id) {
      console.warn("No public_id provided for deletion");
      return true;
    }

    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result !== "ok") {
      throw new Error(`Cloudinary deletion failed: ${result.result}`);
    }
    
    console.log(`Successfully deleted file: ${public_id}`);
    return true;
  } catch (err) {
    console.error("Error deleting single file from Cloudinary:", err);
    throw new Error("Failed to delete file from Cloudinary: " + err.message);
  }
};

// ===================== UPLOAD FILES TO CLOUDINARY ===================== //
const uploadFilesToCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) =>
    cloudinary.uploader.upload(getBase64(file), {
      resource_type: "auto",
      public_id: uuid(),
    })
  );

  try {
    const results = await Promise.all(uploadPromises);

    return results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
  } catch (err) {
    throw new Error("Error uploading files to Cloudinary: " + err.message);
  }
};

// ===================== DELETE FILES FROM CLOUDINARY ===================== //
const deleteFilesFromCloudinary = async (public_ids = []) => {
  try {
    const deletePromises = public_ids.map((id) =>
      cloudinary.uploader.destroy(id)
    );

    await Promise.all(deletePromises);
    return true;
  } catch (err) {
    console.error("Error deleting Cloudinary files:", err);
  }
};

// ===================== EXPORTS ===================== //
export {
  connectDB,
  sendToken,
  cookieOptions,
  emitEvent,
  uploadSingleFileToCloudinary,
  deleteSingleFileFromCloudinary,
  deleteFilesFromCloudinary,
  uploadFilesToCloudinary,
};