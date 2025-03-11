import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import CustomCalendar from "@/components/CustomCalendar.tsx";

export default function MainPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">

                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <CustomCalendar />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
