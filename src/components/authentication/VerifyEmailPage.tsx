import { useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import { verifyEmail } from "@/components/redux/actions/authActions";
import {showErrorToasts, showSuccessToast} from "@/components/utils/toastNotifications.tsx";
import {MESSAGES} from "@/constants/messages.ts";

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const { confirm_token } = useParams();

    useEffect(() => {
        const verify = async () => {
            const result = await verifyEmail(confirm_token || "");
            navigate("/login");
            if (result.success) {
                showSuccessToast(MESSAGES.AUTH.VERIFICATION_SUCCESS);
            } else {
                showErrorToasts(result.errors || MESSAGES.AUTH.VERIFICATION_FAILED);
            }
        };
        verify();
    }, [confirm_token, navigate]);
    return (
        <div></div>
    );
};

export default VerifyEmailPage;