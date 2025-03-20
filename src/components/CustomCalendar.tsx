import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect, useRef } from "react";
import "@/components/styles/fullcalendar.css";
import CreateEventPopover from "@/components/event/CreateEventPopover.tsx";
import EventDetailsPopover from "@/components/event/EventDetailsPopover.tsx";
import {useDispatch, useSelector} from "react-redux";
import { RootState } from "@/components/redux/store.ts";
import {
    deleteEvent,
    getEventById,
    joinEvent,
    leaveEvent,
    tentativeEvent
} from "@/components/redux/actions/eventActions.ts";
import { useNavigate } from "react-router-dom";
import { useEventDraft } from "@/components/utils/EventDraftContext.tsx";
import { format } from "date-fns";
import { Toggle } from "@/components/ui/toggle.tsx";
import {ToastStatusMessages} from "@/constants/toastStatusMessages.ts";
import {showErrorToasts, showSuccessToast} from "@/components/utils/ToastNotifications.tsx";

interface Participant {
    userId: number;
    attendanceStatus?: "yes" | "no" | "maybe" | undefined;
    color?: string;
}

interface Calendar {
    id: number;
    creationByUserId: number;
    participants: Participant[];
    events: {
        id: number;
        title: string;
        startAt: string;
        endAt: string;
    }[];
}

interface EventType {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    extendedProps?: {
        attendanceStatus?: "yes" | "no" | "maybe" | undefined;
    };
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

const DEFAULT_CALENDAR_COLOR = "#AD1457";

export default function CustomCalendar({ onCalendarApiReady, onTitleChange, onViewChange }: CustomCalendarProps) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [events, setEvents] = useState<EventType[]>([]);
    const calendars = useSelector((state: RootState) => state.calendars.calendars) as Calendar[];
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

    const fetchEventsWithAttendance = async () => {
        if (!calendars.length || !currentUser?.id) return;

        const allEventsPromises = calendars
            .filter(calendar => selectedCalendarIds.includes(calendar.id) &&
                (calendar.creationByUserId === currentUser.id || calendar.participants.some(p => p.userId === currentUser.id)))
            .flatMap(calendar => calendar.events.map(async (event) => {
                const response = await getEventById(event.id);
                if (response.success) {
                    const attendanceStatus = response.data.participants.find(
                        (p: any) => p.userId === currentUser?.id
                    )?.attendanceStatus as "yes" | "no" | "maybe" | undefined;
                    const participant = calendar.participants.find(p => p.userId === currentUser?.id);
                    const calendarColor = participant?.color || DEFAULT_CALENDAR_COLOR;

                    let backgroundColor = "#ffffff";
                    let textColor = calendarColor;
                    let classNames = [];

                    switch (attendanceStatus) {
                        case "yes":
                            backgroundColor = calendarColor;
                            textColor = "#ffffff";
                            break;
                        case "no":
                            backgroundColor = "#ffffff";
                            textColor = calendarColor;
                            break;
                        case "maybe":
                            backgroundColor = calendarColor;
                            textColor = "#ffffff";
                            classNames.push("event-maybe");
                            break;
                    }

                    return {
                        id: event.id.toString(),
                        title: event.title,
                        start: new Date(event.startAt),
                        end: new Date(event.endAt),
                        allDay: event.startAt.endsWith("00:00:00") && event.endAt.endsWith("23:59:59"),
                        backgroundColor,
                        borderColor: calendarColor,
                        textColor,
                        classNames,
                        extendedProps: { attendanceStatus },
                    } as EventType;
                }
                return {
                    id: event.id.toString(),
                    title: event.title,
                    start: new Date(event.startAt),
                    end: new Date(event.endAt),
                    allDay: event.startAt.endsWith("00:00:00") && event.endAt.endsWith("23:59:59"),
                    backgroundColor: "#ffffff",
                    borderColor: DEFAULT_CALENDAR_COLOR,
                    textColor: DEFAULT_CALENDAR_COLOR,
                    extendedProps: { attendanceStatus: undefined },
                } as EventType;
            }));

        const allEvents = await Promise.all(allEventsPromises);
        setEvents(allEvents);
    };

    useEffect(() => {
        fetchEventsWithAttendance();
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
                id: participant.id,
                fullName: participant.fullName,
                email: participant.email,
                profilePicture: participant.profilePicture,
                role: participant.role === "user" ? "member" : participant.role,
                attendanceStatus: participant.attendanceStatus,
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
                color: selectedEvent.color || "#3788d8",
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

    const handleDeleteEvent = async () => {
        if (selectedEvent) {
            const eventId = parseInt(selectedEvent.id, 10);
            console.log("Deleting event with ID:", eventId);

            const result = await deleteEvent(dispatch, eventId);

            if (result.success) {
                setEvents((prevEvents) => prevEvents.filter((e) => e.id !== selectedEvent.id));
                showSuccessToast(ToastStatusMessages.EVENTS.DELETE_SUCCESS);
            } else {
                showErrorToasts(result.errors || ToastStatusMessages.EVENTS.DELETE_FAILED);
            }
            handleEventClickClose();
        }
    };

    const handleAttendanceChange = async (userId: number, status: "yes" | "no" | "maybe" | undefined) => {
        if (selectedEvent) {
            const eventId = parseInt(selectedEvent.id);
            let result;

            const updatedParticipants = selectedEvent.participants.map((p: any) =>
                p.id === userId ? { ...p, attendanceStatus: status } : p
            );
            setSelectedEvent({ ...selectedEvent, participants: updatedParticipants });

            switch (status) {
                case "yes":
                    result = await joinEvent(eventId);
                    break;
                case "no":
                    result = await leaveEvent(eventId);
                    break;
                case "maybe":
                    result = await tentativeEvent(eventId);
                    break;
                default:
                    console.warn("No status provided, skipping server update");
                    return;
            }

            if (result.success) {
                setEvents(prevEvents =>
                    prevEvents.map(event =>
                        event.id === selectedEvent.id
                            ? {
                                ...event,
                                backgroundColor: status === "yes" || status === "maybe" ? "#3788d8" : "#ffffff",
                                borderColor: "#3788d8",
                                textColor: status === "yes" || status === "maybe" ? "#ffffff" : "#3788d8",
                                classNames: status === "maybe" ? ["event-maybe"] : [], // Apply class for "maybe"
                                extendedProps: { attendanceStatus: status },
                            } as EventType
                            : event
                    )
                );
            } else {
                setSelectedEvent(selectedEvent);
            }
        }
    };

    useEffect(() => {
        if (tempEventId || selectedEvent) {
            const eventId = tempEventId || selectedEvent?.id;
            const eventEl = document.querySelector(`.fc-event[data-event-id="${eventId}"]`);
            if (eventEl) {
                const rect = eventEl.getBoundingClientRect();
                const popoverWidth = tempEventId ? 430 : 385;
                const popoverHeight = tempEventId ? 390 : 280;
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;
                const offset = 10;

                let xPosition;
                if (currentView === "timeGridDay") {
                    xPosition = (screenWidth - popoverWidth) / 2 + window.scrollX;
                } else {
                    const rightEdge = rect.right + popoverWidth + offset;
                    const isOverflowingX = rightEdge > screenWidth;
                    xPosition = isOverflowingX
                        ? rect.left + window.scrollX - popoverWidth - offset
                        : rect.right + window.scrollX + offset;
                }

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
    }, [tempEventId, selectedEvent, currentView]);

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
                    headerToolbar={false}
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

                        const newEvent: EventType = {
                            id: newEventId,
                            title: "New Event",
                            start: info.start,
                            end: eventEnd,
                            allDay: isAllDayEvent,
                            backgroundColor: "#3788d8",
                            borderColor: "#3788d8",
                            textColor: "#ffffff",
                            extendedProps: {
                                attendanceStatus: "yes" as const,
                            },
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
                                creationByUserId: response.data.creationByUserId,
                                calendarTitle: response.data.calendar.title,
                                calendarType: response.data.calendar.type,
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
                                })),
                            });
                            setTempEventId(null);
                            setIsPositionReady(false);
                            setClickPosition(undefined);
                        }
                    }}
                    eventContent={(arg) => {
                        const title = arg.event.title || "New Event";
                        const isAllDay = arg.event.allDay;
                        const attendanceStatus = arg.event.extendedProps?.attendanceStatus;

                        const textStyle = {
                            color: attendanceStatus === "yes" || attendanceStatus === "maybe" ? "#ffffff" : "#3788d8",
                            textDecoration: attendanceStatus === "no" ? "line-through" : "none",
                        };

                        if (isAllDay) {
                            return (
                                <div className="custom-event">
                                    <div className="event-title truncate" style={textStyle}>
                                        {title}
                                    </div>
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
                                <div className="event-title truncate" style={textStyle}>
                                    {title}
                                </div>
                                <div className="event-time truncate" style={textStyle}>
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
                    onAttendanceChange={handleAttendanceChange}
                />
            )}
        </div>
    );
}