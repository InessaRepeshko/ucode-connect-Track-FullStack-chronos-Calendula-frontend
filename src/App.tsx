import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from 'sonner';
import LoginPage from "@/components/authentication/LoginPage.tsx";
import RegisterPage from "@/components/authentication/RegisterPage.tsx";
import VerifyEmailPage from "@/components/authentication/VerifyEmailPage.tsx";
import PasswordResetPage from "@/components/authentication/PasswordResetPage.tsx";
import MainPage from "@/components/calendar/MainPage.tsx";


export default function App() {
  return (
      <Router>
          <Toaster />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirm-email/:confirm_token" element={<VerifyEmailPage />} />
          <Route path="/password-reset/:confirm_token" element={<PasswordResetPage />} />
          <Route path="/calendar" element={<MainPage />} />
          {/*<Route path="/posts" element={<MainPage/>}/>*/}
          {/*<Route path="/posts/:post_id" element={<PostPage />} />*/}
          {/*<Route path="/categories" element={<CategoryList />} />*/}
          {/*<Route path="/categories/:category_id" element={<CategoryPage />} />*/}
          {/*<Route path="/users/:user_id" element={<UserPage />} />*/}
          {/*<Route path="/users" element={<UsersListPage />} />*/}
          {/*<Route path="/users/me" element={<UserPage />} />*/}
          {/*<Route path="/login" element={<LoginPage />} />*/}
          {/*<Route path="/register" element={<RegisterPage />} />*/}
          {/*<Route path="/verify-email/:confirm_token" element={<VerifyEmailPage />} />*/}
          {/*<Route path="/password-reset/:confirm_token" element={<ResetPasswordPage />} />*/}
          {/*<Route path="/profile" element={<UserPage />} />*/}
          {/*<Route path="/favorites" element={<FavoritesPage />} />*/}
        </Routes>
      </Router>
  );
}
