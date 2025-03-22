import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import CustomCalendar from "@/components/CustomCalendar.tsx";
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
                    />
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <CustomCalendar
                        onCalendarApiReady={handleCalendarApiReady}
                        onTitleChange={handleTitleChange}
                        onViewChange={handleViewChange}
                    />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}