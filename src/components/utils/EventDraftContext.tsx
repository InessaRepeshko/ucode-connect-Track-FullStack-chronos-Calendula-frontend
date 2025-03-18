import { createContext, useContext, useState, ReactNode } from "react";

interface User {
    id: number;
    fullName: string;
    email: string;
    profilePicture: string;
    role: "viewer" | "member" | "owner";
}

interface EventDraft {
    title?: string;
    description?: string;
    category?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
    calendarId?: number;
    color?: string;
    selectedUsers?: User[];
    eventId?: string;
    creatorId?: number;
}

const EventDraftContext = createContext<{
    draft: EventDraft;
    setDraft: (draft: EventDraft) => void;
} | undefined>(undefined);

export const EventDraftProvider = ({ children }: { children: ReactNode }) => {
    const [draft, setDraft] = useState<EventDraft>({});

    return (
        <EventDraftContext.Provider value={{ draft, setDraft }}>
            {children}
        </EventDraftContext.Provider>
    );
};

export const useEventDraft = () => {
    const context = useContext(EventDraftContext);
    if (!context) {
        throw new Error("useEventDraft must be used within an EventDraftProvider");
    }
    return context;
};
