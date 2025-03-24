import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    id: number;
    fullName: string;
    email: string;
    profilePicture: string;
}

interface AuthState {
    authToken: string | null;
    user: User | null;
    loginErrors: { path: string; msg: string }[];
    registrationErrors: { path: string; msg: string }[];
}

const initialState: AuthState = {
    authToken: localStorage.getItem("token"),
    user: null,
    loginErrors: [],
    registrationErrors: [],
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<{ authToken: string; user: User }>) {
            state.authToken = action.payload.authToken;
            state.user = action.payload.user;
            state.loginErrors = [];
        },
        setErrors(state, action: PayloadAction<{ path: string; msg: string }[]>) {
            state.loginErrors = action.payload;
        },
        setRegistrationErrors(state, action: PayloadAction<{ path: string; msg: string }[]>) {
            state.registrationErrors = action.payload;
        },
        logout(state) {
            state.authToken = null;
            state.user = null;
            localStorage.removeItem("token");
        },
    },
});

export const { setUser, setErrors, setRegistrationErrors, logout } = authSlice.actions;
export default authSlice.reducer;