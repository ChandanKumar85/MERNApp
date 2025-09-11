import { httpClient } from "../../../api/http";
import type { LoginData, RegisterData } from "../models/auth.interface";

// Function to register a new user
export const registerUser = async (data: RegisterData) => {
  try {
    const response = await httpClient.post("/auth/register", data);
    return response.data;
  } catch (error: any) {
    console.error("Register error:", error);
    throw error.response?.data || { status: 0, message: "REGISTER_FAILED" };
  }
};

// Function to login a user
export const loginUser = async (data: LoginData) => {
  try {
    const response = await httpClient.post("/auth/login", data);

    // // store accessToken if API sends one
    // if (response.data?.accessToken) {
    //   localStorage.setItem("accessToken", response.data.accessToken);
    // }

    return response.data;
  } catch (error: any) {
    console.error("Login error:", error);
    throw error.response?.data || { status: 0, message: "LOGIN_FAILED" };
  }
};

// Function to Logout a user
export const logoutUser = async (data: any) => {
  try {
    const response = await httpClient.post("/auth/logout", data);
    return response.data;
  } catch (error: any) {
    console.error("Logout error:", error);
    throw error.response?.data || { status: 0, message: "LOGOUT_FAILED" };
  }
}