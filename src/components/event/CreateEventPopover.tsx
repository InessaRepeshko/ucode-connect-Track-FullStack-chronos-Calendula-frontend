import {FormEvent, useEffect, useState} from "react";
import {Popover, PopoverContent} from "@/components/ui/popover";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/components/redux/store";
import {getUsers} from "@/components/redux/actions/userActions.ts";
import {UiMessages} from "@/constants/uiMessages.ts";
import {createEvent, EventPayload} from "@/components/redux/actions/eventActions.ts";
import {showErrorToasts, showSuccessToast} from "@/components/utils/ToastNotifications.tsx";
import {ToastStatusMessages} from "@/constants/toastStatusMessages.ts";
import {format} from "date-fns";
import {useNavigate} from "react-router-dom";
import {useEventDraft} from "@/components/utils/EventDraftContext.tsx";
import {BellRing, BookmarkCheck, CalendarFold, Video, X} from "lucide-react";
import {getCalendars} from "@/components/redux/actions/calendarActions.ts";
import UserSelector from "@/components/utils/UserSelector.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

interface User {
    id: number;
    fullName: string;
    email: string;
    profilePicture: string;
    role: "viewer" | "member" | "owner";
}

interface CreateEventPopoverProps {
    selectedDate: string | null;
    endDate: string | null;
    position?: { x: number; y: number };
    onSave: (title: string) => void;
    onClose: () => void;
}

const CreateEventPopover = ({selectedDate, endDate, position, onSave, onClose}: CreateEventPopoverProps) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {setDraft} = useEventDraft();
    const calendars = useSelector((state: RootState) => state.calendars.calendars);
    const [title, setTitle] = useState("");
    const [calendarId, setCalendarId] = useState<number | null>(null);
    const [type, setType] = useState("meeting");
    const [category] = useState("work");
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [startTime, setStartTime] = useState("");
    const [endDateState, setEndDate] = useState<Date | undefined>();
    const [endTime, setEndTime] = useState("");
    const users = useSelector((state: { users: { users: User[] } }) => state.users.users ?? []);
    const currentUser = useSelector((state: { auth: { user: User } }) => state.auth.user);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    useEffect(() => {
        if (calendars.length > 0 && calendarId === null) {
            const mainCalendar = calendars.find((calendar) => calendar.type === "main");
            if (mainCalendar) {
                setCalendarId(mainCalendar.id);
            } else {
                setCalendarId(calendars[0]?.id || null)
            }
        }
    }, [calendars, calendarId]);

    useEffect(() => {
        if (selectedDate && endDate) {
            const parsedStartDate = new Date(selectedDate);
            const parsedEndDate = new Date(endDate);
            setStartDate(parsedStartDate);
            setEndDate(parsedEndDate);
            setStartTime(format(parsedStartDate, "HH:mm"));
            setEndTime(format(parsedEndDate, "HH:mm"));
        }
    }, [selectedDate, endDate]);

    const handleSubmit = async (e?: FormEvent) => {
        if (e) e.preventDefault();

        if (!startDate || !endDateState || calendarId === null) {
            return;
        }

        const formattedStartAt = `${format(startDate, "yyyy-MM-dd")} ${startTime}:00`;
        const isAllDay = endTime === "23:59" && startDate.toDateString() === endDateState.toDateString();
        const formattedEndAt = isAllDay
            ? `${format(endDateState, "yyyy-MM-dd")} 23:59:59`
            : `${format(endDateState, "yyyy-MM-dd")} ${endTime}:00`;

        const payload: EventPayload = {
            title,
            type,
            calendarId,
            category,
            startAt: formattedStartAt,
            endAt: formattedEndAt,
        };

        const result = await createEvent(dispatch, payload, selectedUsers.map(({id}) => ({userId: id})));

        if (result.success) {
            await getCalendars(dispatch);
            showSuccessToast(ToastStatusMessages.EVENTS.CREATE_SUCCESS);
            onSave(title);
            setTitle("");
        } else {
            showErrorToasts(result.errors || ToastStatusMessages.EVENTS.CREATE_FAILED);
        }
    };

    useEffect(() => {
        (async () => {
            await getUsers(dispatch);
        })();
        if (currentUser && !selectedUsers.some((u) => u.id === currentUser.id)) {
            setSelectedUsers([{...currentUser, role: "owner"}]);
        }
    }, [dispatch]);

    const editableCalendars = calendars.filter((calendar) =>
        calendar.participants.some(
            (p) => p.userId === currentUser.id && p.role !== "viewer"
        )
    );

    return (
        <Popover open={Boolean(selectedDate)} onOpenChange={(open) => !open && onClose()}>
            <PopoverContent
                className="w-[430px] h-[390px] p-6 space-y-4 relative"
                style={position ? {position: "absolute", top: position.y, left: position.x} : undefined}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0"
                    onClick={onClose}
                >
                    <X className="w-4 h-4"/>
                </Button>

                <Input
                    placeholder="Add title"
                    maxLength={50}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    className="mt-1.5"
                />

                <div className="flex items-center space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Select
                                    onValueChange={(value) => setCalendarId(Number(value))}
                                    value={calendarId?.toString() || ""}
                                >
                                    <SelectTrigger>
                                        <CalendarFold strokeWidth={3}/>
                                        <SelectValue placeholder="Calendar">
                                            {calendarId
                                                ? (() => {
                                                    const selectedCalendar = calendars.find(
                                                        (calendar) => calendar.id === calendarId
                                                    );
                                                    if (selectedCalendar) {
                                                        const title = selectedCalendar.title;
                                                        return `${title.slice(0, 20)}${title.length > 20 ? "..." : ""}`;
                                                    }
                                                    return "Calendar";
                                                })()
                                                : "Calendar"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {editableCalendars.map((calendar) => (
                                            <SelectItem key={calendar.id} value={String(calendar.id)}>
                                                {calendar.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TooltipTrigger>
                            <TooltipContent>
                                Calendar{' '}
                                {calendarId
                                    ? (() => {
                                        const selectedCalendar = calendars.find(
                                            (calendar) => calendar.id === calendarId
                                        );
                                        return selectedCalendar ? `'${selectedCalendar.title}'` : "'Calendar'";
                                    })()
                                    : "'Calendar'"}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Select onValueChange={setType} defaultValue={type}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Type"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="meeting"><Video strokeWidth={3}/>Meeting</SelectItem>
                                        <SelectItem value="reminder"><BellRing strokeWidth={3}/>Reminder</SelectItem>
                                        <SelectItem value="task"><BookmarkCheck strokeWidth={3}/>Task</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TooltipTrigger>
                            <TooltipContent>Type</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <UserSelector
                    users={users}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    showRoleSelector={false}
                    creatorId={currentUser.id}
                />

                <div className="flex justify-end space-x-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setDraft({
                                title,
                                startDate,
                                endDate: endDateState,
                                type,
                                calendarId: calendarId || undefined,
                                startTime,
                                endTime,
                                selectedUsers,
                            });
                            navigate("/new-event");
                        }}
                    >
                        {UiMessages.GENERAL.MORE_OPTIONS}
                    </Button>
                    <Button onClick={handleSubmit}>{UiMessages.GENERAL.CREATE_BUTTON}</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default CreateEventPopover;