"use client"

import { Auth } from "@/components/auth";
import { useParams } from "next/navigation";

export default function AuthPage() {
    const { path } = useParams<{ path: string }>();
    return (
        <div>
            <Auth path={path} />
        </div>
    )
}