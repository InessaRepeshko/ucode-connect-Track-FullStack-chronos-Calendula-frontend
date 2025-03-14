import axios, { AxiosError } from "axios";
import { Dispatch } from "redux";
import {
    setError,
    addEvent,
    setEvents,
    removeEvent,
    updateEventRedux
} from "@/components/redux/reducers/eventReducer.ts";

interface ErrorResponse {
    validationErrors?: { path: string; msg: string }[];
    message?: string;
}

interface EventPayload {
    title: string;
    description?: string;
    category: string;
    type: string;
    startAt: string;
    endAt: string;
    participants?: { userId: number; color: string }[];
}

export const getEvents = async (dispatch: Dispatch) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:8080/api/events", {
            headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(setEvents(data.data));
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setError(axiosError.response?.data?.message || null));
    }
};

export const createEvent = async (dispatch: Dispatch, payload: EventPayload) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.post("http://localhost:8080/api/events", payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        dispatch(addEvent(data.data));
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

export const updateEvent = async (dispatch: Dispatch, eventId: number, payload: EventPayload) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await axios.patch(`http://localhost:8080/api/events/${eventId}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(updateEventRedux(data.data));
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

export const deleteEvent = async (dispatch: Dispatch, eventId: number) => {
    try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8080/api/events/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(removeEvent(eventId));
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
