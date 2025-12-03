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
      // Login Success
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isAdmin = true;
        toast.success(action.payload);
      })
      // Login Failed
      .addCase(adminLogin.rejected, (state, action) => {
        state.isAdmin = false;
        toast.error(action.payload);
      })

      // Get Admin Success
      .addCase(getAdmin.fulfilled, (state, action) => {
        state.isAdmin = action.payload === true;
      })
      // Get Admin Failed
      .addCase(getAdmin.rejected, (state) => {
        state.isAdmin = false;
      })

      // Logout Success
      .addCase(adminLogout.fulfilled, (state, action) => {
        state.isAdmin = false;
        toast.success(action.payload);
      })
      // Logout Failed
      .addCase(adminLogout.rejected, (state, action) => {
        state.isAdmin = false;
        toast.error(action.payload);
      });
  },
});

export default authSlice;
export const { userExists, userNotExists, updateUserData } = authSlice.actions;
