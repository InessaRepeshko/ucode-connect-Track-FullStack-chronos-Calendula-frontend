import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Event {
    id: number;
    title: string;
    description?: string;
    category: string;
    type: string;
    startAt: string;
    endAt: string;
}

interface EventState {
    events: Event[];
    error: string | null;
}

const initialState: EventState = {
    events: [],
    error: null,
};

const eventSlice = createSlice({
    name: "event",
    initialState,
    reducers: {
        addEvent: (state, action: PayloadAction<Event>) => {
            state.events.push(action.payload);
        },
        setEvents: (state, action: PayloadAction<Event[]>) => {
            state.events = action.payload;
        },
        removeEvent: (state, action: PayloadAction<number>) => {
            state.events = state.events.filter((event) => event.id !== action.payload);
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { addEvent, setEvents, removeEvent, setError } = eventSlice.actions;
export default eventSlice.reducer;
