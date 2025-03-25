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
    tentativeEvent,
    updateEventDate,
} from "@/components/redux/actions/eventActions.ts";
import { useNavigate } from "react-router-dom";
import { useEventDraft } from "@/components/utils/EventDraftContext.tsx";
import { format } from "date-fns";
import { Toggle } from "@/components/ui/toggle.tsx";
import { ToastStatusMessages } from "@/constants/toastStatusMessages.ts";
import { showErrorToasts, showSuccessToast } from "@/components/utils/ToastNotifications.tsx";
import { Video, BellRing, BookmarkCheck, Cake, PartyPopper } from "lucide-react";

interface Participant {
    userId: number;
    attendanceStatus?: "yes" | "no" | "maybe" | undefined;
    color?: string;
}

interface Calendar {
    id: number;
    creationByUserId: number;
    participants: Participant[];
    events: CalendarEvent[];
    type?: string;
}

interface CalendarEvent {
    id: number;
    title: string;
    startAt: string;
    endAt: string;
    description?: string;
    type?: string;
    participants?: EventParticipant[];
}

interface EventParticipant {
    userId: number;
    attendanceStatus?: "yes" | "no" | "maybe" | undefined;
    color?: string;
    user?: {
        id: number;
        fullName: string;
        email: string;
        profilePicture: string;
    };
    creationAt?: string;
}

export interface EventType {
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
        calendarId: number;
        color?: string;
        calendarColor?: string;
        description?: string;
        type?: string;
        calendarType?: string;
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
    onEventsChange?: (events: EventType[]) => void;
    selectedEvent?: any;
    onEventSelect?: (event: any) => void;
    selectedDate1?: Date;
}

const DEFAULT_CALENDAR_COLOR = "#039BE5";

export default function CustomCalendar({
                                           onCalendarApiReady,
                                           onTitleChange,
                                           onViewChange,
                                           onEventsChange,
                                           selectedEvent: externalSelectedEvent,
                                           onEventSelect,
                                           selectedDate1,
                                       }: CustomCalendarProps) {
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
    const [isFromSearch, setIsFromSearch] = useState(false);

    useEffect(() => {
        if (selectedDate1 && calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            const currentStart = calendarApi.view.activeStart;
            const currentEnd = calendarApi.view.activeEnd;

            if (selectedDate1 < currentStart || selectedDate1 > currentEnd) {
                calendarApi.gotoDate(selectedDate1);
            }

        }
    }, [selectedDate1]);

    useEffect(() => {
        if (externalSelectedEvent) {
            setSelectedEvent(externalSelectedEvent);
            setIsFromSearch(true);
            setClickPosition({ x: window.innerWidth / 2 - 192.5, y: 60 });
            setIsPositionReady(true);
            setTempEventId(null);
        }
    }, [externalSelectedEvent]);

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

    useEffect(() => {
        if (onEventsChange) {
            onEventsChange(events);
        }
    }, [events, onEventsChange]);

    const getCalendarColor = (calendarId: number | undefined): string => {
        if (!currentUser) {
            return DEFAULT_CALENDAR_COLOR;
        }
        const mainCalendar = calendars.find((cal) => cal.type === "main" && cal.participants.some((p) => p.userId === currentUser?.id));
        if (!calendarId || !currentUser?.id) {
            if (mainCalendar) {
                const participant = mainCalendar.participants.find((p) => p.userId === currentUser.id);
                return participant?.color || DEFAULT_CALENDAR_COLOR;
            }
            return DEFAULT_CALENDAR_COLOR;
        }
        const reduxCalendar = calendars.find((cal) => cal.id === calendarId);
        if (!reduxCalendar || !reduxCalendar.participants) {
            if (mainCalendar) {
                const participant = mainCalendar.participants.find((p) => p.userId === currentUser.id);
                return participant?.color || DEFAULT_CALENDAR_COLOR;
            }
            return DEFAULT_CALENDAR_COLOR;
        }
        const participant = reduxCalendar.participants.find((p) => p.userId === currentUser.id);
        return participant?.color || DEFAULT_CALENDAR_COLOR;
    };

    const handleAttendanceChange = async (userId: number, status: "yes" | "no" | "maybe" | undefined) => {
        if (selectedEvent) {
            const eventId = parseInt(selectedEvent.id);
            const calendarId = selectedEvent.calendarId || 0;
            const calendarColor = getCalendarColor(calendarId);
            const eventColor = selectedEvent.color || calendarColor;

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
                    return;
            }

            if (result.success) {
                const currentEvent = events.find(event => event.id === selectedEvent.id);
                if (!currentEvent) return;

                const updatedEvent: EventType = {
                    ...currentEvent,
                    backgroundColor: status === "yes" || status === "maybe" ? eventColor : "#ffffff",
                    textColor: status === "yes" || status === "maybe" ? "#ffffff" : eventColor,
                    extendedProps: {
                        ...currentEvent.extendedProps,
                        attendanceStatus: status,
                        calendarId: currentEvent.extendedProps?.calendarId || 0,
                    },
                };

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

        const allEvents = calendars
            .filter(
                (calendar) =>
                    selectedCalendarIds.includes(calendar.id) &&
                    (calendar.creationByUserId === currentUser.id ||
                        calendar.participants.some((p) => p.userId === currentUser.id))
            )
            .flatMap((calendar) =>
                calendar.events.map((event) => {
                    const calendarColor = getCalendarColor(calendar.id);

                    const currentUserParticipant = event.participants?.find(
                        (p) => p.userId === currentUser?.id
                    );
                    const attendanceStatus = currentUserParticipant?.attendanceStatus as
                        | "yes"
                        | "no"
                        | "maybe"
                        | undefined;
                    const eventColor = currentUserParticipant?.color || calendarColor;

                    let backgroundColor = "#ffffff";
                    let borderColor = eventColor;
                    let textColor = eventColor;

                    if (calendar.type === "holidays" || calendar.type === "birthdays") {
                        backgroundColor = eventColor;
                        textColor = "#ffffff";
                        borderColor = eventColor;
                    } else {
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
                            color: currentUserParticipant?.color,
                            calendarColor,
                            description: event.description,
                            type: event.type,
                            calendarType: calendar.type,
                        },
                    } as EventType;
                })
            );

        setEvents(allEvents);

        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.getEvents().forEach((event) => event.remove());
            allEvents.forEach((event) => {
                calendarApi.addEvent({
                    id: event.id,
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    allDay: event.allDay,
                    backgroundColor: event.backgroundColor,
                    borderColor: event.borderColor,
                    textColor: event.textColor,
                    extendedProps: event.extendedProps,
                });
            });
        }
    };

    useEffect(() => {
        const updateEvents = async () => {
            await fetchEventsWithAttendance();

            const calendarApi = calendarRef.current?.getApi();
            if (calendarApi) {
                calendarApi.getEvents().forEach(event => {
                    const eventId = event.id;
                    const eventEl = document.querySelector(`.fc-event[data-event-id="${eventId}"]`) as HTMLElement;
                    if (eventEl) {
                        const calendarId = event.extendedProps?.calendarId;
                        const newCalendarColor = getCalendarColor(calendarId);
                        eventEl.style.setProperty("--calendar-stripe-color", newCalendarColor);

                        if (event.extendedProps?.color && event.extendedProps.color !== newCalendarColor) {
                            eventEl.classList.add("event-with-stripe");
                        } else {
                            eventEl.classList.remove("event-with-stripe");
                        }
                    }
                });
            }
        };

        updateEvents();
    }, [calendars, selectedCalendarIds, currentUser?.id]);

    const handleColorChange = (eventId: string, newColor: string) => {
        const currentEvent = events.find(event => event.id === eventId);
        if (!currentEvent) return;

        const calendarColor = getCalendarColor(currentEvent.extendedProps?.calendarId);
        const attendanceStatus = currentEvent.extendedProps?.attendanceStatus;

        const updatedEvent: EventType = {
            ...currentEvent,
            backgroundColor: attendanceStatus === "yes" || attendanceStatus === "maybe" ? newColor : "#ffffff",
            borderColor: newColor,
            textColor: attendanceStatus === "yes" || attendanceStatus === "maybe" ? "#ffffff" : newColor,
            extendedProps: {
                ...currentEvent.extendedProps,
                color: newColor,
                calendarColor,
                calendarId: currentEvent.extendedProps?.calendarId || 0,
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

                const eventEl = document.querySelector(`.fc-event[data-event-id="${eventId}"]`) as HTMLElement;
                if (eventEl) {
                    if (newColor && newColor !== calendarColor) {
                        eventEl.classList.add("event-with-stripe");
                    } else {
                        eventEl.classList.remove("event-with-stripe");
                    }
                }
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
        setIsFromSearch(false);
        if (onEventSelect) onEventSelect(null);
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
                notifyBeforeMinutes: selectedEvent.notifyBeforeMinutes,
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

    const handleEventUpdate = async (info: any) => {
        const eventId = parseInt(info.event.id, 10);
        const isAllDay = info.event.allDay;

        if (!info.event.start || !(info.event.start instanceof Date) || isNaN(info.event.start.getTime())) {
            info.revert();
            return;
        }

        const currentEvent = events.find((e) => e.id === info.event.id);
        const wasAllDay = currentEvent?.allDay || false;

        const startAt = isAllDay
            ? format(info.event.start, "yyyy-MM-dd 00:00:00")
            : format(info.event.start, "yyyy-MM-dd HH:mm:ss");

        let endAt;
        if (isAllDay) {
            if (!info.event.end || !wasAllDay) {
                const endDate = new Date(info.event.start);
                endDate.setHours(23, 59, 59, 0);
                endAt = format(endDate, "yyyy-MM-dd HH:mm:ss");
            } else if (!(info.event.end instanceof Date) || isNaN(info.event.end.getTime())) {
                info.revert();
                return;
            } else {
                const endDate = new Date(info.event.end);
                endDate.setHours(23, 59, 59, 0);
                endAt = format(endDate, "yyyy-MM-dd HH:mm:ss");
            }
        } else {
            if (!info.event.end) {
                const endDate = new Date(info.event.start);
                endDate.setMinutes(endDate.getMinutes() + 30);
                endAt = format(endDate, "yyyy-MM-dd HH:mm:ss");
            } else if (!(info.event.end instanceof Date) || isNaN(info.event.end.getTime())) {
                info.revert();
                return;
            } else {
                endAt = format(info.event.end, "yyyy-MM-dd HH:mm:ss");
            }
        }

        const payload = {
            startAt,
            endAt,
        };

        const result = await updateEventDate(dispatch, eventId, payload);

        if (result.success) {
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.id === info.event.id
                        ? {
                            ...event,
                            start: info.event.start,
                            end: info.event.end || new Date(endAt),
                            allDay: isAllDay,
                        }
                        : event
                )
            );
            showSuccessToast(ToastStatusMessages.EVENTS.UPDATE_SUCCESS);
        } else {
            info.revert();
            showErrorToasts(result.errors || ToastStatusMessages.EVENTS.UPDATE_FAILED);
        }
    };

    useEffect(() => {
        if ((tempEventId || selectedEvent) && !isFromSearch) {
            const eventId = tempEventId || selectedEvent?.id;
            const eventEl = document.querySelector(`.fc-event[data-event-id="${eventId}"]`);
            if (eventEl) {
                const rect = eventEl.getBoundingClientRect();
                const popoverWidth = tempEventId ? 430 : 385;
                const popoverHeight = tempEventId ? 390 : 350;
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
    }, [tempEventId, selectedEvent, currentView, isFromSearch]);

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

    const applyMirrorStyles = (mainCalendarColor: string) => {
        const mirrorEvent = document.querySelector(".fc-event-mirror") as HTMLElement;
        if (mirrorEvent) {
            mirrorEvent.style.backgroundColor = mainCalendarColor;
            mirrorEvent.style.borderColor = mainCalendarColor;
            mirrorEvent.style.color = "#ffffff";

            const textElements = mirrorEvent.querySelectorAll(".fc-event-title, .fc-event-time");
            textElements.forEach((el) => {
                (el as HTMLElement).style.color = "#ffffff";
            });
        }
    };

    const getMainCalendarColor = () => {
        const mainCalendar = calendars.find((cal) => cal.type === "main");
        if (mainCalendar && currentUser?.id) {
            const participant = mainCalendar.participants.find((p) => p.userId === currentUser.id);
            return participant?.color || DEFAULT_CALENDAR_COLOR;
        }
        return DEFAULT_CALENDAR_COLOR;
    };

    const getEventColor = (eventId: string) => {
        const event = events.find((e) => e.id === eventId);
        if (!event) {
            return DEFAULT_CALENDAR_COLOR;
        }
        const eventColor = event.extendedProps?.color;
        if (eventColor) {
            return eventColor;
        }
        const calendarId = event.extendedProps?.calendarId;
        const calendarColor = getCalendarColor(calendarId);
        return calendarColor;
    };

    return (
        <div className="z-0 p-4 bg-white rounded-lg shadow-md relative h-[calc(95vh-2rem)]" style={{ zIndex: 10 }}>
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
                    eventDragStart={(info) => {
                        const eventColor = getEventColor(info.event.id);
                        const calendarContainer = document.querySelector(".calendar-container") as HTMLElement;
                        if (calendarContainer) {
                            calendarContainer.style.setProperty("--main-calendar-color", eventColor);
                        }
                    }}
                    eventDragStop={() => {
                        const calendarContainer = document.querySelector(".calendar-container") as HTMLElement;
                        if (calendarContainer) {
                            const mainCalendarColor = getMainCalendarColor();
                            calendarContainer.style.setProperty("--main-calendar-color", mainCalendarColor);
                        }
                    }}
                    eventResizeStart={(info) => {
                        const eventColor = getEventColor(info.event.id);
                        const calendarContainer = document.querySelector(".calendar-container") as HTMLElement;
                        if (calendarContainer) {
                            calendarContainer.style.setProperty("--main-calendar-color", eventColor);
                        }
                    }}
                    eventResizeStop={() => {
                        const calendarContainer = document.querySelector(".calendar-container") as HTMLElement;
                        if (calendarContainer) {
                            const mainCalendarColor = getMainCalendarColor();
                            calendarContainer.style.setProperty("--main-calendar-color", mainCalendarColor);
                        }
                    }}
                    eventDrop={handleEventUpdate}
                    eventResize={handleEventUpdate}
                    eventDidMount={(info) => {
                        const el = info.el as HTMLElement;
                        el.setAttribute("data-event-id", info.event.id);
                        const attendanceStatus = info.event.extendedProps?.attendanceStatus;
                        const calendarColor = info.event.extendedProps?.calendarColor || "#039BE5";
                        const eventColor = info.event.extendedProps?.color || calendarColor;
                        const calendarType = info.event.extendedProps?.calendarType;

                        if (eventColor !== calendarColor) {
                            el.classList.add("event-with-stripe");
                        }

                        if (calendarType === "holidays" || calendarType === "birthdays") {
                            el.style.backgroundImage = "none";
                            el.style.backgroundColor = eventColor;
                            el.style.borderColor = eventColor;
                            el.style.color = "#ffffff";
                        } else if (attendanceStatus === "maybe") {
                            el.style.backgroundImage = `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255, 255, 255, 0.2) 5px, rgba(255, 255, 255, 0.2) 10px)`;
                            el.style.backgroundColor = eventColor;
                        } else {
                            el.style.backgroundImage = "none";
                            el.style.backgroundColor = attendanceStatus === "yes" ? eventColor : "#ffffff";
                        }

                        if (info.event.id === tempEventId) {
                            el.style.backgroundColor = calendarColor;
                            el.style.borderColor = calendarColor;
                            el.style.color = "#ffffff";
                        }

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
                        const defaultCalendarId = selectedCalendarIds[0] || calendars[0]?.id || 0;
                        const mainCalendarColor = getMainCalendarColor();

                        const calendarContainer = document.querySelector(".calendar-container") as HTMLElement;
                        if (calendarContainer) {
                            calendarContainer.style.setProperty("--main-calendar-color", mainCalendarColor);
                        }

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
                            backgroundColor: mainCalendarColor,
                            borderColor: mainCalendarColor,
                            textColor: "#ffffff",
                            extendedProps: {
                                attendanceStatus: "yes" as const,
                                calendarId: defaultCalendarId,
                                calendarColor: mainCalendarColor,
                                color: undefined,
                            },
                        };

                        setEvents((prevEvents) => [...prevEvents, newEvent]);
                        setSelectedDate(info.start.toISOString());
                        setEndDate(eventEnd.toISOString());
                        setTempEventId(newEventId);
                        setIsPositionReady(false);
                        setClickPosition(undefined);
                        setSelectedEvent(null);

                        applyMirrorStyles(mainCalendarColor);
                    }}
                    eventClick={async (info) => {
                        const eventId = parseInt(info.event.id, 10);
                        const response = await getEventById(eventId);
                        if (response.success) {
                            const currentUserParticipant = response.data.participants.find(
                                (p: any) => p.userId === currentUser?.id
                            );
                            const calendarId = response.data.calendarId || 0;
                            const calendarColor = getCalendarColor(calendarId);
                            const eventColor = currentUserParticipant?.color || calendarColor;

                            const eventData = {
                                id: info.event.id,
                                title: response.data.title,
                                start: response.data.startAt,
                                end: response.data.endAt,
                                description: response.data.description,
                                category: response.data.category,
                                type: response.data.type,
                                calendarId: calendarId,
                                calendarColor: calendarColor,
                                color: eventColor,
                                creationByUserId: response.data.creationByUserId,
                                calendarTitle: response.data.calendar.title,
                                calendarType: response.data.calendar.type,
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

                            setSelectedEvent(eventData);
                            setIsFromSearch(false);
                            if (onEventSelect) onEventSelect(eventData);
                            setTempEventId(null);
                            setIsPositionReady(false);
                            setClickPosition(undefined);
                        }
                    }}
                    eventContent={(arg) => {
                        const title = arg.event.title || "New Event";
                        const isAllDay = arg.event.allDay;
                        const attendanceStatus = arg.event.extendedProps?.attendanceStatus;
                        const calendarColor = getCalendarColor(arg.event.extendedProps?.calendarId);
                        const eventColor = arg.event.extendedProps?.color || calendarColor;
                        const eventType = arg.event.extendedProps?.type;
                        const calendarType = arg.event.extendedProps?.calendarType;

                        const textStyle = {
                            color: (calendarType === "holidays" || calendarType === "birthdays")
                                ? "#ffffff"
                                : (arg.isMirror ? "#ffffff" : (attendanceStatus === "yes" || attendanceStatus === "maybe" ? "#ffffff" : eventColor)),
                            textDecoration: attendanceStatus === "no" ? "line-through" : "none",
                        };

                        let EventIcon;
                        switch (eventType) {
                            case "meeting":
                                EventIcon = Video;
                                break;
                            case "reminder":
                                EventIcon = BellRing;
                                break;
                            case "task":
                                EventIcon = BookmarkCheck;
                                break;
                            default:
                                EventIcon = null;
                        }

                        let CalendarIcon;
                        switch (calendarType) {
                            case "birthdays":
                                CalendarIcon = Cake;
                                break;
                            case "holidays":
                                CalendarIcon = PartyPopper;
                                break;
                            default:
                                CalendarIcon = null;
                        }

                        const IconComponent = CalendarIcon || EventIcon;

                        if (isAllDay) {
                            return (
                                <div className="custom-event flex items-center">
                                    {IconComponent && (
                                        <IconComponent
                                            className="mr-1 shrink-0"
                                            size={16}
                                            style={{ color: textStyle.color }}
                                        />
                                    )}
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

                        const durationMs = arg.event.end && arg.event.start
                            ? arg.event.end.getTime() - arg.event.start.getTime()
                            : 0;
                        const durationMinutes = durationMs / (1000 * 60);
                        const isShortEvent = durationMinutes <= 30;

                        return (
                            <div className="custom-event">
                                <div className="flex items-center">
                                    {IconComponent && (
                                        <IconComponent
                                            className="ml-0.5 mr-1 mt-0.5 shrink-0"
                                            size={16}
                                            style={{ color: textStyle.color }}
                                        />
                                    )}
                                    <div className="event-title truncate" style={textStyle}>
                                        {title}
                                    </div>
                                </div>

                                {!isShortEvent && (
                                    <div className="ml-0.5 event-time truncate" style={textStyle}>
                                        {startTime} - {endTime}
                                    </div>
                                )}
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