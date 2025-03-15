import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CalendarFold } from "lucide-react";
import { getUsers } from "@/components/redux/actions/userActions.ts";
import {
    createCalendar,
    getCalendarById,
    getCalendars,
    updateCalendar
} from "@/components/redux/actions/calendarActions.ts";
import { showErrorToasts, showSuccessToast } from "@/components/utils/ToastNotifications.tsx";
import { ToastStatusMessages } from "@/constants/toastStatusMessages.ts";
import { UiMessages } from "@/constants/uiMessages.ts";
import { UserSelector } from "@/components/utils/UserSelector.tsx";


interface AddCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEditMode: boolean;
    calendar_id?: number;
}

interface User {
    id: number;
    fullName: string;
    email: string;
    profilePicture: string;
    role: 'viewer' | 'member' | 'owner';
}

interface Participant {
    user: User;
    role: 'viewer' | 'member';
}

export function ManageCalendarModal({ isOpen, onClose, isEditMode, calendar_id }: AddCalendarModalProps) {
    const dispatch = useDispatch();
    const users = useSelector((state: { users: { users: any[] } }) => state.users.users ?? []);
    const currentUser = useSelector((state: { auth: { user: User } }) => state.auth.user);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [calendarType, setCalendarType] = useState<string | null>(null);
    const [isDataReady, setIsDataReady] = useState(false);

    useEffect(() => {
        if (isOpen) {
            (async () => {
                await getUsers(dispatch);
                if (currentUser && !selectedUsers.some((u) => u.id === currentUser.id)) {
                    setSelectedUsers([{ ...currentUser, role: "owner" }]);
                }
                setIsDataReady(true);
            })();
        } else {
            resetForm();
            setCalendarType(null);
            setIsDataReady(false);
        }
    }, [isOpen, dispatch, currentUser]);


    useEffect(() => {
        if (isOpen && isEditMode && calendar_id) {
            (async () => {
                setIsDataReady(false);
                const calendarToEdit = await getCalendarById(dispatch, calendar_id);

                if (calendarToEdit.success && calendarToEdit.data) {
                    setTitle(calendarToEdit.data.title);
                    setDescription(calendarToEdit.data.description);
                    setCalendarType(calendarToEdit.data.type);

                    const creator = users.find(user => user.id === calendarToEdit.data.creationByUserId);
                    const participants = calendarToEdit.data.participants.map((p: Participant) => ({
                        ...p.user,
                        role: p.role
                    }));

                    const owner = participants.find((u: User) => u.role === "owner") ||
                        (creator ? { ...creator, role: "owner" } : null);
                    const otherParticipants = participants.filter((u: User) => u.role !== "owner");

                    if (owner) {
                        setSelectedUsers([owner, ...otherParticipants]);
                    } else if (creator) {
                        setSelectedUsers([{ ...creator, role: "owner" }, ...participants]);
                    } else {
                        setSelectedUsers(participants);
                    }
                }
                setIsDataReady(true);
            })();
        } else if (isOpen && !isEditMode) {
            resetForm();
            setCalendarType(null);
            setIsDataReady(true);
        }
    }, [isOpen, isEditMode, calendar_id, users, dispatch]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setSelectedUsers([]);
    };

    const handleSave = async () => {
        const payload = { title, description };
        let result;

        if (isEditMode && calendar_id) {
            result = await updateCalendar(
                dispatch,
                calendar_id,
                payload,
                selectedUsers.map(({ id, role }) => ({ userId: id, role }))
            );
        } else {
            result = await createCalendar(
                dispatch,
                payload,
                selectedUsers.map(({ id, role }) => ({ userId: id, role }))
            );
        }

        if (result.success) {
            await getCalendars(dispatch);
            showSuccessToast(
                isEditMode ? ToastStatusMessages.CALENDARS.UPDATE_SUCCESS : ToastStatusMessages.CALENDARS.CREATE_SUCCESS
            );
            onClose();
            resetForm();
        } else {
            showErrorToasts(
                result.errors ||
                (isEditMode ? ToastStatusMessages.CALENDARS.UPDATE_FAILED : ToastStatusMessages.CALENDARS.CREATE_FAILED)
            );
        }
    };

    if (!isOpen || !isDataReady) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent forceMount className="w-[500px] max-w-md p-6 text-[14px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-1">
                        {isEditMode ? UiMessages.CALENDAR_MODAL.UPDATE_CALENDAR_TITLE : UiMessages.CALENDAR_MODAL.ADD_CALENDAR_TITLE}
                        <CalendarFold />
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode ? UiMessages.CALENDAR_MODAL.UPDATE_CALENDAR_DESCRIPTION : UiMessages.CALENDAR_MODAL.ADD_CALENDAR_DESCRIPTION}
                    </DialogDescription>
                </DialogHeader>

                <Input
                    placeholder="Title"
                    className="mt-1"
                    maxLength={50}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                    placeholder="Description"
                    className="mt-1"
                    maxLength={250}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {calendarType !== "main" && (
                    <UserSelector
                        users={users}
                        currentUser={currentUser}
                        selectedUsers={selectedUsers}
                        setSelectedUsers={setSelectedUsers}
                    />
                )}

                <div className="mt-2 flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => { onClose(); resetForm(); }}>
                        Cancel
                    </Button>
                    <Button disabled={!title} onClick={handleSave}>
                        {isEditMode ? UiMessages.GENERAL.UPDATE_BUTTON : UiMessages.GENERAL.CREATE_BUTTON}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}