import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "../../constants/config";
import axios from "axios";

const adminLogin = createAsyncThunk("admin/login", async (secretKey) => {
  try {
    const { data } = await axios.post(
      `${server}/api/v1/admin/verify`,
      { secretKey },
      { 
        withCredentials: true,
      }
    );

    // Return only the success message string for toast
    return data.message;
  } catch (error) {
    throw error.response?.data?.message || "Admin login failed";
  }
});

const getAdmin = createAsyncThunk("admin/getAdmin", async () => {
  try {
    const { data } = await axios.get(`${server}/api/v1/admin/`, {
      withCredentials: true,
    });

    // Return only the admin boolean value
    return data.admin;
  } catch (error) {
    throw error.response?.data?.message || "Failed to get admin status";
  }
});

const adminLogout = createAsyncThunk("admin/logout", async () => {
  try {
    const { data } = await axios.get(`${server}/api/v1/admin/logout`, {
      withCredentials: true,
    });

    // Return only the success message string for toast
    return data.message;
  } catch (error) {
    throw error.response?.data?.message || "Admin logout failed";
  }
});

export { adminLogin, getAdmin, adminLogout };