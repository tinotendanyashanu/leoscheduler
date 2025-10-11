import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsHydrator } from "@/components/settings-hydrator";
import { GlobalToaster } from "@/components/global-toaster";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SettingsHydrator />
          <GlobalToaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
