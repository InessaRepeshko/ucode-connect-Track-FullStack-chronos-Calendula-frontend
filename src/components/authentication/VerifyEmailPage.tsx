import { useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import { verifyEmail } from "@/components/redux/actions/authActions";
import {showErrorToasts, showSuccessToast} from "@/components/utils/ToastNotifications.tsx";
import {ToastStatusMessages} from "@/constants/toastStatusMessages.ts";

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const { confirm_token } = useParams();

    useEffect(() => {
        const verify = async () => {
            const result = await verifyEmail(confirm_token || "");
            navigate("/login");
            if (result.success) {
                showSuccessToast(ToastStatusMessages.AUTH.VERIFICATION_SUCCESS);
            } else {
                showErrorToasts(result.errors || ToastStatusMessages.AUTH.VERIFICATION_FAILED);
            }
        };
        verify();
    }, [confirm_token, navigate]);
    return (
        <div></div>
    );
};

export default VerifyEmailPage;