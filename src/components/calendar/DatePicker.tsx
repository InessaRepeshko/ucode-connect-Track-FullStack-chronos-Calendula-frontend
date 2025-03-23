import { Calendar } from "@/components/ui/calendar.tsx";
import {
    SidebarGroup,
    SidebarGroupContent,
} from "@/components/ui/sidebar.tsx";

interface DatePickerProps {
    selected?: Date; // Пропс для текущей выбранной даты
    onDateSelect?: (date: Date) => void; // Пропс для передачи выбранной даты
}

export function DatePicker({ selected, onDateSelect }: DatePickerProps) {
    return (
        <SidebarGroup className="px-0">
            <SidebarGroupContent>
                <Calendar
                    mode="single" // Режим выбора одной даты
                    selected={selected} // Управляем выделением через пропс
                    onSelect={(date) => {
                        if (date && onDateSelect) {
                            onDateSelect(date); // Передаём выбранную дату наверх
                        }
                    }}
                    className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px]"
                />
            </SidebarGroupContent>
        </SidebarGroup>
    );
}