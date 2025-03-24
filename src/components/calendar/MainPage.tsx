import { AppSidebar } from "@/components/calendar/AppSidebar.tsx";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import CustomCalendar, { EventType } from "@/components/calendar/CustomCalendar.tsx";
import { useState, useCallback } from "react";
import CustomToolbarFullCalendar from "@/components/calendar/CustomToolbarFullCalendar.tsx";

export default function MainPage() {
    const [calendarApi, setCalendarApi] = useState<{
        prev: () => void;
        next: () => void;
        today: () => void;
        changeView: (view: string) => void;
        getTitle: () => string;
    } | null>(null);
    const [calendarTitle, setCalendarTitle] = useState<string>("");
    const [currentView, setCurrentView] = useState<string>("timeGridWeek");
    const [events, setEvents] = useState<EventType[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const handleCalendarApiReady = useCallback((api: {
        prev: () => void;
        next: () => void;
        today: () => void;
        changeView: (view: string) => void;
        getTitle: () => string;
    }) => {
        setCalendarApi(api);
    }, []);
    const handleTitleChange = useCallback((title: string) => {
        setCalendarTitle(title);
    }, []);

    const handleViewChange = useCallback((view: string) => {
        setCurrentView(view);
    }, []);

    const handleEventsChange = useCallback((newEvents: EventType[]) => {
        setEvents(newEvents);
    }, []);

    const handleEventSelect = useCallback((event: any) => {
        setSelectedEvent(event);
    }, []);

    const handleDateSelect = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);

    const handleDateChange = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar
                onDateSelect={handleDateSelect}
                externalDate={selectedDate}
            />
            <SidebarInset>
                <header className="sticky top-0 flex h-17 shrink-0 items-center gap-2 border-b bg-background px-4">
                    <CustomToolbarFullCalendar
                        calendarApi={calendarApi}
                        title={calendarTitle}
                        currentView={currentView}
                        events={events}
                        onEventSelect={handleEventSelect}
                        onDateChange={handleDateChange}
                    />
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <CustomCalendar
                        onCalendarApiReady={handleCalendarApiReady}
                        onTitleChange={handleTitleChange}
                        onViewChange={handleViewChange}
                        onEventsChange={handleEventsChange}
                        selectedEvent={selectedEvent}
                        onEventSelect={handleEventSelect}
                        selectedDate1={selectedDate}
                    />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}