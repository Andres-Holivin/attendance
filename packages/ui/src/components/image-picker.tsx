import Image from "next/image";
import { FormControl, FormDescription, FormLabel, FormMessage } from "./form";
import { Input } from "./input";
import { useState } from "react";
import { CameraIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@workspace/ui/lib/utils";

export default function ImagePicker({
    image,
    isEdit,
    onChange,
    className,
    ...props
}: Readonly<{ image?: string, isEdit?: boolean, onChange: (file: File) => void, className?: string } & React.ComponentProps<"input">>) {

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    return (
        <div className={cn(className)}>
            <div className="relative group w-full h-full">
                <Image
                    src={imagePreview || image || "https://github.com/shadcn.png"}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-lg transition-opacity"
                    fill
                />
                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full ">
                    <label htmlFor="fileInput" className="cursor-pointer flex items-center justify-center  w-full h-full">
                        <div className="flex flex-col items-center bg-black/40 p-2 rounded-lg group-hover:bg-black/0 transition-colors">
                            <CameraIcon />
                            <span className="text-sm">Upload</span>
                        </div>
                    </label>
                    <FormControl>
                        <Input
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            hidden={true}
                            disabled={isEdit === false}
                            {...props}
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    onChange(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setImagePreview(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </FormControl>
                </div>
            </div>
        </div>

    );
}