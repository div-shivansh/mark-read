import { FileProvider } from "./context/FileContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Bounce, ToastContainer } from 'react-toastify';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mark&Read - AI Powered PDF Highlighter",
  description: "Highlight and annotate PDFs with AI-generated insights. Upload your PDF, and let our AI analyze the content to provide smart highlights and annotations. And if you want to customize the highlights, you can do that too! Just click on any highlight to change its color, shape, or even add your own notes. Perfect for students, professionals, and anyone who wants to get more out of their PDFs.",

  verification: {
    google: 'google7eb1583d8ad00465.html',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behaviour="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > <FileProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />
        </FileProvider>
      </body>
    </html>
  );
}
