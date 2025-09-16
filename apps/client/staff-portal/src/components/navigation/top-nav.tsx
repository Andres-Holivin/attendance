import { Navbar } from "@workspace/ui/components/custom/navbar";
import Logo from "../logo";
import { NavigationNotification } from "./nav-notification";
import { NavigationSignIn } from "./nav-sign-in";
import { useMe } from "@/hooks/useAuth";

export default function TopNav() {
    const { data, isLoading } = useMe();
    return (
        <Navbar
            navigationLinks={[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/attendance", label: "Attendance" },
            ]}
            logoHref={data?.data?.user ? "/dashboard" : "/"}
            isAuthenticated={!!data?.data?.user}
            signIn={<NavigationSignIn />}
            notification={<NavigationNotification />}
            logo={<Logo />}
        />
    )
}