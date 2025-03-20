import {JSX} from "react";
import {Popover, PopoverContent} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {
    Pencil,
    Trash2,
    X,
    Calendar,
    BriefcaseBusiness,
    Briefcase,
    Palette,
    Crown,
    UsersRound,
    Check, Video, BellRing, BookmarkCheck, House, CalendarFold
} from "lucide-react";
import {format} from "date-fns";
import {Avatar, AvatarImage} from "@/components/ui/avatar.tsx";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";

interface User {
    id: number;
    fullName: string;
    email: string;
    profilePicture: string;
    attendanceStatus?: "yes" | "no" | "maybe";
}

interface EventDetailsPopoverProps {
    position: { x: number; y: number };
    event: {
        id: string;
        title: string;
        start: string;
        end: string;
        description?: string;
        category?: string;
        type?: string;
        creationByUserId: number;
        calendarTitle?: string;
        calendarType?: string;
        creator: User;
        participants: User[];
    };
    onEdit: () => void;
    onDelete: () => void;
    onClose: () => void;
    currentUserId?: number;
    onAttendanceChange?: (userId: number, status: "yes" | "no" | "maybe" | undefined) => void;
}

export default function EventDetailsPopover({
                                                position,
                                                event,
                                                onEdit,
                                                onDelete,
                                                onClose,
                                                currentUserId,
                                                onAttendanceChange,
                                            }: EventDetailsPopoverProps) {
    const startDateTime = new Date(event.start);
    const endDateTime = new Date(event.end);
    const isCreator = currentUserId === event.creationByUserId;

    const isAllDay =
        startDateTime.getHours() === 0 &&
        startDateTime.getMinutes() === 0 &&
        endDateTime.getHours() === 23 &&
        endDateTime.getMinutes() === 59;

    const isSpecialCalendar = event.calendarType === "holidays" || event.calendarType === "birthdays";

    const typeIcons: { [key: string]: JSX.Element } = {
        meeting: <Video strokeWidth={3} className="w-4 h-4 mr-1 mt-1"/>,
        reminder: <BellRing strokeWidth={3} className="w-4 h-4 mr-1"/>,
        task: <BookmarkCheck strokeWidth={3} className="w-4 h-4 mr-1"/>,
    };

    const categoryIcons: { [key: string]: JSX.Element } = {
        work: <BriefcaseBusiness strokeWidth={3} className="w-4 h-4 mr-1"/>,
        home: <House strokeWidth={3} className="w-4 h-4 mr-1"/>,
        hobby: <Palette strokeWidth={3} className="w-4 h-4 mr-1"/>,
    };

    const participantsWithoutCreator = event.participants.filter(
        (participant) => participant.id !== event.creator.id
    );

    const totalParticipants = event.participants.length;

    const statusIcons: { [key: string]: JSX.Element } = {
        yes: <Check className="w-4 h-4 text-green-500 bg-green-100 rounded-lg border"/>,
        no: <X className="w-4 h-4 text-red-500 bg-red-100 rounded-lg border"/>,
        maybe: (
            <div className="bg-gray-100 rounded-lg w-4 h-4 flex items-center justify-center border">
                <span className="text-black text-sm font-medium">?</span>
            </div>
        ),
    };

    const allParticipants = [...event.participants]; // Все участники, включая создателя
    const statusCounts = {
        yes: allParticipants.filter((p) => p.attendanceStatus === "yes").length,
        no: allParticipants.filter((p) => p.attendanceStatus === "no").length,
        maybe: allParticipants.filter((p) => p.attendanceStatus === "maybe").length,
        unanswered: allParticipants.filter((p) => !p.attendanceStatus).length,
    };

    const sortedParticipants = participantsWithoutCreator.sort((a, b) => {
        const order = {yes: 0, no: 1, maybe: 2, undefined: 3};
        const statusA = a.attendanceStatus || "undefined";
        const statusB = b.attendanceStatus || "undefined";
        return order[statusA] - order[statusB];
    });

    const handleAttendanceChange = (status: "yes" | "no" | "maybe" | undefined) => {
        if (currentUserId && onAttendanceChange) {
            onAttendanceChange(currentUserId, status);
        }
    };

    const currentUserStatus = event.participants.find((p) => p.id === currentUserId)?.attendanceStatus;

    return (
        <Popover open={true} onOpenChange={(open) => !open && onClose()}>
            <PopoverContent
                className=" w-[385px] h-auto p-4 space-y-3 bg-white border rounded-lg shadow-lg"
                style={{position: "absolute", top: position.y, left: position.x}}>
                <div className="flex justify-between items-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h3 className="text-lg font-semibold truncate max-w-[280px]">
                                    {event.title}
                                </h3>
                            </TooltipTrigger>
                                <TooltipContent>
                                    <p>{event.title}</p>
                                </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <div className="flex gap-2">
                        {isCreator && (
                            <>
                                <Button variant="ghost" size="sm" onClick={onEdit}>
                                    <Pencil className="w-4 h-4"/>
                                </Button>
                                <Button variant="ghost" size="sm" onClick={onDelete}>
                                    <Trash2 className="w-4 h-4"/>
                                </Button>
                            </>
                        )}
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>

                <div className="-mt-3 text-sm text-gray-600 flex items-center gap-3">
                    {format(startDateTime, "EEEE, MMMM d")}
                    {!isAllDay && (
                        <span>
                            {format(startDateTime, "HH:mm")} - {format(endDateTime, "HH:mm")}
                        </span>
                    )}
                </div>

                {event.description && (
                    <div className="text-sm text-gray-600 space-y-2">
                        <p>{event.description}</p>
                    </div>
                )}

                {(event.type || event.category || event.calendarTitle) && (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        {event.type && (
                            <div className="flex items-center">
                                {typeIcons[event.type] || <Calendar className="w-4 h-4 mr-1"/>}
                                <span className="px-1 capitalize">{event.type}</span>
                            </div>
                        )}
                        {event.category && (
                            <div className="flex items-center">
                                {categoryIcons[event.category] || <Briefcase className="w-4 h-4 mr-1"/>}
                                <span className="px-1 capitalize">{event.category}</span>
                            </div>
                        )}
                        {event.calendarTitle && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <CalendarFold strokeWidth={3} className="w-4 h-4 mr-1 flex-shrink-0" />
                                            <span className="px-1 truncate max-w-[150px]">{event.calendarTitle}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Calendar: {event.calendarTitle}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                )}
                {!isSpecialCalendar && (
                    <>
                        <div className="flex items-center text-sm text-gray-600">
                            <UsersRound strokeWidth={3} className="w-4 h-4 mr-1 mt-1 "/>
                            <div>
                                <div className="flex items-center px-1">
                                    <span
                                        className="font-medium">{totalParticipants} participant{totalParticipants > 1 ? "s" : ""}</span>
                                </div>
                                <div className="flex flex-wrap  -mt-1 px-1">
                            <span className="flex items-center">
                                {[
                                    statusCounts.yes > 0 ? `${statusCounts.yes} yes` : null,
                                    statusCounts.no > 0 ? `${statusCounts.no} no` : null,
                                    statusCounts.maybe > 0 ? `${statusCounts.maybe} maybe` : null,
                                    statusCounts.unanswered > 0 ? `${statusCounts.unanswered} awaiting` : null,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </span>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`space-y-1 custom-scroll ${
                                sortedParticipants.length > 1
                                    ? "max-h-[121px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                                    : ""
                            }`}>
                            <div className="flex items-center space-x-2 text-gray-600 relative">
                                <div className="relative">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage
                                            src={`http://localhost:8080/profile-pictures/${event.creator.profilePicture}`}
                                            alt={event.creator.fullName}
                                        />
                                    </Avatar>
                                    {event.creator.attendanceStatus && (
                                        <div className="absolute bottom-0 left-0 translate-x-[130%] translate-y-[10%]">
                                            {statusIcons[event.creator.attendanceStatus]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        <p className="text-sm font-medium">{event.creator.fullName}</p>
                                        <Crown className="w-4 h-4 text-yellow-500"/>
                                    </div>
                                    <p className="text-[12px] text-gray-500">{event.creator.email}</p>
                                </div>
                            </div>

                            {sortedParticipants.length > 0 && (
                                <div className="space-y-1">
                                    {sortedParticipants.map((participant) => (
                                        <div
                                            key={participant.id}
                                            className="flex items-center space-x-2 text-gray-600 relative"
                                        >
                                            <div className="relative">
                                                <Avatar className="h-8 w-8 rounded-lg">
                                                    <AvatarImage
                                                        src={`http://localhost:8080/profile-pictures/${participant.profilePicture}`}
                                                        alt={participant.fullName}
                                                    />
                                                </Avatar>
                                                {participant.attendanceStatus && (
                                                    <div
                                                        className="absolute bottom-0 left-0 translate-x-[130%] translate-y-[10%]">
                                                        {statusIcons[participant.attendanceStatus]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{participant.fullName}</p>
                                                <p className="text-[12px] text-gray-500">{participant.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
                {currentUserId && event.participants.some((p) => p.id === currentUserId) && !isCreator && (
                    <div className=" translate-y-[15%] rounded-lg  flex items-center gap-3">
                        <span className="text-[15px] text-gray-700">Will you attend?</span>
                        <div className="flex gap-2">
                            <Button
                                variant={currentUserStatus === "yes" ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleAttendanceChange("yes")}
                                className="flex items-center gap-1"
                            >
                                <Check className="w-4 h-4"/>
                                Yes
                            </Button>
                            <Button
                                variant={currentUserStatus === "no" ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleAttendanceChange("no")}
                                className="flex items-center gap-1"
                            >
                                <X className="w-4 h-4"/>
                                No
                            </Button>
                            <Button
                                variant={currentUserStatus === "maybe" ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleAttendanceChange("maybe")}
                                className="flex items-center gap-1"
                            >
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <span className="text-sm font-medium">?</span>
                                </div>
                                Maybe
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}