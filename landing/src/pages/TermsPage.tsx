import { Head } from "vite-react-ssg";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Container } from "../components/Container";
import { useLang } from "../i18n";
import { SITE } from "../seo/constants";

const COPY = {
  es: {
    title: "Términos — Azafaran",
    h1: "Términos y condiciones",
    intro:
      "Estos términos regulan el uso de la aplicación móvil Azafaran y los servicios de venta y entrega de carne halal asociados.",
    sections: [
      {
        h: "Pedidos y entregas",
        p: "Los pedidos se realizan a través de la app y se entregan en la zona de cobertura indicada. El envío es gratuito a partir de 30 € de pedido.",
      },
      {
        h: "Precios",
        p: "Los precios incluyen IVA. Azafaran se reserva el derecho de modificar precios y disponibilidad sin previo aviso.",
      },
      {
        h: "Devoluciones",
        p: `Si un producto no cumple las condiciones esperadas, contacta con ${SITE.email} en las 24 h siguientes a la entrega para tramitar el reemplazo o reembolso.`,
      },
      {
        h: "Responsabilidad",
        p: "Azafaran no se hace responsable de retrasos derivados de causas de fuerza mayor o ajenas a su control.",
      },
      {
        h: "Legislación aplicable",
        p: "Estos términos se rigen por la legislación española. Cualquier controversia se someterá a los juzgados de Barcelona.",
      },
    ],
  },
  ca: {
    title: "Termes — Azafaran",
    h1: "Termes i condicions",
    intro:
      "Aquests termes regulen l'ús de l'aplicació mòbil Azafaran i els serveis de venda i lliurament de carn halal associats.",
    sections: [
      {
        h: "Comandes i lliuraments",
        p: "Les comandes es fan a través de l'app i es lliuren a la zona de cobertura indicada. L'enviament és gratuït a partir de 30 € de comanda.",
      },
      {
        h: "Preus",
        p: "Els preus inclouen IVA. Azafaran es reserva el dret de modificar preus i disponibilitat sense avís previ.",
      },
      {
        h: "Devolucions",
        p: `Si un producte no compleix les condicions esperades, contacta amb ${SITE.email} en les 24 h següents al lliurament per gestionar el reemplaçament o reemborsament.`,
      },
      {
        h: "Responsabilitat",
        p: "Azafaran no es fa responsable de retards derivats de causes de força major o alienes al seu control.",
      },
      {
        h: "Legislació aplicable",
        p: "Aquests termes es regeixen per la legislació espanyola. Qualsevol controvèrsia se sotmetrà als jutjats de Barcelona.",
      },
    ],
  },
  en: {
    title: "Terms — Azafaran",
    h1: "Terms and conditions",
    intro:
      "These terms govern the use of the Azafaran mobile application and the associated halal meat sale and delivery services.",
    sections: [
      {
        h: "Orders and delivery",
        p: "Orders are placed through the app and delivered within the indicated coverage area. Shipping is free on orders over €30.",
      },
      {
        h: "Prices",
        p: "Prices include VAT. Azafaran may modify prices and availability at any time.",
      },
      {
        h: "Returns",
        p: `If a product does not meet the expected condition, email ${SITE.email} within 24 h of delivery to arrange a replacement or refund.`,
      },
      {
        h: "Liability",
        p: "Azafaran is not liable for delays caused by force majeure or other circumstances outside its control.",
      },
      {
        h: "Governing law",
        p: "These terms are governed by Spanish law. Any dispute will be submitted to the courts of Barcelona.",
      },
    ],
  },
} as const;

export default function TermsPage() {
  const lang = useLang();
  const c = COPY[lang];
  return (
    <>
      <Head>
        <html lang={lang} />
        <title>{c.title}</title>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <Header />
      <main className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {c.h1}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {c.intro}
          </p>
          <div className="mt-10 space-y-8">
            {c.sections.map((s) => (
              <section key={s.h}>
                <h2 className="text-xl font-semibold text-foreground">{s.h}</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {s.p}
                </p>
              </section>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
