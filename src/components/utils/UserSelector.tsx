import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import { Crown } from "lucide-react";
import { UiMessages } from "@/constants/uiMessages.ts";

interface User {
    id: number;
    fullName: string;
    email: string;
    profilePicture: string;
    role: "viewer" | "member" | "owner";
}

interface UserSelectorProps {
    users: User[];
    selectedUsers: User[];
    setSelectedUsers: (users: User[]) => void;
    showRoleSelector?: boolean;
    creatorId?: number | null; // Новый пропс для ID создателя
}

const UserSelector = ({
                          users,
                          selectedUsers,
                          setSelectedUsers,
                          showRoleSelector = true,
                          creatorId = null,
                      }: UserSelectorProps) => {
    const [search, setSearch] = useState("");

    const filteredUsers = (users ?? []).filter(
        (user) =>
            (user.fullName.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())) &&
            !selectedUsers.some((u) => u.id === user.id) &&
            user.id !== creatorId
    );

    const addUser = (user: User) => {
        if (user.id !== creatorId) {
            setSelectedUsers([...selectedUsers, { ...user, role: "viewer" }]);
        }
        setSearch("");
    };

    const updateUserRole = (id: number, role: "viewer" | "member") => {
        setSelectedUsers(selectedUsers.map((user) => (user.id === id ? { ...user, role } : user)));
    };

    const removeUser = (id: number) => {
        if (id !== creatorId) {
            setSelectedUsers(selectedUsers.filter((user) => user.id !== id));
        }
    };

    const sortedSelectedUsers = [...selectedUsers].sort((a, b) => {
        if (creatorId === null) return 0;
        if (a.id === creatorId) return -1
        if (b.id === creatorId) return 1
        return 0;
    });

    return (
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
                                            <AvatarImage
                                                src={`http://localhost:8080/profile-pictures/${user.profilePicture}`}
                                                alt={user.fullName}
                                            />
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
                {sortedSelectedUsers.map((user, index) => (
                    <div
                        key={user.id}
                        className={`flex justify-between items-center py-1 ${
                            index !== sortedSelectedUsers.length - 1 ? "border-b" : ""
                        }`}
                    >
                        <div className="p-1 flex items-center space-x-2">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage
                                    src={`http://localhost:8080/profile-pictures/${user.profilePicture}`}
                                    alt={user.fullName}
                                />
                            </Avatar>
                            <div>
                                <p className="font-medium">{user.fullName}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {user.id !== creatorId ? (
                                showRoleSelector && (
                                    <Select
                                        value={user.role}
                                        onValueChange={(role: "viewer" | "member") => updateUserRole(user.id, role)}
                                    >
                                        <SelectTrigger className="w-26 cursor-pointer">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="viewer" className="cursor-pointer">
                                                {UiMessages.GENERAL.VIEWER}
                                            </SelectItem>
                                            <SelectItem value="member" className="cursor-pointer">
                                                {UiMessages.GENERAL.MEMBER}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )
                            ) : (
                                <span className="text-[15px] font-semibold text-gray-600 flex items-center">
                                    <Crown className="w-6 h-6 text-yellow-500 mr-1" />
                                    {UiMessages.GENERAL.OWNER}
                                </span>
                            )}
                            {user.id !== creatorId && (
                                <Button variant="outline" size="icon" onClick={() => removeUser(user.id)}>
                                    ✕
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserSelector;