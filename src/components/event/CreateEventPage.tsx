import {useState, FormEvent, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {createEvent} from "@/components/redux/actions/eventActions";
import {RootState} from "@/components/redux/store";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Card, CardContent} from "@/components/ui/card";
import {ColorPicker} from "@/components/calendar/ColorPiker.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar"
import {format} from "date-fns";
import {CalendarIcon, ChevronDownIcon, ClockIcon} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {UiMessages} from "@/constants/uiMessages.ts";
import {getUsers} from "@/components/redux/actions/userActions.ts";
import {showErrorToasts, showSuccessToast} from "@/components/utils/ToastNotifications.tsx";
import {ToastStatusMessages} from "@/constants/toastStatusMessages.ts";
import {Toggle} from "@/components/ui/toggle.tsx";
import {useNavigate} from "react-router-dom";
import {useEventDraft} from "@/components/utils/EventDraftContext.tsx";
import {UserSelector} from "@/components/utils/UserSelector.tsx";

interface User {
    id: number;
    fullName: string;
    email: string;
    profilePicture: string;
    role: 'viewer' | 'editor' | 'owner';
}

interface Calendar {
    id: number;
    title: string;
}

const CreateEventPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { draft } = useEventDraft();

    const calendars: Calendar[] = useSelector((state: RootState) => state.calendars.calendars);
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
    const [selectedUsers, setSelectedUsers] = useState<User[]>(draft?.selectedUsers || []);

    useEffect(() => {
        if (draft) {
            setTitle(draft.title || "");
            setStartDate(draft.startDate);
            setEndDate(draft.endDate);
            setStartTime(draft.startTime || "");
            setEndTime(draft.endTime || "");
            setType(draft.type || "meeting");
            setCalendarId(draft.calendarId || null);
            setSelectedUsers(draft.selectedUsers || []);
        }
    }, [draft]);

    useEffect(() => {
        (async () => {
            await getUsers(dispatch);
        })();
        if (currentUser && !selectedUsers.some((u) => u.id === currentUser.id)) {
            setSelectedUsers([{...currentUser, role: "owner"}]);
        }
    }, [dispatch]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate) return;

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
            users: selectedUsers.map(user => ({id: user.id, role: user.role}))
        };

        const result = await (createEvent(dispatch, payload));

        if (result.success) {
            navigate('/calendar');
            showSuccessToast(ToastStatusMessages.EVENTS.CREATE_SUCCESS);
        } else {
            showErrorToasts(result.errors || ToastStatusMessages.EVENTS.CREATE_FAILED);
        }
    };

    const timeOptions = Array.from({ length: 48 }, (_, i) => {
        const h = Math.floor(i / 2).toString().padStart(2, "0");
        const m = (i % 2 === 0 ? "00" : "30").padStart(2, "0");
        return `${h}:${m}`;
    });

    return (
        <div className="max-w-188 mx-auto p-6">
            <Card>
                <CardContent className="space-y-4">
                    <Input placeholder="Add title" className="mt-1" maxLength={50} value={title}
                           onChange={(e) => setTitle(e.target.value)}/>

                    <div className="flex items-center space-x-1">
                        <div className="flex items-center space-x-2">
                            <Popover open={openStartCalendar} onOpenChange={setOpenStartCalendar}>
                                <PopoverTrigger>
                                    <Button variant="outline" className="w-40 font-normal">
                                        <CalendarIcon className="ml-0 h-4 w-4" style={{ color: "#727272" }}/>
                                        {startDate ? format(startDate, "PPP") : "Start date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start">
                                    <Calendar mode="single" selected={startDate} onSelect={(date) => {
                                        setStartDate(date);
                                        setOpenStartCalendar(false);
                                    }}/>
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
                                        <CalendarIcon className="ml-0 h-4 w-4" style={{ color: "#727272" }}/>
                                        {endDate ? format(endDate, "PPP") : "End date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start">
                                    <Calendar mode="single" selected={endDate} onSelect={(date) => {
                                        setEndDate(date);
                                        setOpenEndCalendar(false);
                                    }}/>
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
                        <Select onValueChange={(value) => setCalendarId(Number(value))} value={calendarId?.toString() || ""}>
                            <SelectTrigger>
                                <SelectValue placeholder="Calendar">
                                    {calendarId
                                        ? (() => {
                                            const selectedCalendar = calendars.find((calendar) => calendar.id === calendarId);
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
                                {calendars.map((calendar) => (
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
                                            <Button variant="outline"
                                                    className="flex items-center w-18 h-9 p-0 border space-x-1">
                                                <div className="w-4.5 h-4.5 rounded-xl"
                                                     style={{backgroundColor: color}}/>
                                                <ChevronDownIcon className="w-3 h-3 text-gray-500"/>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-auto">
                                            <div className="flex gap-2">
                                                <ColorPicker selectedColor={color} onChange={setColor}/>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Event color
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="flex items-center space-x-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Select onValueChange={setType} value={type}>
                                        <SelectTrigger className="w-30 cursor-pointer">
                                            <SelectValue placeholder="Выберите тип" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="meeting">Meeting</SelectItem>
                                            <SelectItem value="reminder">Reminder</SelectItem>
                                            <SelectItem value="task">Task</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Type
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Select onValueChange={setCategory} defaultValue={category}>
                                        <SelectTrigger className="w-30 cursor-pointer">
                                            <SelectValue placeholder="Выберите категорию"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="work">Work</SelectItem>
                                            <SelectItem value="home">Home</SelectItem>
                                            <SelectItem value="hobby">Hobby</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Category
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <Textarea placeholder="Description" className="mt-1" maxLength={250} value={description}
                              onChange={(e) => setDescription(e.target.value)}/>

                    <UserSelector
                        users={users}
                        currentUser={currentUser}
                        selectedUsers={selectedUsers}
                        setSelectedUsers={setSelectedUsers}
                    />

                    <div className="mt-2 flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            {UiMessages.GENERAL.CANCEL_BUTTON}
                        </Button>

                        <Button
                            disabled={!(allDay || (startTime && endTime)) || !title || !startDate || !endDate }
                            onClick={handleSubmit}>
                            {UiMessages.GENERAL.CREATE_BUTTON}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateEventPage;
