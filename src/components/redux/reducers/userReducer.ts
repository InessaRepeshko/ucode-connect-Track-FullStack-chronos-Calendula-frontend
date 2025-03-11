import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    id: number;
    fullName: string;
    email: string;
    profilePicture: string;
    country: string;
    // role: string;
}

interface UsersState {
    users: User[] | null;
    loading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
};

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        setUsers: (state, action: PayloadAction<User[]>) => {
            state.users = action.payload;
            state.loading = false;
            state.error = null;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const { setUsers, setError } = usersSlice.actions;
export default usersSlice.reducer;
