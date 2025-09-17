"use client"

import Content from "@/components/content";
import { useProfile, useUpdateProfile } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Loading } from "@workspace/ui/components/custom/loading";
import { FailedFetch } from "@workspace/ui/components/custom/failed-fetch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { EyeIcon, EyeOffIcon, Upload } from "lucide-react";
import { UpdateProfileSchema, UpdateProfileInput } from "@workspace/validation/user";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";

// Password field component to avoid hook issues
const PasswordField = ({ control, name, label }: { control: any, name: string, label: string }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <div className='relative'>
                            <Input 
                                type={isVisible ? 'text' : 'password'} 
                                placeholder='Password' 
                                className='pe-9' 
                                {...field} 
                            />
                            <Button
                                variant='ghost'
                                size='icon'
                                type="button"
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
            )}
        />
    );
};



export default function ProfilePage() {
    const { data, isLoading, error, refetch } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<UpdateProfileInput>({
        defaultValues: {
            phoneNumber: "",
            password: "",
            confirmPassword: "",
        },
        resolver: zodResolver(UpdateProfileSchema),
    });

    useEffect(() => {
        if (data) {
            form.reset({
                phoneNumber: data.data?.user?.phone || "",
                password: "",
                confirmPassword: "",
            });
        }
    }, [data, form]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = (formData: UpdateProfileInput) => {
        const updateData = {
            ...formData,
            profileImage: selectedFile || undefined,
        };
        
        updateProfileMutation.mutate(updateData, {
            onSuccess: () => {
                // Clear the preview and selected file after successful update
                setSelectedFile(null);
                setPreviewUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        });
    };

    // Cleanup preview URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);
    if (isLoading) {
        return <Content><Loading /></Content>;
    }
    if (error) {
        return <Content><FailedFetch message={error.message} retry={() => { refetch() }} /></Content>;
    }

    const currentImageUrl = previewUrl || data?.data?.user?.image_url;
    const userInitials = data?.data?.user?.fullName ? 
        data.data.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

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
                                            <AvatarImage src={currentImageUrl || undefined} />
                                            <AvatarFallback>{userInitials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <Button 
                                                size="sm" 
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload />
                                                Upload image
                                            </Button>
                                            {(selectedFile || currentImageUrl) && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Read-only fields */}
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Full name</div>
                                            <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                                {data?.data?.user?.fullName || 'Not provided'}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Email</div>
                                            <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                                {data?.data?.user?.email || 'Not provided'}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Position</div>
                                            <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                                {data?.data?.user?.position || 'Not provided'}
                                            </div>
                                        </div>
                                    </div>

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
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <PasswordField
                                    control={form.control}
                                    name="password"
                                    label="New Password"
                                />
                                <PasswordField
                                    control={form.control}
                                    name="confirmPassword"
                                    label="Confirm Password"
                                />

                                <div className="flex justify-end">
                                    <Button 
                                        type="submit" 
                                        disabled={updateProfileMutation.isPending}
                                    >
                                        {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>
        </Content>
    );
}