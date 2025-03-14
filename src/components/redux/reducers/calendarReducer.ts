import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    id: number;
    fullName: string;
    email: string;
    profilePicture: string;
    role: string;
}

interface Participant {
    id: number;
    calendarId: number;
    userId: number;
    color: string;
    role: string;
    isMain: number;
    user: User;
}

interface Calendar {
    id: number;
    title: string;
    description: string;
    creationByUserId: number;
    creationAt: string;
    creator: User;
    participants: Participant[];
}

interface CalendarState {
    calendars: Calendar[];
    loading: boolean;
    error: string | null;
    updatedCalendarParticipants: Participant[] | null;
}

const initialState: CalendarState = {
    calendars: [],
    loading: false,
    error: null,
    updatedCalendarParticipants: null,
};

const calendarSlice = createSlice({
    name: "calendars",
    initialState,
    reducers: {
        setCalendars: (state, action: PayloadAction<Calendar[]>) => {
            state.calendars = action.payload;
            state.error = null;
        },
        addCalendar: (state, action: PayloadAction<Calendar>) => {
            state.calendars.push(action.payload);
            state.error = null;
        },
        updateCalendar: (state, action: PayloadAction<Calendar>) => {
            const index = state.calendars.findIndex(
                (calendar) => calendar.id === action.payload.id
            );
            if (index !== -1) {
                state.calendars[index] = action.payload;
            }
            state.error = null;
        },
        removeCalendar: (state, action: PayloadAction<number>) => {
            state.calendars = state.calendars.filter(calendar => calendar.id !== action.payload);
            state.error = null;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { setCalendars, addCalendar, updateCalendar, removeCalendar, setError } = calendarSlice.actions;
export default calendarSlice.reducer;
