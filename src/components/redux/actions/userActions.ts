import axios, {AxiosError} from "axios";
import { Dispatch } from "redux";
import {setError, setUsers} from "@/components/redux/reducers/userReducer.ts";

interface ErrorResponse {
    validationErrors?: { path: string; msg: string }[];
    message?: string;
}

export const getUsers = async (dispatch: Dispatch) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:8080/api/users", {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(setUsers(data.data));
        return { success: true, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setError(axiosError.response?.data?.message || null));
        return {
            success: false,
            errors: axiosError.response?.data?.validationErrors,
        };
    }
};


