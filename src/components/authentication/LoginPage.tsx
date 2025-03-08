import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import soloImage from "../../assets/solo.png";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {loginUser, passwordReset} from "@/components/redux/actions/authActions";
import { setUser } from "@/components/redux/reducers/authReducer";
import { useNavigate } from "react-router-dom";
import {toast} from "sonner";

export default function LoginPage({ className, ...props }: React.ComponentProps<"div">) {
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" }); // Состояние формы
    const [resetEmail, setResetEmail] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await loginUser(formData, dispatch);

        if (result.authToken) {
            dispatch(setUser(result)); // Записываем пользователя в Redux
            toast.success("Successful Login", {
                style: { padding: "0.5rem 1rem", borderRadius: "8px", textAlign: "center", width: "fit-content" },
            });
            navigate("/calendar"); // Переход на главную
        } else {
            if (Array.isArray(result.errors)) {
                result.errors.forEach((err) => {
                    toast.error(err.msg, {
                        style: { padding: "0.5rem 1rem", borderRadius: "8px", textAlign: "center", width: "fit-content" },
                    });
                });
            } else {
                toast.error("Login failed"); // Общая ошибка
            }
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await passwordReset(resetEmail);

        if (result.success) {
            toast.success("Password reset link sent to your email.", {
                style: { padding: "0.5rem 1rem", borderRadius: "8px", textAlign: "center", width: "fit-content" },
            });
            setResetEmail("");
        } else {
            if (Array.isArray(result.errors)) {
                result.errors.forEach((err) => {
                    toast.error(err.msg, {
                        style: { padding: "0.5rem 1rem", borderRadius: "8px", textAlign: "center", width: "fit-content" },
                    });
                });
            } else {
                toast.error("Password reset link has not been sent.", {
                    style: { padding: "0.5rem 1rem", borderRadius: "8px", textAlign: "center", width: "fit-content" },
                });
            }
        }
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
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
                                {!isForgotPassword ? (
                                    <form className="p-6 md:p-8 w-full h-[340px]" onSubmit={handleSubmit}>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col items-center text-center">
                                                <h1 className="text-2xl font-bold">Welcome back</h1>
                                                <p className="text-balance text-muted-foreground">
                                                    Login to your account
                                                </p>
                                            </div>
                                            <div className="relative flex items-center gap-2">
                                                <div className="absolute left-2">
                                                    <Mail />
                                                </div>
                                                <Input
                                                    id="email"
                                                    type="text"
                                                    placeholder="Email"
                                                    className="pl-10"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div className="relative flex flex-col gap-1">
                                                <div className="relative flex items-center gap-2">
                                                    <div className="absolute left-2">
                                                        <LockKeyhole />
                                                    </div>
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Password"
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
                                                        {showPassword ? (
                                                            <EyeOff className="h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsForgotPassword(true)}
                                                        className="text-sm text-muted-foreground underline-offset-2 hover:underline cursor-pointer"
                                                    >
                                                        Forgot your password?
                                                    </button>
                                                </div>
                                            </div>

                                            <Button type="submit" className="w-full" disabled={!formData.email || !formData.password}>
                                                Login
                                            </Button>
                                            <div className="text-center text-sm">
                                                Don&apos;t have an account?{" "}
                                                <a href="/register" className="underline underline-offset-4">
                                                    Sign up
                                                </a>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <form className="flex items-center justify-center p-6 md:p-8 w-full h-[340px]" onSubmit={handleResetPassword}>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col items-center text-center">
                                                <h1 className="text-2xl font-bold">Reset Password</h1>
                                                <p className="text-balance text-muted-foreground">
                                                    Enter your email to receive reset link
                                                </p>
                                            </div>
                                            <div className="relative flex items-center gap-2">
                                                <div className="absolute left-2">
                                                    <Mail />
                                                </div>
                                                <Input
                                                    id="email"
                                                    type="text"
                                                    placeholder="Email"
                                                    className="pl-10"
                                                    required
                                                    value={resetEmail}
                                                    onChange={(e) => setResetEmail(e.target.value)}
                                                />
                                            </div>
                                            <Button type="submit" className="w-full">
                                                Send Reset Link
                                            </Button>
                                            <div className="flex items-center justify-center gap-2 w-full">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsForgotPassword(false)}
                                                    className="text-sm text-muted-foreground underline-offset-2 hover:underline text-center cursor-pointer"
                                                >
                                                    Back to login
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
