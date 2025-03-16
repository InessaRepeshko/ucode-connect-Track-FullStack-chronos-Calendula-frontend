import * as React from "react";
import {useEffect, useState} from "react";
import {CalendarDays, CalendarFold, Plus} from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/components/redux/store";

import {Calendars} from "@/components/calendars";
import {DatePicker} from "@/components/date-picker";
import {NavUser} from "@/components/nav-user";
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import {ManageCalendarModal} from "@/components/calendar/ManageCalendarModal.tsx";
import {getCalendars} from "@/components/redux/actions/calendarActions.ts";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);
    const calendars = useSelector((state: RootState) => state.calendars.calendars);
    const userId = user?.id;
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [userCalendars, setUserCalendars] = useState<{ id: number; title: string }[]>([]);

    useEffect(() => {
        (async () => {
            if (calendars.length === 0) {
                await getCalendars(dispatch);
            }
        })();
    }, [dispatch, calendars.length]);


    useEffect(() => {
        if (calendars.length > 0 && userId) {
            const updatedUserCalendars = calendars
                .filter((calendar) =>
                    calendar.creationByUserId === userId ||
                    calendar.participants.some(participant => participant.userId === userId)
                )
                .map((calendar) => ({
                    id: calendar.id,
                    title: calendar.title,
                }));
            setUserCalendars(updatedUserCalendars);
        }
    }, [calendars, userId]);
    console.log(calendars);

    const data = [
        {
            name: "My Calendars",
            items: userCalendars,
        },
        // {
        //   name: "Others",
        //   items: userCalendars,
        // },
    ];

    return (
        <>
            <Sidebar {...props}>
                <SidebarHeader className="border-sidebar-border h-16 border-b">
                    {user ? <NavUser user={user}/> : <span>Loading...</span>}
                </SidebarHeader>
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
