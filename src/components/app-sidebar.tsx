import * as React from "react";
import {useEffect, useState} from "react";
import { Plus } from "lucide-react";
import {useDispatch, useSelector} from "react-redux";
import { RootState } from "@/components/redux/store";

import { Calendars } from "@/components/calendars";
import { DatePicker } from "@/components/date-picker";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {ManageCalendarModal} from "@/components/calendar/ManageCalendarModal.tsx";
import {getCalendars} from "@/components/redux/actions/calendarActions.ts";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const calendars = useSelector((state: RootState) => state.calendars.calendars);
  const userId = user?.id;
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          .filter((calendar) => calendar.creationByUserId === userId)
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
            {user ? <NavUser user={user} /> : <span>Loading...</span>}
          </SidebarHeader>
          <SidebarContent>
            <DatePicker />
            <SidebarSeparator className="mx-0" />
            <Calendars calendars={data} />
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsModalOpen(true)}>
                  <Plus />
                  <span>New Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <ManageCalendarModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            isEditMode={false}
        />
      </>
  );
}
