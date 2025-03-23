import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import {Toaster} from 'sonner';
import LoginPage from "@/components/authentication/LoginPage.tsx";
import RegisterPage from "@/components/authentication/RegisterPage.tsx";
import VerifyEmailPage from "@/components/authentication/VerifyEmailPage.tsx";
import PasswordResetPage from "@/components/authentication/PasswordResetPage.tsx";
import MainPage from "@/components/calendar/MainPage.tsx";
import CreateEventPage from "@/components/event/CreateEventPage.tsx";
import AuthGuard from "@/components/route/AuthGuard.tsx";


export default function App() {
    return (
        <Router>
            <Toaster/>
            <AuthGuard>
                <Routes>
                    <Route path="/" element={<Navigate to="/calendar" replace />} />
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route path="/confirm-email/:confirm_token" element={<VerifyEmailPage/>}/>
                    <Route path="/password-reset/:confirm_token" element={<PasswordResetPage/>}/>
                    <Route path="/calendar" element={<MainPage/>}/>
                    <Route path="/new-event" element={<CreateEventPage/>}/>
                    <Route path="/edit-event" element={<CreateEventPage/>}/>
                </Routes>
            </AuthGuard>
        </Router>
    );
}
