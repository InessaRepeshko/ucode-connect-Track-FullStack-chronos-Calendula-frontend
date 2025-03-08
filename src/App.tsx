// import { AppSidebar } from "@/components/app-sidebar"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbList,
//   BreadcrumbPage,
// } from "@/components/ui/breadcrumb"
// import { Separator } from "@/components/ui/separator"
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar"
// import CustomCalendar from "@/components/CustomCalendar.tsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from 'sonner';
import LoginPage from "@/components/authentication/LoginPage.tsx";
import RegisterPage from "@/components/authentication/RegisterPage.tsx";
import CustomCalendar from "@/components/CustomCalendar.tsx";
import VerifyEmailPage from "@/components/authentication/VerifyEmailPage.tsx";
import PasswordResetPage from "@/components/authentication/PasswordResetPage.tsx";


export default function App() {
  return (
      <Router>
          <Toaster />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirm-email/:confirm_token" element={<VerifyEmailPage />} />
          <Route path="/password-reset/:confirm_token" element={<PasswordResetPage />} />
          <Route path="/calendar" element={<CustomCalendar />} />
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
      // <SidebarProvider>
      //   <AppSidebar />
      //   <SidebarInset>
      //     <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      //       <SidebarTrigger className="-ml-1" />
      //       <Separator orientation="vertical" className="mr-2 h-4" />
      //       <Breadcrumb>
      //         <BreadcrumbList>
      //           <BreadcrumbItem>
      //             <BreadcrumbPage>October 2024</BreadcrumbPage>
      //           </BreadcrumbItem>
      //         </BreadcrumbList>
      //       </Breadcrumb>
      //     </header>
      //     <div className="flex flex-1 flex-col gap-4 p-4">
      //       <CustomCalendar />
      //     </div>
      //   </SidebarInset>
      // </SidebarProvider>

}
