import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "PNG Split",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-br" className={`${GeistSans.variable} dark antialiased`}>
      <body>
        <div className="flex min-h-screen flex-col justify-between p-8 sm:p-20">
          <main className="flex flex-grow flex-col items-center justify-center">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
