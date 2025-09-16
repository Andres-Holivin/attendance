"use client"

import Content from "@/components/content";
import { useProfile } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Loading } from "@workspace/ui/components/custom/loading";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@workspace/ui/components/select";
import { EyeIcon, EyeOffIcon, MailIcon, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FailedFetch } from "@workspace/ui/components/custom/failed-fetch";
import { useEffect, useState } from "react";
import { UpdateProfileInput, UpdateProfileSchema } from "@workspace/validation/user";



export default function ProfilePage() {
    const { data, isLoading, error, refetch } = useProfile();

    const form = useForm<UpdateProfileInput>({
        defaultValues: {
            fullname: "",
            email: "",
            phoneNumber: "",
            position: "",
            password: "",
            confirmPassword: "",
        },
        resolver: zodResolver(UpdateProfileSchema),
    });
    useEffect(() => {
        if (data) {
            form.reset({
                fullname: data?.data?.user?.fullName || "",
                email: data.data?.user?.email || "",
                phoneNumber: data.data?.user?.phone || "",
                position: data.data?.user?.position || "",
                password: "",
                confirmPassword: "",
            });
        }
    }, [data, form]);

    const onSubmit = (data: UpdateProfileInput) => {
        console.log(data);
    };
    if (isLoading) {
        return <Content><Loading /></Content>;
    }
    if (error) {
        return <Content><FailedFetch message={error.message} retry={() => { refetch() }} /></Content>;
    }
    return (
        <Content>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-balance">Personal information</h1>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src="https://bundui-images.netlify.app/avatars/10.png" />
                                            <AvatarFallback>AG</AvatarFallback>
                                        </Avatar>
                                        <div className="flex gap-2">
                                            <Button size="sm" type="button">
                                                <Upload />
                                                Upload image
                                            </Button>
                                            <Button variant="outline" size="sm" type="button">
                                                Remove
                                            </Button>
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="fullname"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="position"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Position</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select your position" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                                                        <SelectItem value="Product Manager">Product Manager</SelectItem>
                                                        <SelectItem value="Designer">Designer</SelectItem>
                                                        <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                                                        <SelectItem value="HR">HR</SelectItem>
                                                        <SelectItem value="Sales">Sales</SelectItem>
                                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => {
                                        const [isVisible, setIsVisible] = useState(false)
                                        return (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <div className='relative'>
                                                        <Input type={isVisible ? 'text' : 'password'} placeholder='Password' className='pe-9' {...field} />
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            onClick={() => setIsVisible(prevState => !prevState)}
                                                            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 end-0 rounded-s-none hover:bg-transparent'
                                                        >
                                                            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                                                            <span className='sr-only'>{isVisible ? 'Hide password' : 'Show password'}</span>
                                                        </Button>
                                                    </div>

                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />
                                <FormField

                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => {
                                        const [isVisible, setIsVisible] = useState(false)
                                        return (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <div className='relative'>
                                                        <Input type={isVisible ? 'text' : 'password'} placeholder='Password' className='pe-9' {...field} />
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            onClick={() => setIsVisible(prevState => !prevState)}
                                                            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 end-0 rounded-s-none hover:bg-transparent'
                                                        >
                                                            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                                                            <span className='sr-only'>{isVisible ? 'Hide password' : 'Show password'}</span>
                                                        </Button>
                                                    </div>

                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />



                                <div className="flex justify-end">
                                    <Button type="submit">Save</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>
        </Content>
    );
}