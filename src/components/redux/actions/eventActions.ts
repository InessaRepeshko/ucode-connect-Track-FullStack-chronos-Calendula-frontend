import api from "@/api/axios";
import { AxiosError } from "axios";
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

export interface EventPayload {
    title: string;
    type: string;
    description?: string;
    calendarId: number;
    category: string;
    startAt: string;
    endAt: string;
}

export const getEvents = async (dispatch: Dispatch) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await api.get("/events", {
            headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(setEvents(data.data));
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setError(axiosError.response?.data?.message || null));
    }
};

export const getEventById = async (eventId: number) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await api.get(`/events/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        const axiosError = error as AxiosError<any>;
        return { success: false, errors: axiosError.response?.data?.message };
    }
};

export const createEvent = async (dispatch: Dispatch, payload: EventPayload, participants: { userId: number}[]) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await api.post("/events", { ...payload, participants }, {
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

export const updateEvent = async (dispatch: Dispatch, eventId: number, payload: EventPayload, participants: { userId: number}[]) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await api.patch(`/events/${eventId}`, { ...payload, participants }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(updateEventRedux(data.data));
        return { success: true, data: data.data, errors: {} };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        dispatch(setError(axiosError.response?.data?.message || null));
        return {
            success: false,
            errors: axiosError.response?.data?.validationErrors /*|| axiosError.response?.data?.message*/,
        };
    }
};

export const deleteEvent = async (dispatch: Dispatch, eventId: number) => {
    try {
        const token = localStorage.getItem("token");
        await api.delete(`/events/${eventId}`, {
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

export const joinEvent = async (eventId: number) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await api.patch(`/events/${eventId}/join/`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return { success: false, error: axiosError.response?.data?.message || null };
    }
};

export const leaveEvent = async (eventId: number) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await api.patch(`/events/${eventId}/leave/`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return { success: false, error: axiosError.response?.data?.message || null };
    }
};

export const tentativeEvent = async (eventId: number) => {
    try {
        const token = localStorage.getItem("token");
        const { data } = await api.patch(`/events/${eventId}/tentative/`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { success: true, data: data.data };
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        return { success: false, error: axiosError.response?.data?.message || null };
    }
};