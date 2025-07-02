import { InterviewProvider } from "./context/InterviewContext";
import "./globals.css";
import { ReactNode } from "react";
// import { InterviewProvider } from "@/context/InterviewContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <InterviewProvider>{children}</InterviewProvider>
      </body>
    </html>
  );
}
