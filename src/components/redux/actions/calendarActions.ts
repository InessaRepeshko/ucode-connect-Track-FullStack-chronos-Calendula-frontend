import api from "@/api/axios";
import { AxiosError } from "axios";
import { Dispatch } from "redux";
import {
    setError,
    addCalendar,
    setCalendars,
    removeCalendar,
    updateCalendarAction, updateCalendarColorAction
} from "@/components/redux/reducers/calendarReducer.ts";

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
        const { data } = await api.post("/calendars", { ...payload, participants }, {
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
        const { data } = await api.patch(
            `/calendars/${calendar_id}`, { ...payload, participants }, {
                headers: { Authorization: `Bearer ${token}`
                }});

        dispatch(updateCalendarAction(data.data));
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
        const { data } = await api.get("/calendars", {
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
        const { data } = await api.get(`/calendars/${calendar_id}`, {
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
        await api.delete(`/calendars/${calendar_id}`, {
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

export const unsubscribeFromCalendar = async (dispatch: Dispatch, calendar_id: number) => {
    try {
        const token = localStorage.getItem("token");
        await api.patch(
            `/calendars/${calendar_id}/leave/`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        dispatch(removeCalendar(calendar_id));
        return { success: true, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setError(axiosError.response?.data?.message || null));
        return {
            success: false,
            errors: axiosError.response?.data?.validationErrors || axiosError.response?.data?.message,
        };
    }
};

export const updateCalendarColor = async (dispatch: Dispatch, calendarId: number, color: string, userId: number) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await api.patch(
            `/calendars/${calendarId}/color/`,
            { color },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        dispatch(updateCalendarColorAction({ calendarId, color, userId }));
        return { success: true, data: data.data, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setError(axiosError.response?.data?.message || null));
        return {
            success: false,
            errors: axiosError.response?.data?.validationErrors || axiosError.response?.data?.message,
        };
    }
};