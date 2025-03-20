import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
    id: number;
    fullName: string;
    email: string;
    profilePicture: string;
    role: string;
}

export interface Participant {
    id: number;
    calendarId: number;
    userId: number;
    color: string;
    role: string;
    isMain: number;
    user: User;
}

export interface EventParticipant {
    id: number;
    eventId: number;
    userId: number;
    color: string;
    attendanceStatus?: string;
    creationAt: string;
    user: User;
}

export interface CalendarEvent {
    id: number;
    creationByUserId: number;
    title: string;
    category: string;
    type: string;
    startAt: string;
    endAt: string;
    creationAt: string;
    creator: User;
    participants: EventParticipant[];
}

export interface CalendarReducer {
    id: number;
    title: string;
    description: string;
    type: string;
    creationByUserId: number;
    creationAt: string;
    creator: User;
    participants: Participant[];
    events: CalendarEvent[];
}

interface CalendarState {
    calendars: CalendarReducer[];
    loading: boolean;
    error: string | null;
    updatedCalendarParticipants: Participant[] | null;
    selectedCalendarIds: number[];
}

const initialState: CalendarState = {
    calendars: [],
    loading: false,
    error: null,
    updatedCalendarParticipants: null,
    selectedCalendarIds: [],
};

const calendarSlice = createSlice({
    name: "calendars",
    initialState,
    reducers: {
        setCalendars: (state, action: PayloadAction<CalendarReducer[]>) => {
            state.calendars = action.payload;
            state.error = null;
            state.selectedCalendarIds = action.payload.map(calendar => calendar.id);
        },
        addCalendar: (state, action: PayloadAction<CalendarReducer>) => {
            state.calendars.push(action.payload);
            state.error = null;
            state.selectedCalendarIds.push(action.payload.id);
        },
        updateCalendarAction: (state, action: PayloadAction<CalendarReducer>) => {
            const index = state.calendars.findIndex(
                (calendar) => calendar.id === action.payload.id
            );
            if (index !== -1) {
                state.calendars[index] = action.payload;
            }
            state.error = null;
        },
        updateCalendarColorAction: (state, action: PayloadAction<{ calendarId: number; color: string; userId: number }>) => {
            const { calendarId, color, userId } = action.payload;
            const calendar = state.calendars.find((cal) => cal.id === calendarId);
            if (calendar && calendar.participants) {
                const participant = calendar.participants.find((p) => p.userId === userId);
                if (participant) {
                    participant.color = color;
                }
            }
        },
        removeCalendar: (state, action: PayloadAction<number>) => {
            state.calendars = state.calendars.filter(calendar => calendar.id !== action.payload);
            state.selectedCalendarIds = state.selectedCalendarIds.filter(id => id !== action.payload);
            state.error = null;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        toggleCalendarSelection: (state, action: PayloadAction<number>) => {
            const calendarId = action.payload;
            if (state.selectedCalendarIds.includes(calendarId)) {
                state.selectedCalendarIds = state.selectedCalendarIds.filter(id => id !== calendarId);
            } else {
                state.selectedCalendarIds.push(calendarId);
            }
        },
    },
});

export const { setCalendars, addCalendar, updateCalendarAction, updateCalendarColorAction, removeCalendar, setError, toggleCalendarSelection } = calendarSlice.actions;
export default calendarSlice.reducer;