import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {CalendarFold, Crown} from "lucide-react";
import {getUsers} from "@/components/redux/actions/userActions.ts";
import {Avatar, AvatarImage} from "@/components/ui/avatar.tsx";
import {
    createCalendar,
    getCalendarById,
    getCalendars,
    updateCalendar
} from "@/components/redux/actions/calendarActions.ts";
import {showErrorToasts, showSuccessToast} from "@/components/utils/ToastNotifications.tsx";
import {ToastStatusMessages} from "@/constants/toastStatusMessages.ts";
import {UiMessages} from "@/constants/uiMessages.ts";

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
    role: 'viewer' | 'editor';
}

export function ManageCalendarModal({ isOpen, onClose, isEditMode, calendar_id }: AddCalendarModalProps) {
    const dispatch = useDispatch();
    const users = useSelector((state: { users: { users: any[] } }) => state.users.users ?? []);
    const currentUser = useSelector((state: { auth: { user: User } }) => state.auth.user);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [search, setSearch] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            (async () => {
                await getUsers(dispatch);
            })();
            if (currentUser && !selectedUsers.some((u) => u.id === currentUser.id)) {
                setSelectedUsers([{ ...currentUser, role: "owner" }]);
            }
        } else {
            resetForm();
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && calendar_id) {
                (async () => {
                    const calendarToEdit = await getCalendarById(dispatch, calendar_id);
                    if (calendarToEdit.success && calendarToEdit.data) {
                        setTitle(calendarToEdit.data.title);
                        setDescription(calendarToEdit.data.description);

                        const creator = users.find(user => user.id === calendarToEdit.data.creatorId);
                        if (creator) {
                            setSelectedUsers([{ ...creator, role: "owner" }, ...calendarToEdit.data.users]);
                        }
                    }
                })();
            } else {
                resetForm();
                if (currentUser) {
                    setSelectedUsers([{ ...currentUser, role: "owner" }]);
                }
            }
        }
    }, [isOpen, isEditMode, calendar_id, users, currentUser]);

    const filteredUsers = (users ?? []).filter(
        (user) =>
            (user.fullName.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())) &&
            !selectedUsers.some((u) => u.id === user.id)
    );

    const addUser = (user: User) => {
        setSelectedUsers([...selectedUsers, { ...user, role: "viewer" }]);
        setSearch("");
    };

    const updateUserRole = (id: number, role: 'viewer' | 'editor') => {
        setSelectedUsers(selectedUsers.map((user) => (user.id === id ? { ...user, role } : user)));
    };

    const removeUser = (id: number) => {
        if (id !== currentUser.id) {
            setSelectedUsers(selectedUsers.filter((user) => user.id !== id));
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setSearch("");
        setSelectedUsers(currentUser ? [{ ...currentUser, role: "owner" }] : []);
    };

    const handleSave = async () => {
        const payload = { title, description };
        let result;

        if (isEditMode && calendar_id) {
            result = await updateCalendar(dispatch, calendar_id, payload);
        } else {
            result = await createCalendar(dispatch, payload);
        }

        if (result.success) {
            await getCalendars(dispatch);
            showSuccessToast(isEditMode ? ToastStatusMessages.CALENDARS.UPDATE_SUCCESS : ToastStatusMessages.CALENDARS.CREATE_SUCCESS);
            onClose();
            resetForm();
        } else {
            showErrorToasts(result.errors || isEditMode ? ToastStatusMessages.CALENDARS.UPDATE_FAILED : ToastStatusMessages.CALENDARS.CREATE_FAILED);
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent forceMount className="w-[480px] max-w-md p-6 text-[14px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-1">
                        {isEditMode ? UiMessages.CALENDAR_MODAL.CALENDAR_MODAL_UPDATE_CALENDAR_TITLE : UiMessages.CALENDAR_MODAL.CALENDAR_MODAL_ADD_CALENDAR_TITLE}
                        <CalendarFold />
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode ? UiMessages.CALENDAR_MODAL.CALENDAR_MODAL_UPDATE_CALENDAR_DESCRIPTION : UiMessages.CALENDAR_MODAL.CALENDAR_MODAL_ADD_CALENDAR_DESCRIPTION}
                    </DialogDescription>
                </DialogHeader>

                <Input placeholder="Title" className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea placeholder="Description" className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} />

                <div className="mt-1 border rounded-md p-3 h-46 relative">
                    <div className="sticky top-0 bg-white z-10">
                        <Input
                            className="mb-2"
                            placeholder="User search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="overflow-y-auto mt-2 max-h-31">
                        {search && (
                            <div className="absolute bg-white border rounded-md shadow-md max-h-40 overflow-y-auto z-50">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                            onClick={() => addUser(user)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Avatar className="h-8 w-8 rounded-lg">
                                                    <AvatarImage src={`http://localhost:8080/profile-pictures/${user.profilePicture}`} alt={user.fullName} />
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.fullName}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[14px] p-3 text-gray-500">User was not found</p>
                                )}
                            </div>
                        )}
                        {selectedUsers.map((user, index) => (
                            <div key={user.id} className={`flex justify-between items-center py-1 ${index !== selectedUsers.length - 1 ? 'border-b' : ''}`}>
                                <div className="p-1 flex items-center space-x-2">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={`http://localhost:8080/profile-pictures/${user.profilePicture}`} alt={user.fullName} />
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.fullName}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {user.id !== currentUser.id ? (
                                        <Select value={user.role} onValueChange={(role: "viewer" | "editor") => updateUserRole(user.id, role)}>
                                            <SelectTrigger className="w-24 cursor-pointer">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="viewer" className="cursor-pointer">{UiMessages.GENERAL.GENERAL_VIEWER}</SelectItem>
                                                <SelectItem value="editor" className="cursor-pointer">{UiMessages.GENERAL.GENERAL_EDITOR}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <span className="text-[15px] font-semibold text-gray-600 flex items-center" >
                                            <Crown className="w-6 h-6 text-yellow-500 mr-1" />
                                            {UiMessages.GENERAL.GENERAL_OWNER}
                                        </span>
                                    )}

                                    {user.id !== currentUser.id && (
                                        <Button variant="outline" size="icon" onClick={() => removeUser(user.id)}>
                                            ✕
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-2 flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => { onClose(); resetForm(); }}>Cancel</Button>
                    <Button disabled={!title} onClick={handleSave}>
                        {isEditMode ? UiMessages.GENERAL.GENERAL_UPDATE_BUTTON : UiMessages.GENERAL.GENERAL_CREATE_BUTTON}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
