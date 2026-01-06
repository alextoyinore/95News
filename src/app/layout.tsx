import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "95News - Your Daily Magazine",
  description: "Stay updated with the latest news and stories from around the world.",
};

import { ThemeProvider } from "@/components/ThemeProvider";

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
