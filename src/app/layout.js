import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "EcoTrack AI — AI-Powered Carbon Footprint Tracker",
  description: "Track, calculate, and reduce your carbon footprint with personalized AI coaching and interactive daily eco-challenges.",
  keywords: ["carbon footprint", "sustainability", "climate change", "AI recommendations", "carbon calculator", "eco challenge", "green living"],
  authors: [{ name: "EcoTrack AI Team" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans relative antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        <AuthProvider>
          <ErrorBoundary>
            <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
              <div className="absolute top-[-8%] left-[-5%] w-[55%] h-[55%] rounded-full bg-emerald-500/4 blur-[150px]" />
              <div className="absolute top-[40%] right-[-8%] w-[45%] h-[45%] rounded-full bg-cyan-500/4 blur-[150px]" />
              <div className="absolute bottom-[-5%] left-[20%] w-[40%] h-[35%] rounded-full bg-emerald-500/3 blur-[120px]" />
              <div className="absolute top-[20%] left-[40%] w-[25%] h-[25%] rounded-full bg-lime-500/2 blur-[100px]" />
            </div>
            <Navbar />
            <main className="flex-grow flex flex-col w-full">{children}</main>
            <Footer />
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
