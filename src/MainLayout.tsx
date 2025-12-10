// src/MainLayout.tsx
import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <div className="h-full">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <Outlet />
            </div>
        </div>
    );
}
