import axios from "axios";

// Create an Axios instance with a base URL and default headers
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_DATABASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});