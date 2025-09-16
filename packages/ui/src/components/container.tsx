export default function Container({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="px-8 py-4">
            {children}
        </div>
    )
}