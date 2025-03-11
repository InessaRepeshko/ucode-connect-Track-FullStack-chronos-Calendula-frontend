import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState } from "react";
import "@/components/styles/fullcalendar.css";

export default function CustomCalendar() {
    const [events, setEvents] = useState([
        { title: "Совещание", start: "2025-03-06", allDay: true },
    ]);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                editable={true}
                selectable={true}
                events={events}
                dateClick={(info) => {
                    const title = prompt("Введите название события:");
                    if (title) {
                        setEvents([...events, { title, start: info.dateStr, allDay: true }]);
                    }
                }}
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="auto"
            />
        </div>
    );
}
