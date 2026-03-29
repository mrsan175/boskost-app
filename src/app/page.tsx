import Navbar from "@/components/Navbar";
import Hero from "@/components/home/sections/Hero";
import Marquee from "@/components/home/sections/Marquee";
import Features from "@/components/home/sections/Features";
import StatsSection from "@/components/home/sections/StatsSection";
import Pricing from "@/components/home/sections/Pricing";
import FAQ from "@/components/home/sections/FAQ";
import CTABanner from "@/components/home/sections/CTABanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <StatsSection />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Footer />
    </main>
  );
}

