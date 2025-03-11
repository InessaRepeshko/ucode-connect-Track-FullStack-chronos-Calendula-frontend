import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Calendar {
    id: number;
    title: string;
    description: string;
    creationByUserId: number;
    creationAt: string;
}

interface CalendarState {
    calendars: Calendar[];
    loading: boolean;
    error: string | null;
}

const initialState: CalendarState = {
    calendars: [],
    loading: false,
    error: null,
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
