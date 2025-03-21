import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect, useRef } from "react";
import "@/components/styles/fullcalendar.css";
import CreateEventPopover from "@/components/event/CreateEventPopover.tsx";
import EventDetailsPopover from "@/components/event/EventDetailsPopover.tsx";
import { useDispatch, useSelector } from "react-redux";
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
import { ToastStatusMessages } from "@/constants/toastStatusMessages.ts";
import { showErrorToasts, showSuccessToast } from "@/components/utils/ToastNotifications.tsx";

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
        calendarId: number; // Добавляем calendarId для связи с календарём
        color?: string; // Добавляем color
        calendarColor?: string; // Добавляем calendarColor
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
            onCalendarApiReady({
                prev: () => calendarApi.prev(),
                next: () => calendarApi.next(),
                today: () => calendarApi.today(),
                changeView: (view: string) => calendarApi.changeView(view),
                getTitle: () => currentTitle,
            });
        }
    }, [onCalendarApiReady]);

    const getCalendarColor = (calendarId: number | undefined) => {
        if (!calendarId || !currentUser?.id) return DEFAULT_CALENDAR_COLOR;
        const reduxCalendar = calendars.find((cal) => cal.id === calendarId);
        if (!reduxCalendar || !reduxCalendar.participants) return DEFAULT_CALENDAR_COLOR;
        const participant = reduxCalendar.participants.find((p) => p.userId === currentUser.id);
        return participant?.color || DEFAULT_CALENDAR_COLOR;
    };

    const handleAttendanceChange = async (userId: number, status: "yes" | "no" | "maybe" | undefined) => {
        if (selectedEvent) {
            const eventId = parseInt(selectedEvent.id);
            const calendarId = selectedEvent.calendarId;
            const calendarColor = getCalendarColor(calendarId);

            console.log(`handleAttendanceChange - eventId: ${eventId}, status: ${status}, calendarId: ${calendarId}, calendarColor: ${calendarColor}`);

            const updatedParticipants = selectedEvent.participants.map((p: any) =>
                p.id === userId ? { ...p, attendanceStatus: status } : p
            );
            setSelectedEvent({ ...selectedEvent, participants: updatedParticipants });

            let result;
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
                console.log(`Attendance change successful, updating events with color: ${calendarColor}`);

                const currentEvent = events.find(event => event.id === selectedEvent.id);
                if (!currentEvent) return;

                const updatedEvent: EventType = {
                    ...currentEvent,
                    backgroundColor: status === "yes" || status === "maybe" ? calendarColor : "#ffffff",
                    borderColor: calendarColor,
                    textColor: status === "yes" || status === "maybe" ? "#ffffff" : calendarColor,
                    extendedProps: { ...currentEvent.extendedProps, attendanceStatus: status },
                };

                // Обновляем состояние events
                setEvents(prevEvents =>
                    prevEvents.map(event =>
                        event.id === selectedEvent.id ? updatedEvent : event
                    )
                );

                const calendarApi = calendarRef.current?.getApi();
                if (calendarApi) {
                    const event = calendarApi.getEventById(selectedEvent.id);
                    if (event) {
                        event.remove();

                        calendarApi.addEvent({
                            id: updatedEvent.id,
                            title: updatedEvent.title,
                            start: updatedEvent.start,
                            end: updatedEvent.end,
                            allDay: updatedEvent.allDay,
                            backgroundColor: updatedEvent.backgroundColor,
                            borderColor: updatedEvent.borderColor,
                            textColor: updatedEvent.textColor,
                            extendedProps: updatedEvent.extendedProps,
                        });
                    }
                }
            } else {
                setSelectedEvent(selectedEvent);
                showErrorToasts(ToastStatusMessages.EVENTS.UPDATE_FAILED);
            }
        }
    };

    const fetchEventsWithAttendance = async () => {
        if (!calendars.length || !currentUser?.id) return;

        const allEventsPromises = calendars
            .filter(calendar => selectedCalendarIds.includes(calendar.id) &&
                (calendar.creationByUserId === currentUser.id || calendar.participants.some(p => p.userId === currentUser.id)))
            .flatMap(calendar => calendar.events.map(async (event) => {
                const response = await getEventById(event.id);
                const calendarColor = getCalendarColor(calendar.id);

                if (response.success) {
                    const currentUserParticipant = response.data.participants.find(
                        (p: any) => p.userId === currentUser?.id
                    );
                    const attendanceStatus = currentUserParticipant?.attendanceStatus as "yes" | "no" | "maybe" | undefined;
                    const eventColor = currentUserParticipant?.color || calendarColor;

                    let backgroundColor = "#ffffff";
                    let borderColor = calendarColor;
                    let textColor = eventColor;

                    switch (attendanceStatus) {
                        case "yes":
                            backgroundColor = eventColor;
                            textColor = "#ffffff";
                            borderColor = eventColor;
                            break;
                        case "no":
                            backgroundColor = "#ffffff";
                            textColor = eventColor;
                            borderColor = eventColor;
                            break;
                        case "maybe":
                            backgroundColor = eventColor;
                            textColor = "#ffffff";
                            borderColor = eventColor;
                            break;
                    }

                    return {
                        id: event.id.toString(),
                        title: event.title,
                        start: new Date(event.startAt),
                        end: new Date(event.endAt),
                        allDay: event.startAt.endsWith("00:00:00") && event.endAt.endsWith("23:59:59"),
                        backgroundColor,
                        borderColor,
                        textColor,
                        extendedProps: {
                            attendanceStatus,
                            calendarId: calendar.id,
                            color: eventColor,
                            calendarColor,
                        },
                    } as EventType;
                }
                return {
                    id: event.id.toString(),
                    title: event.title,
                    start: new Date(event.startAt),
                    end: new Date(event.endAt),
                    allDay: event.startAt.endsWith("00:00:00") && event.endAt.endsWith("23:59:59"),
                    backgroundColor: "#ffffff",
                    borderColor: calendarColor,
                    textColor: calendarColor,
                    extendedProps: {
                        attendanceStatus: undefined,
                        calendarId: calendar.id,
                        color: undefined,
                        calendarColor,
                    },
                } as EventType;
            }));

        const allEvents = await Promise.all(allEventsPromises);
        setEvents(allEvents);
    };

    useEffect(() => {
        fetchEventsWithAttendance();
    }, [calendars, selectedCalendarIds, currentUser?.id]);

    const handleColorChange = (eventId: string, newColor: string) => {
        // Находим текущее событие в состоянии events
        const currentEvent = events.find(event => event.id === eventId);
        if (!currentEvent) return;

        const calendarColor = getCalendarColor(currentEvent.extendedProps?.calendarId);
        const attendanceStatus = currentEvent.extendedProps?.attendanceStatus;

        // Создаём обновлённое событие
        const updatedEvent: EventType = {
            ...currentEvent,
            backgroundColor: attendanceStatus === "yes" || attendanceStatus === "maybe" ? newColor : "#ffffff",
            borderColor: newColor,
            textColor: attendanceStatus === "yes" || attendanceStatus === "maybe" ? "#ffffff" : newColor,
            extendedProps: {
                ...currentEvent.extendedProps,
                color: newColor,
                calendarColor,
            },
        };

        setEvents(prevEvents =>
            prevEvents.map(event =>
                event.id === eventId ? updatedEvent : event
            )
        );

        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const event = calendarApi.getEventById(eventId);
            if (event) {
                event.remove();

                calendarApi.addEvent({
                    id: updatedEvent.id,
                    title: updatedEvent.title,
                    start: updatedEvent.start,
                    end: updatedEvent.end,
                    allDay: updatedEvent.allDay,
                    backgroundColor: updatedEvent.backgroundColor,
                    borderColor: updatedEvent.borderColor,
                    textColor: updatedEvent.textColor,
                    extendedProps: updatedEvent.extendedProps,
                });
            }
        }

        if (selectedEvent && selectedEvent.id === eventId) {
            setSelectedEvent({
                ...selectedEvent,
                color: newColor,
                participants: selectedEvent.participants.map((p: any) =>
                    p.id === currentUser?.id ? { ...p, color: newColor } : p
                ),
            });
        }
    };

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
                color: selectedEvent.color || getCalendarColor(selectedEvent.calendarId),
                selectedUsers: formattedUsers,
                creatorId: selectedEvent.creationByUserId,
            };

            setDraft(draftData);
            navigate("/edit-event");
        }
        handleEventClickClose();
    };

    const handleDeleteEvent = async () => {
        if (selectedEvent) {
            const eventId = parseInt(selectedEvent.id, 10);
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
                        const el = info.el as HTMLElement;
                        el.setAttribute("data-event-id", info.event.id);
                        const attendanceStatus = info.event.extendedProps?.attendanceStatus;
                        const calendarColor = info.event.extendedProps?.calendarColor || "#AD1457";
                        const eventColor = info.event.extendedProps?.color || calendarColor;

                        // Добавляем класс .event-with-stripe только если цвета различаются
                        if (eventColor !== calendarColor) {
                            el.classList.add("event-with-stripe");
                        }

                        // Применяем стили
                        if (attendanceStatus === "maybe") {
                            el.style.backgroundImage = `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255, 255, 255, 0.2) 5px, rgba(255, 255, 255, 0.2) 10px)`;
                            el.style.backgroundColor = eventColor;
                        } else {
                            el.style.backgroundImage = "none";
                            el.style.backgroundColor = attendanceStatus === "yes" ? eventColor : "#ffffff";
                        }

                        // Устанавливаем цвет полоски через CSS-переменную
                        el.style.setProperty("--calendar-stripe-color", calendarColor);
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
                        const defaultCalendarId = selectedCalendarIds[0] || calendars[0]?.id;
                        const calendarColor = getCalendarColor(defaultCalendarId);

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
                            backgroundColor: calendarColor,
                            borderColor: calendarColor,
                            textColor: "#ffffff",
                            extendedProps: {
                                attendanceStatus: "yes" as const,
                                calendarId: defaultCalendarId ?? 0, // Устанавливаем 0, если calendarId undefined
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
                            // Извлекаем цвет для текущего пользователя
                            const currentUserParticipant = response.data.participants.find(
                                (p: any) => p.userId === currentUser?.id
                            );
                            const eventColor = currentUserParticipant?.color || "#AD1457"; // Дефолтный цвет, если не найден

                            setSelectedEvent({
                                id: info.event.id,
                                title: response.data.title,
                                start: response.data.startAt,
                                end: response.data.endAt,
                                description: response.data.description,
                                category: response.data.category,
                                type: response.data.type,
                                calendarId: response.data.calendarId,
                                color: eventColor, // Передаём цвет текущего пользователя
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
                                    color: p.color, // Передаём цвет каждого участника
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
                        const calendarColor = getCalendarColor(arg.event.extendedProps.calendarId);

                        const textStyle = {
                            color: attendanceStatus === "yes" || attendanceStatus === "maybe" ? "#ffffff" : calendarColor,
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
                    onColorChange={handleColorChange}
                />
            )}
        </div>
    );
}