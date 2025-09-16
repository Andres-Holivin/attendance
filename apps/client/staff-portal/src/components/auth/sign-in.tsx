"use client";

import { useLogin } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Spinner } from "@workspace/ui/components/spinner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SignInInput, SignInSchema } from "@workspace/validation/auth";

export function SignIn() {
    const loginMutation = useLogin();
    const form = useForm<SignInInput>({
        defaultValues: {
            email: "",
            password: "",
        },
        resolver: zodResolver(SignInSchema),
    });
    const onSubmit = (data: SignInInput) => {
        loginMutation.mutateAsync({
            email: data.email,
            password: data.password,
        });
    };
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <Card className="z-10">
                        <CardHeader>
                            <CardTitle>Login to your account</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-6">
                                <Form {...form}>
                                    <form
                                        className="w-full space-y-4"
                                        onSubmit={form.handleSubmit(onSubmit)}
                                    >
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }: { field: any }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="email"
                                                                placeholder="Email"
                                                                className="w-full"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }: { field: any }) => (
                                                    <FormItem>
                                                        <FormLabel>Password</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="password"
                                                                placeholder="Password"
                                                                className="w-full"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        <Button type="submit" className="mt-4 w-full" disabled={loginMutation.isPending}>
                                            {loginMutation.isPending ? <Spinner/> : null}
                                            Continue with Email
                                        </Button>
                                    </form>
                                </Form>
                                <div className="mt-4 text-center text-sm">
                                    Don&apos;t have an account?{" "}
                                    <a href="/auth/sign-up" className="underline underline-offset-4" >
                                        Register
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
