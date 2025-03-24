import * as React from "react";
import { Check, ChevronRight, MoreVertical } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip.tsx";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu.tsx";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar.tsx";
import { ColorPicker } from "@/components/calendar/ColorPiker.tsx";
import { ManageCalendarModal } from "@/components/calendar/ManageCalendarModal.tsx";
import { useDispatch, useSelector } from "react-redux";
import {
    deleteCalendar,
    unsubscribeFromCalendar,
    updateCalendarColor,
} from "@/components/redux/actions/calendarActions.ts";
import { ConfirmDeleteModal } from "@/components/calendar/ConfirmDeleteModal.tsx";
import { showErrorToasts, showSuccessToast } from "@/components/utils/ToastNotifications.tsx";
import { ToastStatusMessages } from "@/constants/toastStatusMessages.ts";
import { toggleCalendarSelection } from "@/components/redux/reducers/calendarReducer.ts";
import { RootState } from "@/components/redux/store.ts";

interface CalendarItem {
    id: number;
    title: string;
    type: string;
    creationByUserId?: string;
    role?: "owner" | "member" | "viewer";
    participants?: { userId: number; color?: string; role: string }[];
}

interface CalendarsProps {
    calendars: {
        name: string;
        items: CalendarItem[];
    }[];
}

const DEFAULT_CALENDAR_COLOR = "#039BE5";

export function Calendars({ calendars }: CalendarsProps) {
    const dispatch = useDispatch();
    const selectedCalendarIds = useSelector((state: RootState) => state.calendars.selectedCalendarIds);
    const reduxCalendars = useSelector((state: RootState) => state.calendars.calendars);
    const currentUser = useSelector((state: RootState) => state.auth.user);
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

    const handleUnsubscribeClick = async (calendarId: number) => {
        const result = await unsubscribeFromCalendar(dispatch, calendarId);
        if (result.success) {
            showSuccessToast("Successfully unsubscribed from calendar");
        } else {
            showErrorToasts(result.errors || "Failed to unsubscribe from calendar");
        }
    };

    const handleToggleCalendar = (calendarId: number) => {
        dispatch(toggleCalendarSelection(calendarId));
    };

    const handleColorChange = async (calendarId: number, color: string) => {
        if (!currentUser?.id) return;
        const result = await updateCalendarColor(dispatch, calendarId, color, currentUser.id);
        if (result.success) {
            showSuccessToast("Calendar color updated successfully");
        } else {
            showErrorToasts(result.errors || "Failed to update calendar color");
        }
    };

    const getCalendarColor = (calendar: CalendarItem) => {
        if (!currentUser?.id) return DEFAULT_CALENDAR_COLOR;
        const reduxCalendar = reduxCalendars.find((cal) => cal.id === calendar.id);
        if (!reduxCalendar || !reduxCalendar.participants) return DEFAULT_CALENDAR_COLOR;
        const participant = reduxCalendar.participants.find((p) => p.userId === currentUser.id);
        return participant?.color || DEFAULT_CALENDAR_COLOR;
    };

    const { isMobile } = useSidebar();

    return (
        <>
            {calendars.map((calendar) => (
                <React.Fragment key={calendar.name}>
                    <SidebarGroup className="py-0 ">
                        <Collapsible defaultOpen={true} className="group/collapsible">
                            <SidebarGroupLabel
                                asChild
                                className="group/label flex items-center justify-between text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-sm px-2 py-1"
                            >
                                <CollapsibleTrigger className="flex w-full items-center cursor-pointer">
                                    {calendar.name}
                                    <ChevronRight
                                        className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
                                    />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {calendar.items.map((item) => {
                                            const isOwner = item.role === "owner";
                                            const canUnsubscribe = item.type !== "main" && !isOwner;
                                            const currentColor = getCalendarColor(item);

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
                                                        className="flex items-center justify-between w-full cursor-pointer"
                                                    >
                                                        <div className="flex items-center">
                                                            <div
                                                                data-active={selectedCalendarIds.includes(item.id)}
                                                                className="group/calendar-item border-sidebar-border text-sidebar-primary-foreground flex aspect-square size-5 shrink-0 items-center justify-center rounded-sm border relative cursor-pointer"
                                                                style={{
                                                                    backgroundColor: selectedCalendarIds.includes(item.id)
                                                                        ? currentColor
                                                                        : "transparent",
                                                                    borderColor: currentColor,
                                                                    borderWidth: "1.5px",
                                                                }}
                                                                onClick={() => handleToggleCalendar(item.id)}
                                                            >
                                                                <div
                                                                    className="absolute size-8 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full transition-opacity opacity-0 group-hover/calendar-item:opacity-20"
                                                                    style={{ backgroundColor: currentColor }}
                                                                />
                                                                <Check
                                                                    strokeWidth={2.9}
                                                                    className="hidden size-5 group-data-[active=true]/calendar-item:block text-white relative z-10"
                                                                />
                                                            </div>

                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="ml-2 truncate max-w-[150px] overflow-hidden whitespace-nowrap">
                                                                      {item.title}
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    {item.title}
                                                                </TooltipContent>
                                                            </Tooltip>
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
                                                                    {canUnsubscribe && (
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
                                                                                selectedColor={currentColor}
                                                                                onChange={(color) => handleColorChange(item.id, color)}
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
                    <SidebarSeparator className="mx-0" />
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