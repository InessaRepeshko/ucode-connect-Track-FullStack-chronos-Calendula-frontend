import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect, useRef } from "react";
import "@/components/styles/fullcalendar.css";
import CreateEventPopover from "@/components/event/CreateEventPopover.tsx";

interface EventType {
    id: string;
    title: string;
    start: Date;
    end: Date;
}

export default function CustomCalendar() {
    const [events, setEvents] = useState<EventType[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null); // Новое состояние
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>();
    const [tempEventId, setTempEventId] = useState<string | null>(null);
    const [isPositionReady, setIsPositionReady] = useState(false);
    const calendarRef = useRef<FullCalendar>(null);

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
        setEndDate(null); // Сбрасываем
        setClickPosition(undefined);
        setIsPositionReady(false);
    };

    const handleClose = () => {
        if (tempEventId) {
            setEvents((prevEvents) => prevEvents.filter((event) => event.id !== tempEventId));
        }
        setSelectedDate(null);
        setEndDate(null); // Сбрасываем
        setClickPosition(undefined);
        setTempEventId(null);
        setIsPositionReady(false);
    };

    useEffect(() => {
        if (tempEventId) {
            const eventEl = document.querySelector(`.fc-event[data-event-id="${tempEventId}"]`);
            if (eventEl) {
                const rect = eventEl.getBoundingClientRect();
                const popoverWidth = 480;
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

    return (
        <div className="p-4 bg-white rounded-lg shadow-md relative">
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                editable={true}
                selectable={true}
                selectMirror={true}
                events={events}
                eventResizableFromStart={true}
                eventDurationEditable={true}
                eventDidMount={(info) => {
                    info.el.setAttribute("data-event-id", info.event.id);
                }}
                select={(info) => {
                    const newEventId = Date.now().toString();
                    let eventEnd = info.end;

                    const timeDiff = info.end.getTime() - info.start.getTime();
                    if (timeDiff <= 1000) { // Клик
                        eventEnd = new Date(info.start.getTime() + 30 * 60 * 1000);
                    }

                    const newEvent = {
                        id: newEventId,
                        title: "New Event",
                        start: info.start,
                        end: eventEnd,
                    };

                    setEvents((prevEvents) => [...prevEvents, newEvent]);
                    setSelectedDate(info.start.toISOString());
                    setEndDate(eventEnd.toISOString()); // Устанавливаем endDate
                    setTempEventId(newEventId);
                    setIsPositionReady(false);
                    setClickPosition(undefined);
                }}
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="auto"
                eventContent={(arg) => {
                    const title = arg.event.title || "New Event";
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

            {isPositionReady && clickPosition && (
                <CreateEventPopover
                    selectedDate={selectedDate}
                    endDate={endDate} // Передаем endDate
                    position={clickPosition}
                    onSave={handleAddEvent}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}