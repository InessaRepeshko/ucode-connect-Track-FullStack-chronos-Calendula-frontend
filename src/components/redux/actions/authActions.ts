import api from "@/api/axios";
import { AxiosError } from "axios";
import { Dispatch } from "redux";
import {logout, setErrors, setRegistrationErrors, setUser} from "@/components/redux/reducers/authReducer.ts";

interface ErrorResponse {
    validationErrors?: { path: string; msg: string }[];
    message?: string;
}

export const loginUser = async (credentials: { email: string; password: string }, dispatch: Dispatch) => {
    try {
        const { data } = await api.post("/auth/login", credentials);

        localStorage.setItem("token", data.accessToken);
        dispatch(setUser({ authToken: data.accessToken, user: data.data }));
        return { authToken: data.accessToken, user: data.data, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setErrors(axiosError.response?.data?.validationErrors || []));
        return {
            authToken: null,
            user: null,
            errors: axiosError.response?.data?.validationErrors,
        };
    }
};

export const registerUser = async (credentials: { fullName: string; email: string; country: string; password: string; password_confirm: string }, dispatch: Dispatch) => {
    try {
        await api.post("/auth/register", credentials);
        dispatch(setRegistrationErrors([]));
        return { success: true, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setRegistrationErrors(axiosError.response?.data?.validationErrors || []));
        return {
            success: false,
            errors: axiosError.response?.data?.validationErrors,
        };
    }
};

export const verifyEmail = async (confirmToken: string) => {
    try {
        await api.get(`/auth/confirm-email/${confirmToken}`);
        return { success: true, errors: {}  };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return {
            success: false,
            errors: axiosError.response?.data?.message,
        };
    }
};

export const passwordReset = async (email: string) => {
    try {
        await api.post("/auth/password-reset", { email });
        return { success: true, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return {
            success: false,
            errors: axiosError.response?.data?.validationErrors,
        };
    }
};

export const confirmPasswordReset = async (confirmToken: string, password: string, password_confirm: string) => {
    try {
        await api.post(`/auth/password-reset/${confirmToken}`, { password, password_confirm });
        return { success: true, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return {
            success: false,
            errors: axiosError.response?.data?.validationErrors,
        };
    }
};

export const logoutUser = async (dispatch: Dispatch) => {
    try {
        await api.post("/auth/logout", {});
        dispatch(logout());
        return { success: true, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<any>;
        return {
            success: false,
            errors: axiosError.response?.data?.message || null,
        };
    }
};


