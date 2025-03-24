import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/components/redux/store";
import { Navigate, useLocation } from "react-router-dom";

interface AuthGuardProps {
    children: React.ReactNode;
    publicRoutes?: string[];
}

export default function AuthGuard({ children, publicRoutes = [] }: AuthGuardProps) {
    const { authToken } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    const defaultPublicRoutes = [
        "/login",
        "/register",
        "/confirm-email/:confirm_token",
        "/password-reset/:confirm_token",
    ];

    const allPublicRoutes = [...defaultPublicRoutes, ...publicRoutes];

    const isPublicRoute = allPublicRoutes.some((route) =>
        route.includes(":") ? location.pathname.startsWith(route.split(":")[0]) : route === location.pathname
    );

    if (!authToken && !isPublicRoute) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (authToken && isPublicRoute) {
        return <Navigate to="/calendar" replace />;
    }

    return <>{children}</>;
}