import { toast } from "sonner";
import { CircleCheck, XCircle } from "lucide-react";

const toastStyle = {
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    width: "fit-content",
    textAlign: "center" as const,
};

export const showSuccessToast = (message: string) => {
    toast.success(message, {
        style: toastStyle,
        icon: <CircleCheck className="text-green-500" />,
    });
};

export const showErrorToasts = (
    errors: { msg: string }[] | string[] | string | { general?: string }
) => {
    if (Array.isArray(errors)) {
        errors.forEach((err) => {
            const errorMessage = typeof err === "string" ? err : err.msg;
            toast.error(errorMessage, {
                style: toastStyle,
                icon: <XCircle className="text-red-500" />,
            });
        });
    } else {
        toast.error(errors as string, {
            style: toastStyle,
            icon: <XCircle className="text-red-500" />,
        });
    }
};
