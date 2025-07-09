import axios, { AxiosError } from "axios";
import store from "@/components/redux/store";
import { logout } from "@/components/redux/reducers/authReducer";
import { env } from "@/utils/env";

const api = axios.create({
    baseURL: env.API_BASE_URL,
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            store.dispatch(logout());
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
