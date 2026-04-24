import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Seo, JsonLd } from "../seo/Seo";
import { Hero } from "../sections/Hero";
import { TrustStrip } from "../sections/TrustStrip";
import { Features } from "../sections/Features";
import { HowItWorks } from "../sections/HowItWorks";
import { Categories } from "../sections/Categories";
import { Coverage } from "../sections/Coverage";
import { Testimonials } from "../sections/Testimonials";
import { DownloadCta } from "../sections/DownloadCta";
import { Faq } from "../sections/Faq";
import { FinalCta } from "../sections/FinalCta";

export default function LandingPage() {
  return (
    <>
      <Seo />
      <JsonLd />
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <Features />
        <HowItWorks />
        <Categories />
        <Coverage />
        <Testimonials />
        <DownloadCta />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
