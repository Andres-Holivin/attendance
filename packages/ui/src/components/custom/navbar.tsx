"use client"
import { Bell, Menu } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "../navigation-menu";
import { Sheet, SheetContent, SheetFooter, SheetTitle, SheetTrigger } from "../sheet";
import { Button } from "../button";
import { ModeToggle } from "../dark-toggle";
import { Card } from "../card";
import { ReactNode } from "react";
export interface NavbarNavLink {
  href: string;
  label: string;
  active?: boolean;
}
export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  isAuthenticated?: boolean;
  logo: React.ReactNode;
  logoHref: string;
  navigationLinks?: NavbarNavLink[];

  notification?: ReactNode;

  signIn: ReactNode;
}

export const Navbar = (props: NavbarProps) => {
  return (
    <div className="px-6 pt-4 z-10">
      <Card className="px-4 py-2">
        <div className="flex items-center justify-between">
          <a
            href={props.logoHref}
            className="flex items-center  text-primary hover:text-primary/90 transition-colors cursor-pointer"
          >
            {props.logo}
          </a>
          {/* Desktop Menu */}
          {
            props.isAuthenticated ? (<NavMenu props={props} orientation="horizontal" className="hidden md:block" />) : null
          }

          <div className="flex items-center gap-3">
            <ModeToggle />
            {/* {props.notification} */}
            <div className="hidden md:block">
              {props.signIn}
            </div>
            {/* Mobile Menu */}
            <div className="md:hidden">
              <NavigationSheet {...props} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const NavMenu = ({ props, orientation, className }: { props: NavbarProps, orientation: 'horizontal' | 'vertical', className?: string }) => (
  <NavigationMenu className={className} orientation={orientation}>
    <NavigationMenuList className="gap-3 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
      {
        props.navigationLinks?.map((link) => (
          <NavigationMenuItem key={link.href}>
            <NavigationMenuLink asChild>
              <a href={link.href} className={`px-3 py-2 rounded-full ${link.active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>{link.label}</a>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))
      }
    </NavigationMenuList>
  </NavigationMenu>
);

const NavigationSheet = (props: NavbarProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="px-6 py-3 bg-card">
        <SheetTitle></SheetTitle>
        <a
          href={props.logoHref}
          className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
        >
          <div className="text-2xl">
            {props.logo}
          </div>
        </a>
        {props.isAuthenticated ? <NavMenu props={props} orientation="vertical" className="mt-6 [&>div]:h-full" /> : null}
        <SheetFooter>
          {props.signIn}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};