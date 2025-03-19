import { useState, FormEvent, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createEvent, updateEvent } from "@/components/redux/actions/eventActions";
import { RootState } from "@/components/redux/store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ColorPicker } from "@/components/calendar/ColorPiker.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
    BellRing,
    BookmarkCheck,
    BriefcaseBusiness,
    CalendarFold,
    CalendarIcon,
    ChevronDownIcon,
    ClockIcon,
    House,
    Palette,
    Video,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { UiMessages } from "@/constants/uiMessages.ts";
import { getUsers } from "@/components/redux/actions/userActions.ts";
import { showErrorToasts, showSuccessToast } from "@/components/utils/ToastNotifications.tsx";
import { ToastStatusMessages } from "@/constants/toastStatusMessages.ts";
import { Toggle } from "@/components/ui/toggle.tsx";
import { useNavigate } from "react-router-dom";
import { useEventDraft } from "@/components/utils/EventDraftContext.tsx";
import { CalendarReducer } from "@/components/redux/reducers/calendarReducer.ts";
import { getCalendars } from "@/components/redux/actions/calendarActions.ts";
import UserSelector from "@/components/utils/UserSelector.tsx";

interface User {
    id: number;
    fullName: string;
    email: string;
    profilePicture: string;
    role: "viewer" | "member" | "owner";
    attendanceStatus?: "yes" | "no" | "maybe";
}

const CreateEventPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { draft, setDraft } = useEventDraft();

    const calendars: CalendarReducer[] = useSelector((state: RootState) => state.calendars.calendars);
    const users = useSelector((state: { users: { users: User[] } }) => state.users.users ?? []);
    const currentUser = useSelector((state: { auth: { user: User } }) => state.auth.user);

    const [openStartCalendar, setOpenStartCalendar] = useState(false);
    const [openEndCalendar, setOpenEndCalendar] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("work");
    const [type, setType] = useState("meeting");
    const [calendarId, setCalendarId] = useState<number | null>(null);
    const [color, setColor] = useState("#D50000");
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [endTime, setEndTime] = useState("");
    const [allDay, setAllDay] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [creatorId, setCreatorId] = useState<number | null>(null); // ID создателя события

    const [isInitialized, setIsInitialized] = useState(false); // Флаг инициализации

    useEffect(() => {
        console.log("First useEffect: Draft data", draft);
        if (draft?.eventId) {
            // Режим редактирования
            setIsEditMode(true);
            setTitle(draft.title || "");
            setDescription(draft.description || "");
            setCategory(draft.category || "work");
            setType(draft.type || "meeting");
            setCalendarId(draft.calendarId || null);
            setColor(draft.color || "#D50000");
            setStartDate(draft.startDate);
            setEndDate(draft.endDate);
            setStartTime(draft.startTime || "");
            setEndTime(draft.endTime || "");
            setAllDay(draft.startTime === "00:00" && draft.endTime === "23:59");
            setSelectedUsers(
                draft.selectedUsers?.map((user: User) => ({
                    ...user,
                    attendanceStatus: user.attendanceStatus,
                })) || []
            );
            setCreatorId(draft.creatorId || currentUser.id);
        } else if (draft?.calendarId !== undefined) {
            setIsEditMode(false);
            setTitle(draft.title || "");
            setStartDate(draft.startDate);
            setEndDate(draft.endDate);
            setStartTime(draft.startTime || "");
            setEndTime(draft.endTime || "");
            setType(draft.type || "meeting");
            setCalendarId(draft.calendarId || null);
            setSelectedUsers(draft.selectedUsers || []);
            setCreatorId(currentUser.id);
        } else if (calendars.length > 0 && calendarId === null) {
            setIsEditMode(false);
            const mainCalendar = calendars.find((calendar) => calendar.type === "main");
            if (mainCalendar) {
                setCalendarId(mainCalendar.id);
            } else {
                setCalendarId(calendars[0]?.id || null);
            }
            setCreatorId(currentUser.id);
        }
        setIsInitialized(true);
    }, [calendars, draft, currentUser]);

    useEffect(() => {
        (async () => {
            await Promise.all([getUsers(dispatch), getCalendars(dispatch)]);
        })();

        if (
            currentUser &&
            !isEditMode &&
            !draft?.eventId &&
            selectedUsers.length === 0 &&
            !isInitialized
        ) {
            setSelectedUsers([{ ...currentUser, role: "owner" }]);
        }
    }, [dispatch, currentUser, isEditMode, draft?.eventId]);

    const handleCancel = () => {
        setDraft({});
        navigate("/calendar");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate || calendarId === null) return;

        const formattedStartAt = `${format(startDate, "yyyy-MM-dd")} ${startTime}:00`;
        const formattedEndAt = `${format(endDate, "yyyy-MM-dd")} ${endTime}:00`;

        const payload = {
            title,
            description,
            category,
            type,
            startAt: allDay ? `${formattedStartAt.split(" ")[0]} 00:00:00` : formattedStartAt,
            endAt: allDay ? `${formattedStartAt.split(" ")[0]} 23:59:59` : formattedEndAt,
            calendarId,
            color,
        };

        setDraft({
            ...draft,
            title,
            description,
            category,
            type,
            startDate,
            endDate,
            startTime,
            endTime,
            calendarId,
            color,
            selectedUsers,
            eventId: isEditMode ? draft.eventId : undefined,
            creatorId: creatorId || currentUser.id,
        });

        let result;
        if (isEditMode && draft?.eventId) {
            result = await updateEvent(
                dispatch,
                parseInt(draft.eventId, 10),
                payload,
                selectedUsers.map(({ id }) => ({ userId: id }))
            );
        } else {
            result = await createEvent(
                dispatch,
                payload,
                selectedUsers.map(({ id }) => ({ userId: id }))
            );
        }

        if (result.success) {
            await getCalendars(dispatch);
            navigate("/calendar");
            showSuccessToast(
                isEditMode
                    ? ToastStatusMessages.EVENTS.UPDATE_SUCCESS
                    : ToastStatusMessages.EVENTS.CREATE_SUCCESS
            );
            setDraft({});
        } else {
            showErrorToasts(
                result.errors ||
                (isEditMode
                    ? ToastStatusMessages.EVENTS.UPDATE_FAILED
                    : ToastStatusMessages.EVENTS.CREATE_FAILED)
            );
        }
    };

    const editableCalendars = isEditMode
        ? calendars
        : calendars.filter((calendar) =>
            calendar.participants.some(
                (p) => p.userId === currentUser.id && p.role !== "viewer"
            )
        );

    const timeOptions = Array.from({ length: 48 }, (_, i) => {
        const h = Math.floor(i / 2).toString().padStart(2, "0");
        const m = (i % 2 === 0 ? "00" : "30").padStart(2, "0");
        return `${h}:${m}`;
    });

    return (
        <div className="max-w-188 mx-auto p-6">
            <Card>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Add title"
                        className="mt-1"
                        maxLength={50}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <div className="flex items-center space-x-1">
                        <div className="flex items-center space-x-2">
                            <Popover open={openStartCalendar} onOpenChange={setOpenStartCalendar}>
                                <PopoverTrigger>
                                    <Button variant="outline" className="w-40 font-normal">
                                        <CalendarIcon className="ml-0 h-4 w-4" style={{ color: "#727272" }} />
                                        {startDate ? format(startDate, "PPP") : "Start date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(date) => {
                                            setStartDate(date);
                                            setOpenStartCalendar(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Select onValueChange={setStartTime} disabled={allDay} value={startTime}>
                                <SelectTrigger className="w-27 cursor-pointer disabled:cursor-default">
                                    <ClockIcon className="mr-0 h-4 w-4" />
                                    <SelectValue placeholder="Time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-48">
                                        {timeOptions.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                        </div>

                        <span className="text-gray-500 mx-2">to</span>

                        <div className="flex items-center space-x-2">
                            <Popover open={openEndCalendar} onOpenChange={setOpenEndCalendar}>
                                <PopoverTrigger className="ms-1">
                                    <Button variant="outline" className="w-40 font-normal">
                                        <CalendarIcon className="ml-0 h-4 w-4" style={{ color: "#727272" }} />
                                        {endDate ? format(endDate, "PPP") : "End date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={(date) => {
                                            setEndDate(date);
                                            setOpenEndCalendar(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Select onValueChange={setEndTime} disabled={allDay} value={endTime}>
                                <SelectTrigger className="w-27 cursor-pointer disabled:cursor-default">
                                    <ClockIcon className="mr-0 h-4 w-4" />
                                    <SelectValue placeholder="Time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-48">
                                        {timeOptions.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                        </div>
                        <Toggle
                            pressed={allDay}
                            onPressedChange={() => setAllDay(!allDay)}
                            className="h-9 px-8 cursor-pointer border"
                        >
                            All day
                        </Toggle>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Select
                            onValueChange={(value) => setCalendarId(Number(value))}
                            value={calendarId?.toString() || ""}
                            disabled={isEditMode}
                        >
                            <SelectTrigger className="cursor-pointer disabled:cursor-default">
                                <CalendarFold strokeWidth={3} />
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
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Popover>
                                        <PopoverTrigger>
                                            <Button
                                                variant="outline"
                                                className="flex items-center w-18 h-9 p-0 border space-x-1"
                                            >
                                                <div
                                                    className="w-4.5 h-4.5 rounded-xl"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <ChevronDownIcon className="w-3 h-3 text-gray-500" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-auto">
                                            <div className="flex gap-2">
                                                <ColorPicker selectedColor={color} onChange={setColor} />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TooltipTrigger>
                                <TooltipContent>Event color</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="flex items-center space-x-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Select onValueChange={setType} value={type} disabled={isEditMode}>
                                        <SelectTrigger className="cursor-pointer disabled:cursor-default">
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="meeting">
                                                <Video strokeWidth={3} />Meeting
                                            </SelectItem>
                                            <SelectItem value="reminder">
                                                <BellRing strokeWidth={3} />Reminder
                                            </SelectItem>
                                            <SelectItem value="task">
                                                <BookmarkCheck strokeWidth={3} />Task
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TooltipTrigger>
                                <TooltipContent>Type</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Select onValueChange={setCategory} value={category}>
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue placeholder="Выберите категорию" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="work">
                                                <BriefcaseBusiness strokeWidth={3} />Work
                                            </SelectItem>
                                            <SelectItem value="home">
                                                <House strokeWidth={3} />Home
                                            </SelectItem>
                                            <SelectItem value="hobby">
                                                <Palette strokeWidth={3} />Hobby
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TooltipTrigger>
                                <TooltipContent>Category</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <Textarea
                        placeholder="Description"
                        className="mt-1"
                        maxLength={250}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <UserSelector
                        users={users}
                        selectedUsers={selectedUsers}
                        setSelectedUsers={setSelectedUsers}
                        showRoleSelector={false}
                        creatorId={creatorId}
                    />

                    <div className="mt-2 flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleCancel}>
                            {UiMessages.GENERAL.CANCEL_BUTTON}
                        </Button>

                        <Button
                            disabled={!(allDay || (startTime && endTime)) || !title || !startDate || !endDate}
                            onClick={handleSubmit}
                        >
                            {isEditMode ? UiMessages.GENERAL.UPDATE_BUTTON : UiMessages.GENERAL.CREATE_BUTTON}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateEventPage;