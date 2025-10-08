import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsHydrator } from "@/components/settings-hydrator";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SettingsHydrator />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
