import * as React from "react";
import {useEffect, useState} from "react";
import {CalendarDays, CalendarFold, Plus} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/components/redux/store.ts";

import {Calendars} from "@/components/calendar/Calendars.tsx";
import {DatePicker} from "@/components/calendar/DatePicker.tsx";
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu.tsx";
import {
    Sidebar,
    SidebarContent,
    SidebarSeparator,
} from "@/components/ui/sidebar.tsx";
import {ManageCalendarModal} from "@/components/calendar/ManageCalendarModal.tsx";
import {getCalendars} from "@/components/redux/actions/calendarActions.ts";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {Avatar, AvatarImage} from "@/components/ui/avatar.tsx";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    onDateSelect?: (date: Date) => void;
    externalDate?: Date;
}

export function AppSidebar({ onDateSelect, externalDate, ...props }: AppSidebarProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const calendars = useSelector((state: RootState) => state.calendars.calendars);
    const userId = user?.id;
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

    useEffect(() => {
        (async () => {
            if (userId) {
                await getCalendars(dispatch);
            }
        })();
    }, [dispatch, userId]);

    const data = [
        {
            name: "My Calendars",
            items: calendars
                .filter((calendar) =>
                    (calendar.type === "shared" || calendar.type === "main") &&
                    (calendar.creationByUserId === userId ||
                        calendar.participants.some(participant => participant.userId === userId))
                )
                .map((calendar) => {
                    const participant = calendar.participants.find(p => p.userId === userId);
                    const role = participant ? participant.role : "owner";
                    return {
                        id: calendar.id,
                        title: calendar.title,
                        type: calendar.type,
                        role: role as "owner" | "member" | "viewer",
                    };
                })
                .sort((a, b) => {
                    if (a.type === "main" && b.type !== "main") return -1;
                    if (a.type !== "main" && b.type === "main") return 1;

                    const roleOrder = { "owner": 1, "member": 2, "viewer": 3 };
                    const aRoleOrder = roleOrder[a.role] || 4;
                    const bRoleOrder = roleOrder[b.role] || 4;
                    if (aRoleOrder !== bRoleOrder) return aRoleOrder - bRoleOrder;

                    return a.id - b.id;
                }),
        },
        {
            name: "Others Calendars",
            items: calendars
                .filter((calendar) =>
                    (calendar.type === "holidays"
                        || calendar.type === "birthdays")
                    && (calendar.creationByUserId === userId
                        || calendar.participants.some(participant => participant.userId === userId))
                )
                .map((calendar) => ({
                    id: calendar.id,
                    title: calendar.title,
                    type: calendar.type,
                }))
                .sort((a, b) => a.id - b.id),
        },
    ];

    return (
        <>
            <Sidebar {...props}>
                <header className="border-sidebar-border h-17 border-b flex items-center overflow-hidden">
                    <Avatar className="ml-4 h-13 w-13 rounded-lg shrink-0">
                        <AvatarImage src="/logo_favicon.png" alt="Логотип" />
                    </Avatar>
                    <span className="text-[24px] font-medium  ">
                        Calendula
                    </span>
                </header>

                <DropdownMenu>
                    <div className="flex mt-4 px-4">
                        <DropdownMenuTrigger className="w-full">
                            <Button
                                variant="outline"
                                className="flex items-center justify-center gap-1 font-semibold !px-6 !py-6 rounded-full w-full"
                            >
                                <Plus className="size-5" />
                                <span className="text-[16px]">Create</span>
                            </Button>
                        </DropdownMenuTrigger>
                    </div>

                    <DropdownMenuContent align="start" className="w-40">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setIsCalendarModalOpen(true)}>
                            <CalendarFold />
                            New Calendar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/new-event")}>
                            <CalendarDays />
                            New Event
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <SidebarContent>
                    <DatePicker onDateSelect={onDateSelect} externalDate={externalDate}/>
                    <SidebarSeparator className="mx-0"/>
                    <Calendars calendars={data}/>
                </SidebarContent>
            </Sidebar>
            <ManageCalendarModal
                isOpen={isCalendarModalOpen}
                onClose={() => setIsCalendarModalOpen(false)}
                isEditMode={false}
            />
        </>
    );
}
