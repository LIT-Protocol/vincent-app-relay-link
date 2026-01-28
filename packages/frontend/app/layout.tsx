import type { Metadata } from "next";
import "./globals.css";
import { PrivyProviderWrapper } from "@/components/PrivyProviderWrapper";

export const metadata: Metadata = {
  title: "Vincent App",
  description: "Vincent App Relay Link",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PrivyProviderWrapper>{children}</PrivyProviderWrapper>
      </body>
    </html>
  );
}
