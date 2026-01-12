import type { Metadata } from "next";
import { inter } from "@/lib/fonts";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
    title: "HOPOS",
    description: "HOPOS",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(
                "h-screen bg-background font-sans antialiased flex overflow-hidden",
                inter.variable
            )}>
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
