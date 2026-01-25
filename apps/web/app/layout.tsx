import "./globals.css";
import type { Metadata } from "next";
import OfflineAlert from "../components/pwa/OfflineAlert";
import InstallPrompt from "../components/pwa/InstallPrompt";

export const metadata: Metadata = {
  title: "UBM Dashboard",
  description: "Universal Booking Middleware dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body>
        <OfflineAlert />
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
