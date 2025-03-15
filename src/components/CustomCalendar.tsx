import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect, useRef } from "react";
import "@/components/styles/fullcalendar.css";
import CreateEventPopover from "@/components/event/CreateEventPopover.tsx";
import { useSelector} from "react-redux";
import {RootState} from "@/components/redux/store.ts";

interface EventType {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
}

export default function CustomCalendar() {
    const [events, setEvents] = useState<EventType[]>([]);
    const calendars = useSelector((state: RootState) => state.calendars.calendars)
    const selectedCalendarIds = useSelector((state: RootState) => state.calendars.selectedCalendarIds);
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>();
    const [tempEventId, setTempEventId] = useState<string | null>(null);
    const [isPositionReady, setIsPositionReady] = useState(false);
    const calendarRef = useRef<FullCalendar>(null);

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


    const handleAddEvent = (title: string) => {
        if (title.trim() && selectedDate && tempEventId) {
            const event = events.find((e) => e.id === tempEventId);
            if (event) {
                const updatedEvent = { ...event, title };
                setEvents((prevEvents) =>
                    prevEvents.map((e) => (e.id === tempEventId ? updatedEvent : e))
                );
                console.log("Отправка в БД:", updatedEvent);
                // getEvents(dispatch); // Хз нада ли
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

    useEffect(() => {
        if (tempEventId) {
            const eventEl = document.querySelector(`.fc-event[data-event-id="${tempEventId}"]`);
            if (eventEl) {
                const rect = eventEl.getBoundingClientRect();
                const popoverWidth = 430;
                const popoverHeight = 390;
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
    }, [tempEventId]);

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
        const scrollToCurrentTime = () => {
            if (calendarRef.current?.getApi()) {
                handleScrollToTime();
            } else {
                setTimeout(scrollToCurrentTime, 100);
            }
        };
        scrollToCurrentTime();
    }, []);

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
                    }}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    height="100%"
                    slotLabelFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }}
                    datesSet={(arg) => {
                        if (arg.view.type === "timeGridWeek" || arg.view.type === "timeGridDay") {
                            handleScrollToTime();
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
                                <div className="event-title">{title}</div>
                                <div className="event-time">
                                    {startTime} - {endTime}
                                </div>
                            </div>
                        );
                    }}
                />
            </div>

            {isPositionReady && clickPosition && (
                <CreateEventPopover
                    selectedDate={selectedDate}
                    endDate={endDate}
                    position={clickPosition}
                    onSave={handleAddEvent}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}