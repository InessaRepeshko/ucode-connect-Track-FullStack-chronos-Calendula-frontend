import {Button} from "@/components/ui/button.tsx";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Input} from "@/components/ui/input.tsx";
import {useEffect, useState} from "react";
import {SidebarHeader} from "@/components/ui/sidebar.tsx";
import {NavUser} from "@/components/nav-user.tsx";
import {useSelector} from "react-redux";
import {RootState} from "@/components/redux/store.ts";

interface CustomToolbarFullCalendarProps {
    calendarApi: {
        prev: () => void;
        next: () => void;
        today: () => void;
        changeView: (view: string) => void;
        getTitle: () => string;
    } | null;
    title?: string;
    currentView?: string;
}

export default function CustomToolbarFullCalendar({calendarApi, title, currentView}: CustomToolbarFullCalendarProps) {
    const [selectedView, setSelectedView] = useState("Week");
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        if (currentView) {
            const viewMap: { [key: string]: string } = {
                dayGridMonth: "Month",
                timeGridWeek: "Week",
                timeGridDay: "Day",
            };
            setSelectedView(viewMap[currentView] || "Week");
        }
    }, [currentView]);

    const handleViewChange = (view: string) => {
        setSelectedView(view);
        if (calendarApi) {
            switch (view) {
                case "Month":
                    calendarApi.changeView("dayGridMonth");
                    break;
                case "Week":
                    calendarApi.changeView("timeGridWeek");
                    break;
                case "Day":
                    calendarApi.changeView("timeGridDay");
                    break;
                default:
                    break;
            }
        }
    };

    return (
        <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={() => calendarApi?.today()}
                    disabled={!calendarApi}
                    className="text-[16px] py-5 px-7 rounded-full font-medium"
                >
                    Today
                </Button>
                <div className="flex gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => calendarApi?.prev()}
                        disabled={!calendarApi}
                        className="text-[16px] py-5 px-7 rounded-full"
                    >
                        <ChevronLeft strokeWidth={3}/>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => calendarApi?.next()}
                        disabled={!calendarApi}
                        className="text-[16px] py-5 px-7 rounded-full"
                    >
                        <ChevronRight strokeWidth={3}/>
                    </Button>
                </div>
            </div>
            {title && <span className="text-[21px] font-medium">{title}</span>}
            <div className="flex items-center gap-4 flex-1 justify-center">
                <Input
                    type="text"
                    placeholder="Find events..."
                    className="text-[16px] py-5 px-5 rounded-full font-medium w-full"
                />
            </div>

            <div className="flex items-center gap-0">
                <Select
                    value={selectedView}
                    onValueChange={handleViewChange}
                    disabled={!calendarApi}
                >
                    <SelectTrigger className="text-[16px] py-5 px-5 rounded-full font-medium">
                        <SelectValue placeholder="Выберите вид"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Month">Month</SelectItem>
                        <SelectItem value="Week">Week</SelectItem>
                        <SelectItem value="Day">Day</SelectItem>
                    </SelectContent>
                </Select>

                <SidebarHeader>
                    {user ? <NavUser user={user}/> : <span>Loading...</span>}
                </SidebarHeader>
            </div>
        </div>
    );
}