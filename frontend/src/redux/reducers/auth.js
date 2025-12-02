import { createSlice } from "@reduxjs/toolkit";
import { adminLogin, adminLogout, getAdmin } from "../thunks/admin";
import toast from "react-hot-toast";

const initialState = {
  user: null,
  isAdmin: false,
  loader: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userExists: (state, action) => {
      state.user = action.payload;
      state.loader = false;
    },
    userNotExists: (state) => {
      state.user = null;
      state.loader = false;
    },
   
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Admin Login
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isAdmin = true;
        toast.success(action.payload);
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isAdmin = false;
        toast.error(action.error.message);
      })
      
      // Get Admin Status (on page load/refresh)
      .addCase(getAdmin.fulfilled, (state, action) => {
       
        state.isAdmin = action.payload === true;
      })
      .addCase(getAdmin.rejected, (state) => {
        state.isAdmin = false;
      })
      
      // Admin Logout
      .addCase(adminLogout.fulfilled, (state, action) => {
        state.isAdmin = false;
        toast.success(action.payload);
      })
      .addCase(adminLogout.rejected, (state, action) => {
       
        state.isAdmin = false;
        toast.error(action.error.message);
      });
  },
});

export default authSlice;
export const { userExists, userNotExists, updateUserData } = authSlice.actions;