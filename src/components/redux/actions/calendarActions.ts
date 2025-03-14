import axios, { AxiosError } from "axios";
import { Dispatch } from "redux";
import {setError, addCalendar, setCalendars, removeCalendar} from "@/components/redux/reducers/calendarReducer.ts";

interface ErrorResponse {
    validationErrors?: { path: string; msg: string }[];
    message?: string;
}

interface CalendarPayload {
    title: string;
    description?: string;
}

export const createCalendar = async (dispatch: Dispatch, payload: CalendarPayload, participants: { userId: number; role: string }[]) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.post("http://localhost:8080/api/calendars", { ...payload, participants }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        dispatch(addCalendar(data.data));
        return { success: true, data: data.data, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setError(axiosError.response?.data?.message || null));
        return {
            success: false,
            errors: axiosError.response?.data?.validationErrors,
        };
    }
};

export const updateCalendar = async (dispatch: Dispatch, calendar_id: number, payload: CalendarPayload, participants: { userId: number; role: string }[]) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.patch(
            `http://localhost:8080/api/calendars/${calendar_id}`, { ...payload, participants }, {
                headers: { Authorization: `Bearer ${token}`
                }});

        dispatch(setCalendars(data.data));
        return { success: true, data: data.data, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setError(axiosError.response?.data?.message || null));
        return {
            success: false,
            errors: axiosError.response?.data?.validationErrors,
        };
    }
};

export const getCalendars = async (dispatch: Dispatch) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:8080/api/calendars", {
            headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(setCalendars(data.data));
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setError(axiosError.response?.data?.message || null));
    }
};

export const getCalendarById = async (dispatch: Dispatch, calendar_id: number) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`http://localhost:8080/api/calendars/${calendar_id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { success: true, data: data.data, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setError(axiosError.response?.data?.message || null));
        return {
            success: false,
            errors: axiosError.response?.data?.validationErrors,
        };
    }
};

export const deleteCalendar = async (dispatch: Dispatch, calendar_id: number) => {
    try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8080/api/calendars/${calendar_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(removeCalendar(calendar_id));
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
