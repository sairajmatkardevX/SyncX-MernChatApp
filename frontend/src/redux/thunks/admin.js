import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { server } from "../../constants/config";

export const adminLogin = createAsyncThunk(
  "admin/login",
  async (secretKey, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${server}/api/v1/admin/verify`,
        { secretKey },
        { withCredentials: true }
      );
      return data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Admin login failed");
    }
  }
);

export const getAdmin = createAsyncThunk(
  "admin/getAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${server}/api/v1/admin/`, {
        withCredentials: true,
      });
      return data.admin;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to get admin status");
    }
  }
);

export const adminLogout = createAsyncThunk(
  "admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${server}/api/v1/admin/logout`, {
        withCredentials: true,
      });
      return data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Admin logout failed");
    }
  }
);
