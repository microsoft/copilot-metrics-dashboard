"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, PropsWithChildren } from "react";

interface MainNavItemProps extends PropsWithChildren {
  path: string;
}

export const MainNavItem: FC<MainNavItemProps> = (props) => {
  const activePath = usePathname();
  const { path, children } = props;
  return (
    <Link
      href={path}
      className={cn(
        "transition-colors hover:text-foreground flex justify-center gap-2 items-center",
        activePath.startsWith(path) && path !== "/"
          ? "text-foreground"
          : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
};
