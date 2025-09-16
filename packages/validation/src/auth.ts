import { z } from "zod";

export const SignUpSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
export type SignUpInput = z.infer<typeof SignUpSchema>;
export const SignInSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(2, "Password must be at least 2 characters long"),
});
export type SignInInput = z.infer<typeof SignInSchema>;

