import { Button } from "@/components/ui/button.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input.tsx";
import { useEffect, useState } from "react";
import { SidebarHeader } from "@/components/ui/sidebar.tsx";
import { NavUser } from "@/components/calendar/NavUser.tsx";
import { useSelector } from "react-redux";
import { RootState } from "@/components/redux/store.ts";
import { createPortal } from "react-dom";
import { format } from "date-fns";

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
    events: EventType[];
    onEventSelect: (event: any) => void;
}

interface EventType {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    extendedProps?: {
        description?: string;
        calendarId: number;
        attendanceStatus?: "yes" | "no" | "maybe" | undefined;
        color?: string;
        calendarColor?: string;
    };
}

export default function CustomToolbarFullCalendar({
                                                      calendarApi,
                                                      title,
                                                      currentView,
                                                      events,
                                                      onEventSelect,
                                                  }: CustomToolbarFullCalendarProps) {
    const [selectedView, setSelectedView] = useState("Week");
    const user = useSelector((state: RootState) => state.auth.user);
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]);
    const [searchPosition, setSearchPosition] = useState({ x: 0, y: 0, width: 0 });

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredEvents([]);
            return;
        }

        const now = new Date();
        const matchingEvents = events.filter((event) =>
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.extendedProps?.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const uniqueEventsMap = new Map<string, EventType>();
        matchingEvents.forEach((event) => {
            const key = event.title.toLowerCase();
            const existingEvent = uniqueEventsMap.get(key);

            if (!existingEvent) {
                uniqueEventsMap.set(key, event);
            } else {
                const existingDiff = Math.abs(existingEvent.start.getTime() - now.getTime());
                const newDiff = Math.abs(event.start.getTime() - now.getTime());
                if (newDiff < existingDiff) {
                    uniqueEventsMap.set(key, event);
                }
            }
        });

        const uniqueEvents = Array.from(uniqueEventsMap.values()).sort(
            (a, b) => Math.abs(a.start.getTime() - now.getTime()) - Math.abs(b.start.getTime() - now.getTime())
        );
        setFilteredEvents(uniqueEvents);

        const inputElement = document.querySelector(".search-input");
        if (inputElement) {
            const rect = inputElement.getBoundingClientRect();
            setSearchPosition({ x: rect.left, y: rect.bottom + 5, width: rect.width });
        }
    }, [searchQuery, events]);

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

    const handleEventClick = async (event: EventType) => {
        const eventId = parseInt(event.id, 10);
        const response = await import("@/components/redux/actions/eventActions.ts").then(
            (module) => module.getEventById(eventId)
        );
        if (response.success) {
            const eventData = {
                id: response.data.id.toString(),
                title: response.data.title,
                start: response.data.startAt,
                end: response.data.endAt,
                description: response.data.description,
                category: response.data.category,
                type: response.data.type,
                creationByUserId: response.data.creationByUserId,
                calendarTitle: response.data.calendar?.title,
                calendarType: response.data.calendar?.type,
                calendarId: response.data.calendarId,
                color: response.data.participants.find((p: any) => p.userId === currentUser?.id)?.color,
                notifyBeforeMinutes: response.data.notifyBeforeMinutes,
                creator: {
                    id: response.data.creator.id,
                    fullName: response.data.creator.fullName,
                    email: response.data.creator.email,
                    profilePicture: response.data.creator.profilePicture,
                    attendanceStatus: response.data.participants.find(
                        (p: any) => p.userId === response.data.creator.id
                    )?.attendanceStatus,
                },
                participants: response.data.participants.map((p: any) => ({
                    id: p.user.id,
                    fullName: p.user.fullName,
                    email: p.user.email,
                    profilePicture: p.user.profilePicture,
                    attendanceStatus: p.attendanceStatus,
                    color: p.color,
                })),
            };
            onEventSelect(eventData);
            setSearchQuery("");
            setFilteredEvents([]);
        }
    };

    return (
        <div className="flex items-center justify-between gap-4 w-full relative">
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
                        <ChevronLeft strokeWidth={3} />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => calendarApi?.next()}
                        disabled={!calendarApi}
                        className="text-[16px] py-5 px-7 rounded-full"
                    >
                        <ChevronRight strokeWidth={3} />
                    </Button>
                </div>
            </div>
            {title && <span className="text-[21px] font-medium">{title}</span>}
            <div className="relative flex items-center gap-4 flex-1 justify-center">
                <Input
                    className={`search-input text-[16px] py-5 px-5 font-medium w-full transition-all ${
                        searchQuery ? "rounded-t-full rounded-b-none" : "rounded-full"
                    }`}
                    type="text"
                    placeholder="Find events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && createPortal(
                    <div
                        className="bg-white border border-gray-200 shadow-lg max-h-[200px] custom-scroll overflow-y-auto"
                        style={{
                            position: "absolute",
                            top: searchPosition.y - 6,
                            left: searchPosition.x,
                            width: searchPosition.width,
                            zIndex: 10001,
                        }}
                    >
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleEventClick(event)}
                                >
                                    <p className="text-sm font-medium">
                                        {event.title}
                                        <span className="text-xs text-gray-500 ml-2">
                                            {format(event.start, "MMM d, yyyy")}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {event.extendedProps?.description || "No description"}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-sm text-gray-500">
                                Not found
                            </div>
                        )}
                    </div>,
                    document.body
                )}
            </div>
            <div className="flex items-center gap-0">
                <Select
                    value={selectedView}
                    onValueChange={handleViewChange}
                    disabled={!calendarApi}
                >
                    <SelectTrigger className="text-[16px] py-5 px-5 rounded-full font-medium">
                        <SelectValue placeholder="Выберите вид" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Month">Month</SelectItem>
                        <SelectItem value="Week">Week</SelectItem>
                        <SelectItem value="Day">Day</SelectItem>
                    </SelectContent>
                </Select>
                <SidebarHeader>
                    {user ? <NavUser user={user} /> : <span>Loading...</span>}
                </SidebarHeader>
            </div>
        </div>
    );
}