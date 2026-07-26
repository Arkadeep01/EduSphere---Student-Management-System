import { type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { FuturisticNetworkBg } from "./FuturisticNetworkBg";
import globeImage from "@/assets/globe.png";

interface FuturisticLoginLayoutProps {
  children: ReactNode;
  heading: string;
  subtitle: string;
  pageTitle: string;
}

export function FuturisticLoginLayout({ children, heading, subtitle, pageTitle }: FuturisticLoginLayoutProps) {
  return (
    <div className="login-page relative min-h-screen overflow-hidden bg-background">
      <FuturisticNetworkBg />

      <div className="absolute top-0 left-0 z-30 p-6 sm:p-8">
        <Logo />
      </div>

      <div className="absolute top-0 left-0 right-0 z-30 pt-16 sm:pt-20 text-center pointer-events-none select-none">
        <h2 className="text-2xl sm:text-3xl font-bold text-gradient-brand inline-block">
          {pageTitle}
        </h2>
        <div className="flex items-center justify-center mt-2">
          <span className="block w-16 h-0.5 rounded-full bg-gradient-brand opacity-70"></span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6 sm:p-10 pt-28 sm:pt-32">
        <div className="relative flex w-full max-w-6xl items-center justify-start">
          <div className="hidden md:block absolute right-[-3%] md:right-[-4%] lg:right-[-5%] xl:right-[-6%] top-1/2 -translate-y-1/2 w-[55%] md:w-[60%] lg:w-[68%] xl:w-[78%] max-w-[600px] md:max-w-[700px] lg:max-w-[780px] xl:max-w-[850px] z-0 pointer-events-none select-none">            <img
              src={globeImage}
              alt=""
              className="w-full h-auto max-h-[85vh] object-contain"
              draggable={false}
            />
          </div>

          <div className="relative z-10 w-full max-w-md mx-auto lg:mx-0 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl opacity-30 blur-xl bg-gradient-brand" aria-hidden="true" />

              <div className="relative rounded-xl bg-surface-glass border border-glass shadow-elegant p-8">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

                <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>

                <div className="mt-6">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}