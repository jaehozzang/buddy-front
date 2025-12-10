// src/components/HeaderButton.tsx
import { Link } from "react-router-dom";

type HeaderButtonProps = {
    to: string;
    children: React.ReactNode;
    variant?: "solid" | "outline" | "ghost";
    className?: string;
};

export default function HeaderButton({
    to,
    children,
    variant = "solid",
    className = "",
}: HeaderButtonProps) {
    const base =
        "inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md transition";

    const styles =
        variant === "solid"
            ? "bg-primary-600 text-white hover:bg-primary-700"
            : variant === "outline"
                ? "border border-primary-400 text-primary-600 hover:bg-primary-50"
                : "text-slate-700 hover:bg-slate-100"; // ghost 버전

    return (
        <Link to={to} className={`${base} ${styles} ${className}`}>
            {children}
        </Link>
    );
}
