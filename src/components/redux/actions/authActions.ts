import axios, {AxiosError} from "axios";
import { Dispatch } from "redux";
import {setErrors, setRegistrationErrors, setUser} from "@/components/redux/reducers/authReducer.ts";

interface ErrorResponse {
    validationErrors?: { path: string; msg: string }[];
    message?: string;
}

export const loginUser = async (credentials: { email: string; password: string }, dispatch: Dispatch) => {
    try {
        const { data } = await axios.post("http://localhost:8080/api/auth/login", credentials);

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
        await axios.post("http://localhost:8080/api/auth/register", credentials);
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
        await axios.get(`http://localhost:8080/api/auth/confirm-email/${confirmToken}`);
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
        await axios.post("http://localhost:8080/api/auth/password-reset", { email });
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
        await axios.post(`http://localhost:8080/api/auth/password-reset/${confirmToken}`, { password, password_confirm });
        return { success: true, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return {
            success: false,
            errors: axiosError.response?.data?.validationErrors,
        };
    }
};



