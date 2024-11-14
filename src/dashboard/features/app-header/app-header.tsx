import { LayoutDashboard, Menu, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { MainNavItem } from "./main-nav-item";
import { ThemeToggle } from "./theme-toggle";
import { getFeatures } from "@/utils/helpers";

const CompanyLogo = () => {
  return (
    <MainNavItem path="/">
      <Image
        src="/copilot.png"
        width={32}
        height={32}
        alt="GitHub Copilot Dashboard"
      />
    </MainNavItem>

  );
};

const MenuItems = () => {
  const features = getFeatures();

  return (
    <>
      <MainNavItem path="/">
        <LayoutDashboard size={18} strokeWidth={1.4} />
        Dashboard
      </MainNavItem>
      {features.seats && (
        <MainNavItem path="/seats">
          <Users size={18} strokeWidth={1.4} />
          Seats
        </MainNavItem>
      )}
    </>
  );
};

export const AppHeader = () => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between sm:justify-normal">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 flex-1">
        <CompanyLogo />
        <MenuItems />
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <CompanyLogo />
            <MenuItems />
          </nav>
        </SheetContent>
      </Sheet>
      <nav className="md:hidden">
        <CompanyLogo />
      </nav>
      <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
};
