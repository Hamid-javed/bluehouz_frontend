// File: bluehouz_frontend/src/services/apihandler.ts

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
  withCredentials: true // ✅ Ensure JWT cookie is sent with requests!
});

// console.log('👉 API base URL:', api.defaults.baseURL)

const apiHandler = async <T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: object,
  // withCredentials?: boolean,
  config?: AxiosRequestConfig
): Promise<T> => {
  const fullUrl = `${api.defaults.baseURL}${url}`;

  try {
    const response: AxiosResponse<T> = await api({
      method,
      url,
      data,
      withCredentials: true,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("API Request Failed");
      console.error("URL:", fullUrl);
      console.error("Method:", method);
      console.error("Payload:", JSON.stringify(data, null, 2));
      console.error("Status Code:", error.response?.status);
      console.error("Response Body:", JSON.stringify(error.response?.data, null, 2));
      throw new Error(error.response?.data?.message || "API request failed");
    }

    console.error("Unexpected Error:", error);
    throw new Error("An unexpected error occurred while making the API request.");
  }
};

export default apiHandler;
