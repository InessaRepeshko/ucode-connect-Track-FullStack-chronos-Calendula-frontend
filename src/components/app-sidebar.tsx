import * as React from "react";
import {useEffect, useState} from "react";
import {CalendarDays, CalendarFold, Plus} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/components/redux/store";

import {Calendars} from "@/components/calendars";
import {DatePicker} from "@/components/date-picker";
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import {ManageCalendarModal} from "@/components/calendar/ManageCalendarModal.tsx";
import {getCalendars} from "@/components/redux/actions/calendarActions.ts";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";
import {Avatar, AvatarImage} from "@/components/ui/avatar.tsx";

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const calendars = useSelector((state: RootState) => state.calendars.calendars);
    const userId = user?.id;
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

    useEffect(() => {
        (async () => {
            if (calendars.length === 0) {
                await getCalendars(dispatch);
            }
        })();
    }, [dispatch, calendars.length]);


    console.log(calendars);

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
                        <DropdownMenuTrigger>
                            <Button
                                variant="outline"
                                className="flex items-center justify-center gap-1 font-semibold !px-6 !py-6 rounded-xl"
                            >
                                <Plus className="size-5"/>
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
                    <DatePicker/>
                    <SidebarSeparator className="mx-0"/>
                    <Calendars calendars={data}/>
                </SidebarContent>
                <SidebarRail/>
            </Sidebar>
            <ManageCalendarModal
                isOpen={isCalendarModalOpen}
                onClose={() => setIsCalendarModalOpen(false)}
                isEditMode={false}
            />
        </>
    );
}
