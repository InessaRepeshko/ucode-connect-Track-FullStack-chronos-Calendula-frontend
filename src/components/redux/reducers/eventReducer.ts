import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    id: number;
    fullName: string;
    email: string;
    country: string;
}

interface Participant {
    id: number;
    eventId: number;
    userId: number;
    user: User;
    color: string;
    creationAt: string;
}

interface Event {
    id: number;
    title: string;
    description?: string;
    category: string;
    type: string;
    startAt: string;
    endAt: string;
    creationByUserId: number;
    creator: User;
    participants: Participant[];
    creationAt: string;
    color?: string;
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
        updateEventRedux: (state, action: PayloadAction<Event>) => {
            const index = state.events.findIndex((event) => event.id === action.payload.id);
            if (index !== -1) {
                state.events[index] = action.payload;
            }
        },
        updateEventColor: (state, action: PayloadAction<{ eventId: number; color: string }>) => {
            const eventIndex = state.events.findIndex((event) => event.id === action.payload.eventId);
            if (eventIndex !== -1) {
                const event = state.events[eventIndex];
                // Обновляем цвет в participants для создателя
                const creatorParticipantIndex = event.participants.findIndex(
                    (p) => p.userId === event.creationByUserId
                );
                if (creatorParticipantIndex !== -1) {
                    state.events[eventIndex].participants[creatorParticipantIndex].color = action.payload.color;
                }
            }
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { addEvent, setEvents, removeEvent, updateEventRedux, updateEventColor, setError } = eventSlice.actions;
export default eventSlice.reducer;