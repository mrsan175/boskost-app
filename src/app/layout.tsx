import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ThemeSync } from "@/components/theme-sync";
import { AuthModalProvider } from "@/contexts/auth-modal-context";
import AuthModal from "@/components/auth-modal";
import NextTopLoader from "nextjs-toploader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

// Migrated away from ClerkProvider; using local auth

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Boskost",
  description: "Aplikasi Manajemen Kos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html
        lang="en"
        className={cn("h-full", "antialiased", manrope.variable, "font-sans")}
        suppressHydrationWarning
      >
        <head suppressHydrationWarning>
          {/* Inline FOUC-prevention: set data-theme before first paint */}
          <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('boskost-theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`,
            }}
          />
        </head>
        <body className="min-h-full flex flex-col">
          <TooltipProvider>
            <AuthModalProvider>
              <NextTopLoader
                color="#C2410C"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px #C2410C,0 0 5px #C2410C"
              />
              <ThemeSync />
              {children}
              <AuthModal />
              <Toaster
                position="top-center"
                richColors
                toastOptions={{
                  style: {
                    background: "var(--surface-container-lowest)",
                    color: "var(--on-surface)",
                    border: "1px solid var(--outline-variant)",
                    borderRadius: "1.25rem",
                    fontFamily: "var(--font-display)",
                  },
                }}
              />
              <ScrollToTop />
            </AuthModalProvider>
          </TooltipProvider>
        </body>
      </html>
    </>
  );
}
