import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { InterviewProvider } from "./context/InterviewContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";
import { ReactNode } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "MyInterview | AI Mock Interview Practice",
  description:
    "Upload your resume and practice job interviews with an AI coach that adapts to your background.",
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("myinterview-theme");
    var theme = stored === "dark" || stored === "light"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <InterviewProvider>{children}</InterviewProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
