import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from '../components/providers/NextAuthProvider';
import RootProviders from '../components/providers/RootProviders';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DreamBook",
  description: "Discover your next great read at BookStore. Premium e-commerce platform for book lovers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50/50">
        <NextAuthProvider>
          <RootProviders>
            {children}
          </RootProviders>
        </NextAuthProvider>
      </body>
    </html>
  );
}
