import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect, useRef } from "react";
import "@/components/styles/fullcalendar.css";
import CreateEventPopover from "@/components/event/CreateEventPopover.tsx";
import EventDetailsPopover from "@/components/event/EventDetailsPopover.tsx";
import { useSelector } from "react-redux";
import { RootState } from "@/components/redux/store.ts";
import { getEventById } from "@/components/redux/actions/eventActions.ts";
import { useNavigate } from "react-router-dom";
import { useEventDraft } from "@/components/utils/EventDraftContext.tsx";
import { format } from "date-fns";
import { Toggle } from "@/components/ui/toggle.tsx";

interface EventType {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
}

interface CustomCalendarProps {
    onCalendarApiReady?: (api: {
        prev: () => void;
        next: () => void;
        today: () => void;
        changeView: (view: string) => void;
        getTitle: () => string;
    }) => void;
    onTitleChange?: (title: string) => void;
    onViewChange?: (view: string) => void;
}

export default function CustomCalendar({ onCalendarApiReady, onTitleChange, onViewChange }: CustomCalendarProps) {
    const navigate = useNavigate();
    const [events, setEvents] = useState<EventType[]>([]);
    const calendars = useSelector((state: RootState) => state.calendars.calendars);
    const selectedCalendarIds = useSelector((state: RootState) => state.calendars.selectedCalendarIds);
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>();
    const [tempEventId, setTempEventId] = useState<string | null>(null);
    const [isPositionReady, setIsPositionReady] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const calendarRef = useRef<FullCalendar>(null);
    const { setDraft } = useEventDraft();
    const [pressedToggles, setPressedToggles] = useState<Set<string>>(new Set());
    const [currentView, setCurrentView] = useState<string>("timeGridWeek");
    const [dayHeaderFormat, setDayHeaderFormat] = useState<any>({
        weekday: "short",
        day: "numeric",
    });
    const [currentTitle, setCurrentTitle] = useState<string>("");

    useEffect(() => {
        if (calendarRef.current && onCalendarApiReady) {
            const calendarApi = calendarRef.current.getApi();
            console.log("onCalendarApiReady called");
            onCalendarApiReady({
                prev: () => calendarApi.prev(),
                next: () => calendarApi.next(),
                today: () => calendarApi.today(),
                changeView: (view: string) => calendarApi.changeView(view),
                getTitle: () => currentTitle,
            });
        }
    }, [onCalendarApiReady]);

    useEffect(() => {
        if (!calendars.length || !currentUser?.id) return;

        const allEvents = calendars
            .filter(calendar =>
                selectedCalendarIds.includes(calendar.id) &&
                (calendar.creationByUserId === currentUser.id ||
                    calendar.participants.some(p => p.userId === currentUser.id))
            )
            .flatMap(calendar => calendar.events.map(event => ({
                id: event.id.toString(),
                title: event.title,
                start: new Date(event.startAt),
                end: new Date(event.endAt),
                allDay: event.startAt.endsWith("00:00:00") && event.endAt.endsWith("23:59:59"),
            })));

        setEvents(allEvents);
    }, [calendars, selectedCalendarIds, currentUser?.id]);

    const handleTogglePress = (date: Date) => {
        const dateKey = date.toISOString();
        if (!pressedToggles.has(dateKey)) {
            setPressedToggles((prev) => new Set(prev).add(dateKey));
            calendarRef.current?.getApi().changeView("timeGridDay", date);
        }
    };

    const handleAddEvent = (title: string) => {
        if (title.trim() && selectedDate && tempEventId) {
            const event = events.find((e) => e.id === tempEventId);
            if (event) {
                const updatedEvent = { ...event, title };
                setEvents((prevEvents) =>
                    prevEvents.map((e) => (e.id === tempEventId ? updatedEvent : e))
                );
                console.log("Отправка в БД:", updatedEvent);
            }
            setTempEventId(null);
        }
        setSelectedDate(null);
        setEndDate(null);
        setClickPosition(undefined);
        setIsPositionReady(false);
    };

    const handleClose = () => {
        if (tempEventId) {
            setEvents((prevEvents) => prevEvents.filter((event) => event.id !== tempEventId));
        }
        setSelectedDate(null);
        setEndDate(null);
        setClickPosition(undefined);
        setTempEventId(null);
        setIsPositionReady(false);
    };

    const handleEventClickClose = () => {
        setSelectedEvent(null);
        setClickPosition(undefined);
        setIsPositionReady(false);
    };

    const handleEditEvent = () => {
        if (selectedEvent) {
            console.log("Selected Event:", selectedEvent);

            const formattedUsers = selectedEvent.participants.map((participant: any) => ({
                id: participant.user.id,
                fullName: participant.user.fullName,
                email: participant.user.email,
                profilePicture: participant.user.profilePicture,
                role: participant.user.role === "user" ? "member" : participant.user.role,
            }));

            const draftData = {
                eventId: selectedEvent.id,
                title: selectedEvent.title,
                description: selectedEvent.description || "",
                category: selectedEvent.category || "work",
                type: selectedEvent.type || "meeting",
                startDate: new Date(selectedEvent.start),
                endDate: new Date(selectedEvent.end),
                startTime: format(new Date(selectedEvent.start), "HH:mm"),
                endTime: format(new Date(selectedEvent.end), "HH:mm"),
                calendarId: selectedEvent.calendarId || null,
                color: selectedEvent.color || "#D50000",
                selectedUsers: formattedUsers,
                creatorId: selectedEvent.creationByUserId,
            };

            console.log("Draft Data:", draftData);
            setDraft(draftData);
            navigate("/edit-event");
        } else {
            console.log("No selectedEvent available");
        }
        handleEventClickClose();
    };

    const handleDeleteEvent = () => {
        console.log("Delete event:", selectedEvent);
        setEvents((prevEvents) => prevEvents.filter((e) => e.id !== selectedEvent.id));
        handleEventClickClose();
    };

    useEffect(() => {
        if (tempEventId || selectedEvent) {
            const eventId = tempEventId || selectedEvent?.id;
            const eventEl = document.querySelector(`.fc-event[data-event-id="${eventId}"]`);
            if (eventEl) {
                const rect = eventEl.getBoundingClientRect();
                const popoverWidth = tempEventId ? 430 : 300;
                const popoverHeight = tempEventId ? 390 : 200;
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;
                const offset = 10;

                const rightEdge = rect.right + popoverWidth + offset;
                const isOverflowingX = rightEdge > screenWidth;
                const xPosition = isOverflowingX
                    ? rect.left + window.scrollX - popoverWidth - offset
                    : rect.right + window.scrollX + offset;

                const eventHeight = rect.height;
                const eventCenter = rect.top + eventHeight / 2;
                let yPosition;

                if (rect.top < screenHeight / 3 + 20) {
                    yPosition = rect.top + window.scrollY;
                } else if (rect.bottom > (screenHeight * 2) / 3) {
                    yPosition = rect.bottom + window.scrollY - popoverHeight;
                } else {
                    yPosition = eventCenter + window.scrollY - popoverHeight / 2;
                }

                const bottomEdge = yPosition + popoverHeight;
                if (bottomEdge > screenHeight) {
                    yPosition = screenHeight - popoverHeight - offset;
                }
                if (yPosition < offset) {
                    yPosition = offset;
                }

                setClickPosition({ x: xPosition, y: yPosition });
                setIsPositionReady(true);
            }
        }
    }, [tempEventId, selectedEvent]);

    const handleScrollToTime = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const now = new Date();
            now.setHours(now.getHours() - 5);
            const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:00`;
            calendarApi.scrollToTime(timeString);
        }
    };

    useEffect(() => {
        console.log("Scroll useEffect triggered");
        if (calendarRef.current?.getApi()) {
            handleScrollToTime();
        }
    }, []); // Убрали рекурсивный setTimeout

    return (
        <div className="p-4 bg-white rounded-lg shadow-md relative h-[calc(95vh-2rem)]">
            <div className="calendar-container h-full overflow-y-auto">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    nowIndicator={true}
                    events={events}
                    eventResizableFromStart={true}
                    eventDurationEditable={true}
                    eventDidMount={(info) => {
                        info.el.setAttribute("data-event-id", info.event.id);
                    }}
                    headerToolbar={{
                        left: "",
                        center: "",
                        right: "",
                    }}
                    height="100%"
                    slotLabelFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }}
                    firstDay={1}
                    dayHeaderContent={(arg) => {
                        const dateKey = arg.date.toISOString();
                        const isPressed = pressedToggles.has(dateKey);
                        const weekday = arg.text.split(" ")[0];
                        const day = arg.text.split(" ")[1];
                        const displayText = currentView === "dayGridMonth" ? weekday : `${day} ${weekday}`;

                        if (currentView === "dayGridMonth") {
                            return (
                                <div className="h-9 flex items-center justify-center px-5 text-[16px] text-black font-medium">
                                    {displayText}
                                </div>
                            );
                        }

                        return (
                            <Toggle
                                pressed={isPressed}
                                onPressedChange={() => handleTogglePress(arg.date)}
                                className="h-8 py-5 px-4 text-[16px] rounded-xl cursor-pointer text-black hover:text-black"
                            >
                                {displayText}
                            </Toggle>
                        );
                    }}
                    dateClick={(info) => {
                        const calendarApi = calendarRef.current?.getApi();
                        if (calendarApi) {
                            const currentViewType = calendarApi.view.type;
                            if (currentViewType === "timeGridWeek" || currentViewType === "dayGridMonth") {
                                calendarApi.changeView("timeGridDay", info.dateStr);
                            }
                        }
                    }}
                    dayHeaderFormat={dayHeaderFormat}
                    datesSet={(arg) => {
                        let formattedTitle = "";
                        const startDate = arg.start;
                        const endDate = arg.end;
                        const timeDiff = endDate.getTime() - startDate.getTime();
                        const middleTime = startDate.getTime() + Math.floor(timeDiff / 2);
                        const middleDate = new Date(middleTime);

                        if (arg.view.type === "timeGridWeek" || arg.view.type === "dayGridMonth") {
                            formattedTitle = format(middleDate, "MMMM yyyy");
                        } else if (arg.view.type === "timeGridDay") {
                            formattedTitle = format(middleDate, "MMMM d, yyyy");
                        }

                        setCurrentTitle(formattedTitle);
                        if (onTitleChange) onTitleChange(formattedTitle);

                        if (arg.view.type === "dayGridMonth") {
                            setDayHeaderFormat({ weekday: "short" });
                        } else {
                            setDayHeaderFormat({ weekday: "short", day: "numeric" });
                        }

                        if (arg.view.type === "timeGridWeek" && currentView !== "timeGridWeek") {
                            setPressedToggles(new Set());
                        }
                        if (arg.view.type === "timeGridWeek" || arg.view.type === "timeGridDay") {
                            handleScrollToTime();
                        }
                        setCurrentView(arg.view.type);
                        if (onViewChange) onViewChange(arg.view.type);
                    }}
                    select={(info) => {
                        const newEventId = Date.now().toString();
                        let eventEnd = info.end;
                        const isAllDayEvent = info.allDay;

                        if (isAllDayEvent) {
                            eventEnd = new Date(info.start);
                            eventEnd.setHours(23, 59, 59, 999);
                        } else if (info.end.getTime() - info.start.getTime() <= 1000) {
                            eventEnd = new Date(info.start.getTime() + 30 * 60 * 1000);
                        }

                        const newEvent = {
                            id: newEventId,
                            title: "New Event",
                            start: info.start,
                            end: eventEnd,
                            allDay: isAllDayEvent,
                        };

                        setEvents((prevEvents) => [...prevEvents, newEvent]);
                        setSelectedDate(info.start.toISOString());
                        setEndDate(eventEnd.toISOString());
                        setTempEventId(newEventId);
                        setIsPositionReady(false);
                        setClickPosition(undefined);
                        setSelectedEvent(null);
                    }}
                    eventClick={async (info) => {
                        const eventId = parseInt(info.event.id, 10);
                        const response = await getEventById(eventId);
                        if (response.success) {
                            setSelectedEvent({
                                id: info.event.id,
                                title: response.data.title,
                                start: response.data.startAt,
                                end: response.data.endAt,
                                description: response.data.description,
                                category: response.data.category,
                                type: response.data.type,
                                calendarId: response.data.calendarId,
                                color: response.data.color,
                                participants: response.data.participants || [],
                                creationByUserId: response.data.creationByUserId,
                            });
                            setTempEventId(null);
                            setIsPositionReady(false);
                            setClickPosition(undefined);
                        }
                    }}
                    eventContent={(arg) => {
                        const title = arg.event.title || "New Event";
                        const isAllDay = arg.event.allDay;
                        if (isAllDay) {
                            return (
                                <div className="custom-event">
                                    <div className="event-title">{title}</div>
                                </div>
                            );
                        }
                        const startTime = arg.event.start
                            ? new Date(arg.event.start).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "??:??";
                        const endTime = arg.event.end
                            ? new Date(arg.event.end).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "??:??";

                        return (
                            <div className="custom-event">
                                <div className="event-title truncate">{title}</div>
                                <div className="event-time truncate">
                                    {startTime} - {endTime}
                                </div>
                            </div>
                        );
                    }}
                />
            </div>

            {isPositionReady && clickPosition && tempEventId && (
                <CreateEventPopover
                    selectedDate={selectedDate}
                    endDate={endDate}
                    position={clickPosition}
                    onSave={handleAddEvent}
                    onClose={handleClose}
                />
            )}

            {isPositionReady && clickPosition && selectedEvent && (
                <EventDetailsPopover
                    position={clickPosition}
                    event={selectedEvent}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onClose={handleEventClickClose}
                    currentUserId={currentUser?.id}
                />
            )}
        </div>
    );
}