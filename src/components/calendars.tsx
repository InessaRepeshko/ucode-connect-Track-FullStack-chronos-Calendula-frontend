import * as React from "react";
import {Check, ChevronRight, MoreVertical} from "lucide-react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";
import {ColorPicker} from "@/components/calendar/ColorPiker.tsx";
import {ManageCalendarModal} from "@/components/calendar/ManageCalendarModal.tsx";
import {useDispatch, useSelector} from "react-redux";
import {deleteCalendar} from "@/components/redux/actions/calendarActions.ts";
import {ConfirmDeleteModal} from "@/components/calendar/ConfirmDeleteModal.tsx";
import {showErrorToasts, showSuccessToast} from "@/components/utils/ToastNotifications.tsx";
import {ToastStatusMessages} from "@/constants/toastStatusMessages.ts";
import {toggleCalendarSelection} from "@/components/redux/reducers/calendarReducer.ts";
import {RootState} from "@/components/redux/store.ts";

interface CalendarItem {
    id: number;
    title: string;
    type: string;
    creationByUserId: string;
    role: "owner" | "member" | "viewer";
}

interface CalendarsProps {
    calendars: {
        name: string;
        items: CalendarItem[];
    }[];
}

export function Calendars({calendars}: CalendarsProps) {
    const dispatch = useDispatch();
    const selectedCalendarIds = useSelector((state: RootState) => state.calendars.selectedCalendarIds);
    const [selectedColor, setSelectedColor] = React.useState("#000000");
    const [selectedCalendar, setSelectedCalendar] = React.useState<CalendarItem | null>(null);
    const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [calendarToDelete, setCalendarToDelete] = React.useState<{ id: number; title: string } | null>(null);

    const handleEditClick = (calendar: CalendarItem) => {
        setSelectedCalendar(calendar);
        setIsOpen(true);
    };

    const handleDeleteClick = (calendar: { id: number; title: string }) => {
        setCalendarToDelete(calendar);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!calendarToDelete) return;
            const result = await deleteCalendar(dispatch, calendarToDelete.id);
            setIsDeleteModalOpen(false);
        if (result.success) {
            showSuccessToast(ToastStatusMessages.CALENDARS.DELETE_SUCCESS);
        } else {
            showErrorToasts(result.errors || ToastStatusMessages.CALENDARS.DELETE_FAILED);
        }
    };

    const handleUnsubscribeClick = (calendarId: number) => {
        // Здесь логика отписки (например, вызов действия Redux)
        console.log(`Unsubscribe from calendar ${calendarId}`);
        // Пример: dispatch(unsubscribeFromCalendar(calendarId));
    };

    const handleToggleCalendar = (calendarId: number) => {
        dispatch(toggleCalendarSelection(calendarId));
    };

    const { isMobile } = useSidebar()
    return (
        <>
            {calendars.map((calendar, index) => (
                <React.Fragment key={calendar.name}>
                    <SidebarGroup className="py-0">
                        <Collapsible defaultOpen={index === 0} className="group/collapsible">
                            <SidebarGroupLabel
                                asChild
                                className="group/label flex items-center justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-sm px-2 py-1"
                            >
                                <CollapsibleTrigger className="flex w-full items-center">
                                    {calendar.name}
                                    <ChevronRight
                                        className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"/>
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {calendar.items.map((item) => {
                                            const isOwner = item.role === "owner";
                                            const isMemberOrViewer = item.role === "member" || item.role === "viewer";

                                            return (
                                                <SidebarMenuItem
                                                    key={item.id}
                                                    className="flex justify-between items-center"
                                                    onMouseEnter={() => setHoveredItem(item.title)}
                                                    onMouseLeave={() => {
                                                        if (!openDropdown) setHoveredItem(null);
                                                    }}
                                                >
                                                    <SidebarMenuButton
                                                        className="flex items-center justify-between w-full"
                                                        onClick={() => handleToggleCalendar(item.id)}
                                                    >
                                                        <div className="flex items-center">
                                                            <div
                                                                data-active={selectedCalendarIds.includes(item.id)}
                                                                className="group/calendar-item border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border"
                                                            >
                                                                <Check
                                                                    className="hidden size-3 group-data-[active=true]/calendar-item:block"
                                                                />
                                                            </div>
                                                            <span className="ml-2 truncate max-w-[150px] overflow-hidden whitespace-nowrap">
                                                                {item.title}
                                                            </span>
                                                        </div>
                                                        {(hoveredItem === item.title || openDropdown === item.title) && (
                                                            <DropdownMenu
                                                                onOpenChange={(isOpen) =>
                                                                    setOpenDropdown(isOpen ? item.title : null)
                                                                }
                                                            >
                                                                <DropdownMenuTrigger
                                                                    className="ml-2 p-2 rounded-md hover:bg-gray-200 focus:bg-gray-300 transition cursor-pointer"
                                                                >
                                                                    <MoreVertical className="size-4 text-gray-600 hover:text-gray-800" />
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent
                                                                    side={isMobile ? "bottom" : "right"}
                                                                    align="start"
                                                                    sideOffset={4}
                                                                >
                                                                    {isOwner && (
                                                                        <DropdownMenuItem
                                                                            className="cursor-pointer"
                                                                            onClick={() => handleEditClick(item)}
                                                                        >
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    {isOwner && item.type !== "main" && (
                                                                        <DropdownMenuItem
                                                                            className="text-red-500 cursor-pointer"
                                                                            onClick={() => handleDeleteClick(item)}
                                                                        >
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    {isMemberOrViewer && (
                                                                        <DropdownMenuItem
                                                                            className="text-red-500 cursor-pointer"
                                                                            onClick={() => handleUnsubscribeClick(item.id)}
                                                                        >
                                                                            Unsubscribe
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem style={{ backgroundColor: "transparent" }}>
                                                                        <div className="flex gap-2">
                                                                            <ColorPicker
                                                                                selectedColor={selectedColor}
                                                                                onChange={setSelectedColor}
                                                                            />
                                                                        </div>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </SidebarGroup>
                    <SidebarSeparator className="mx-0"/>
                </React.Fragment>
            ))}

            <ManageCalendarModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                isEditMode={true}
                calendar_id={selectedCalendar?.id}
            />
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                calendarTitle={calendarToDelete?.title || ""}
            />
        </>
    );
}
