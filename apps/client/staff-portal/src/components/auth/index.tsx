import { NotFound } from "@workspace/ui/components/custom/not-found";
import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";



export function Auth({ path }: Readonly<{ path: string }>) {
    switch (path) {
        case "sign-in":
            return <SignIn />;
        case "sign-up":
            return <SignUp />;
        case "forgot-password":
            return <div>Forgot Password</div>;
        default:
            return <NotFound />;
    }
}