import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import soloImage from "../../assets/solo.png";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { confirmPasswordReset } from "@/components/redux/actions/authActions";
import {showErrorToasts, showSuccessToast} from "@/components/utils/toastNotifications.ts";
import {MESSAGES} from "@/constants/messages.ts";

export default function PasswordResetPage({ className, ...props }: React.ComponentProps<"div">) {
    const { confirm_token } = useParams<{ confirm_token: string }>(); // Получаем токен из URL
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({ password: "", confirmPassword: "" });

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm_token) {
            toast.error("Invalid token.");
            return;
        }

        const result = await confirmPasswordReset(confirm_token, formData.password, formData.confirmPassword);
        if (result.success) {
            showSuccessToast(MESSAGES.AUTH.PASSWORD_CHANGED_SUCCESS);
            navigate("/login");
        } else {
            showErrorToasts(result.errors || MESSAGES.AUTH.PASSWORD_CHANGED_FAILED);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-2xl">
                <div className={cn("flex flex-col gap-6", className)} {...props}>
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <div className="relative hidden bg-muted md:block">
                                <img
                                    src={soloImage}
                                    alt="Image"
                                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                                />
                            </div>
                            <div className="relative w-full overflow-hidden">
                                <form className="p-6 md:p-8 w-full" onSubmit={handleSubmit}>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col items-center text-center">
                                            <h1 className="text-2xl font-bold">Reset Password</h1>
                                            <p className="text-muted-foreground">Enter your new password</p>
                                        </div>

                                        {/* Поле нового пароля */}
                                        <div className="relative flex items-center gap-2">
                                            <div className="absolute left-2">
                                                <LockKeyhole />
                                            </div>
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="New Password"
                                                className="pl-10"
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="absolute right-2 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                                            </button>
                                        </div>

                                        {/* Поле подтверждения пароля */}
                                        <div className="relative flex items-center gap-2">
                                            <div className="absolute left-2">
                                                <LockKeyhole />
                                            </div>
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                className="pl-10"
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleConfirmPasswordVisibility}
                                                className="absolute right-2 cursor-pointer"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                                            </button>
                                        </div>

                                        <Button type="submit" className="w-full" disabled={!formData.password || !formData.confirmPassword}>
                                            Reset Password
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
