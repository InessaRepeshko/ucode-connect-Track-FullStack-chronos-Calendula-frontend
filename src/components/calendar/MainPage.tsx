import { AppSidebar } from "@/components/calendar/AppSidebar.tsx";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import CustomCalendar, { EventType } from "@/components/calendar/CustomCalendar.tsx";
import { useState, useCallback } from "react"; // Добавляем useCallback
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
    const [events, setEvents] = useState<EventType[]>([]); // Состояние для событий
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

    const handleCalendarApiReady = useCallback((api: {
        prev: () => void;
        next: () => void;
        today: () => void;
        changeView: (view: string) => void;
        getTitle: () => string;
    }) => {
        console.log("calendarApi updated");
        setCalendarApi(api);
    }, []); // Пустой массив зависимостей, чтобы ссылка не менялась

    const handleTitleChange = useCallback((title: string) => {
        console.log("Title changed:", title);
        setCalendarTitle(title);
    }, []); // Стабилизируем и эту функцию

    const handleViewChange = useCallback((view: string) => {
        console.log("View changed:", view);
        setCurrentView(view);
    }, []);

    const handleEventsChange = useCallback((newEvents: EventType[]) => {
        console.log("Events changed:", newEvents);
        setEvents(newEvents);
    }, []);

    const handleEventSelect = useCallback((event: any) => {
        console.log("Event selected from search:", event);
        setSelectedEvent(event);
    }, []);

    console.log("MainPage rendered");

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 flex h-17 shrink-0 items-center gap-2 border-b bg-background px-4">
                    <CustomToolbarFullCalendar
                        calendarApi={calendarApi}
                        title={calendarTitle}
                        currentView={currentView}
                        events={events} // Передаем события
                        onEventSelect={handleEventSelect} // Передаем callback для выбора события
                    />
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <CustomCalendar
                        onCalendarApiReady={handleCalendarApiReady}
                        onTitleChange={handleTitleChange}
                        onViewChange={handleViewChange}
                        onEventsChange={handleEventsChange} // Передаем обработчик событий
                        selectedEvent={selectedEvent} // Передаем выбранное событие
                        onEventSelect={handleEventSelect}
                    />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}