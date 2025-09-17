import { z } from "zod";

export const UpdateProfileSchema = z.object({
    phoneNumber: z.string().min(5, "Phone number must be at least 5 characters").optional(),
    image_url: z.string().optional(),
    password: z.string().optional().refine((val = "") => val === "" || val.length >= 6, { message: "Password must be at least 6 characters or empty to keep current password" }),
    confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: "custom",
            path: ["confirmPassword"],
            message: "Passwords do not match",
        });
    }
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;