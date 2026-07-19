import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { InterviewProvider } from "./context/InterviewContext";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        <InterviewProvider>{children}</InterviewProvider>
      </body>
    </html>
  );
}
