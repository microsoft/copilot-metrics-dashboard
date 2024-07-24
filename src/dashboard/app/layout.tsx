import { AppHeader } from "@/features/app-header/app-header";
import { ThemeProvider } from "@/features/common/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GitHub Copilot Metrics Dashboard",
  description: "GitHub Copilot Metrics Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className)}>
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen w-full flex-col bg-muted-foreground/5 ">
            <AppHeader />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
