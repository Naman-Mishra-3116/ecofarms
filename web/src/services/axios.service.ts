import axios, { type AxiosRequestConfig } from "axios";

const axiosClient = axios.create({
  url: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export const request = async (config: AxiosRequestConfig) => {
  try {
    const resp = await axiosClient(config);
    return resp.data;
  } catch (error) {
    if (error && axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};
