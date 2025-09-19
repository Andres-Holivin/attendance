"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { User } from "@/types/user.type"

export function createStaffColumns(
    onEdit: (staff: User) => void, 
    onDelete: (staff: User) => void,
    onViewAttendance: (staff: User) => void
): ColumnDef<User>[] {
    return [
        {
            accessorKey: "image_url",
            header: "Photo",
            cell: ({ row }) => {
                const imageUrl = row.original.image_url
                const fullName = row.original.fullName
                const initials = fullName
                    ?.split(" ")
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "??"

                return (
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={imageUrl ?? ""} alt={fullName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                )
            },
        },
        {
            accessorKey: "fullName",
            header: "Name",
            cell: ({ row }) => {
                const fullName = row.original.fullName 
                const email = row.original.email
                return (
                    <div className="space-y-1">
                        <div className="font-medium">{fullName}</div>
                        <div className="text-sm text-muted-foreground">{email}</div>
                    </div>
                )
            },
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => {
                const email = row.original.email
                return <div className="hidden">{email}</div> // Hidden since it's shown in name column
            },
        },
        {
            accessorKey: "position",
            header: "Position",
            cell: ({ row }) => {
                const position = row.original.position
                return position ? (
                    <span className="text-sm">{position}</span>
                ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                )
            },
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => {
                const phone = row.original.phone
                return phone ? (
                    <span className="text-sm">{phone}</span>
                ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                )
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.original.role
                return role ? (
                    <Badge variant="outline">{role}</Badge>
                ) : null
            },
        },
        {
            accessorKey: "createdAt",
            header: "Joined",
            cell: ({ row }) => {
                const dateStr = row.original.createdAt
                if (!dateStr) return <span className="text-sm text-muted-foreground">-</span>

                const date = new Date(dateStr)
                return (
                    <span className="text-sm text-muted-foreground">
                        {date.toLocaleDateString()}
                    </span>
                )
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const staff = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewAttendance(staff)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Attendance
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(staff)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit staff
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(staff)}
                                className="text-destructive-foreground"
                            >
                                <Trash2 className="mr-2 h-4 w-4 text-destructive-foreground" />
                                Delete staff
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}