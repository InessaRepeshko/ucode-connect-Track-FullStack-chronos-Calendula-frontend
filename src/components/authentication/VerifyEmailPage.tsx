import { useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import { verifyEmail } from "@/components/redux/actions/authActions";
import { toast } from "sonner";

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const { confirm_token } = useParams();

    useEffect(() => {
        const verify = async () => {
            const result = await verifyEmail(confirm_token || "");
            navigate("/login");
            if (result.success) {
                toast.success("Account successfully verified!", {
                    style: { padding: "0.5rem 1rem", borderRadius: "8px", textAlign: "center", width: "fit-content" },
                });
            } else {
                toast.error("Account has not been verified!", {
                    style: { padding: "0.5rem 1rem", borderRadius: "8px", textAlign: "center", width: "fit-content" },
                });
            }
        };
        verify();
    }, [confirm_token, navigate]);
};

export default VerifyEmailPage;