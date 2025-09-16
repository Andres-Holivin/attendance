
import * as Icons from "lucide-react";

export default function LucideIcon({ name,className, ...props }: Readonly<{ name: string ,className?: string}>) {
  // Icons is a dictionary: { Home: <HomeIcon />, User: <UserIcon /> ... }
  // @ts-ignore
  const Icon: React.FC<React.SVGProps<SVGSVGElement>> = Icons[name] || Icons["Circle"];
  return <Icon className={className} {...props} />;
}