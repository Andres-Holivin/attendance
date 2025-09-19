"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Upload, X } from "lucide-react"
import { User } from "@/types/user.type"
import { CreateStaffData, UpdateStaffData } from "@/services/staff.service"

// Validation schemas
const createStaffSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    position: z.string().optional(),
    phoneNumber: z.string().optional(),
})

const updateStaffSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
    position: z.string().optional(),
    phoneNumber: z.string().optional(),
})

type CreateStaffFormData = z.infer<typeof createStaffSchema>
type UpdateStaffFormData = z.infer<typeof updateStaffSchema>

interface StaffModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CreateStaffData | UpdateStaffData) => void
    loading?: boolean
    staff?: User
    isEditing?: boolean
}

export function StaffModal({
    open,
    onOpenChange,
    onSubmit,
    loading = false,
    staff,
    isEditing = false,
}: StaffModalProps) {
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>("")

    const schema = isEditing ? updateStaffSchema : createStaffSchema
    const form = useForm<CreateStaffFormData | UpdateStaffFormData>({
        resolver: zodResolver(schema),
        defaultValues: isEditing
            ? {
                  fullName: staff?.fullName || "",
                  position: staff?.position || "",
                  phoneNumber: staff?.phone || "",
              }
            : {
                  email: "",
                  fullName: "",
                  password: "",
                  position: "",
                  phoneNumber: "",
              },
    })

    // Reset form when modal opens/closes or staff changes
    React.useEffect(() => {
        if (open) {
            if (isEditing && staff) {
                form.reset({
                    fullName: staff.fullName || "",
                    position: staff.position || "",
                    phoneNumber: staff.phone || "",
                })
                setImagePreview(staff.image_url || "")
            } else {
                form.reset({
                    email: "",
                    fullName: "",
                    password: "",
                    position: "",
                    phoneNumber: "",
                })
                setImagePreview("")
            }
            setProfileImage(null)
        }
    }, [open, isEditing, staff, form])

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setProfileImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setProfileImage(null)
        setImagePreview(isEditing && staff?.image_url ? staff.image_url : "")
    }

    const handleSubmit = (data: CreateStaffFormData | UpdateStaffFormData) => {
        const submitData = {
            ...data,
            ...(profileImage && { profileImage }),
        }
        onSubmit(submitData)
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Staff Member" : "Add New Staff Member"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the staff member information below."
                            : "Fill in the details to add a new staff member."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        {/* Profile Image */}
                        <div className="space-y-2">
                            <FormLabel>Profile Photo</FormLabel>
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={imagePreview} />
                                    <AvatarFallback>
                                        {isEditing && staff
                                            ? getInitials(staff.fullName)
                                            : getInitials(form.watch("fullName") || "Staff")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-2">
                                    <div className="flex space-x-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => document.getElementById("image-input")?.click()}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload
                                        </Button>
                                        {imagePreview && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={removeImage}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    <input
                                        id="image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email - only for creating */}
                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="john@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Full Name */}
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password - only for creating */}
                        {!isEditing && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Position */}
                        <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Position</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Software Engineer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Phone Number */}
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1 234 567 8900" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : isEditing ? "Update Staff" : "Create Staff"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

interface DeleteStaffModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    loading?: boolean
    staff?: User
}

export function DeleteStaffModal({
    open,
    onOpenChange,
    onConfirm,
    loading = false,
    staff,
}: DeleteStaffModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Staff Member</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{staff?.fullName}</span>? This action
                        cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}