import { httpClient } from "../../../api/http";
import { ROUTES } from "../../../routes/routePaths";
import type { LoginData, RegisterData } from "../models/auth.interface";

// Function to register a new user
export const registerUser = async (data: RegisterData) => {
  try {
    const response = await httpClient.post(`/auth${ROUTES.REGISTER}`, data);
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message === "REGISTER_FAILED") {
      throw err;
    }
    throw err;
  }
};

// Function to login a user
export const loginUser = async (data: LoginData) => {
  try {
    const response = await httpClient.post(`/auth${ROUTES.LOGIN}`, data);
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message === "LOGIN_FAILED") {
      throw err;
    }
    throw err;
  }
};

// Function to Logout a user
export const logoutUser = async (data: any) => {
  try {
    const response = await httpClient.post("/auth/logout", data);
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message === "LOGOUT_FAILED") {
      throw err;
    }
    throw err;
  }
}

// Function to forgot Password
export const forgotPassword = async (data: {email: string}) => {
  try {
    const response = await httpClient.post(`/auth${ROUTES.FORGOT_PASSWORD}`, data);
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message === "SERVER_ERROR") {
      throw err;
    }
    throw err;
  }
};

// Function to Reset Password
export const resetPassword = async (data: { password: string; confirmPassword: string, token: any }) => {
  try {
    const { password, confirmPassword, token } = data;
    const response = await httpClient.post(`/auth${ROUTES.RESET_PASSWORD}/${token}`, { password, confirmPassword });
    return response.data;
  } catch (err: any) {
    if (err.response?.data?.message === "TOKEN_EXPIRED") {
      throw err;
    }
    throw err;
  }
};