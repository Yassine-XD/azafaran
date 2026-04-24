import { Head } from "vite-react-ssg";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Container } from "../components/Container";
import { useLang } from "../i18n";
import { SITE } from "../seo/constants";

const COPY = {
  es: {
    title: "Privacidad — Azafaran",
    h1: "Política de privacidad",
    intro:
      "En Azafaran tratamos tus datos personales con responsabilidad y conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 de Protección de Datos.",
    sections: [
      {
        h: "Responsable del tratamiento",
        p: `Azafaran, ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.locality}, ${SITE.address.region}. Contacto: ${SITE.email}.`,
      },
      {
        h: "Datos que recogemos",
        p: "Datos de cuenta (nombre, email, teléfono, dirección de entrega), historial de pedidos y datos técnicos del dispositivo cuando usas la app.",
      },
      {
        h: "Finalidades",
        p: "Procesar tus pedidos, gestionar la entrega, prestar soporte, enviar notificaciones operativas y mejorar el servicio.",
      },
      {
        h: "Pagos",
        p: "Los pagos se procesan a través de Stripe. Azafaran no almacena los datos completos de tarjeta.",
      },
      {
        h: "Tus derechos",
        p: `Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, portabilidad y limitación escribiendo a ${SITE.email}.`,
      },
      {
        h: "Cookies",
        p: "Esta web utiliza únicamente cookies técnicas necesarias para su funcionamiento básico.",
      },
    ],
  },
  ca: {
    title: "Privacitat — Azafaran",
    h1: "Política de privacitat",
    intro:
      "A Azafaran tractem les teves dades personals amb responsabilitat i conforme al Reglament (UE) 2016/679 (RGPD) i la Llei Orgànica 3/2018 de Protecció de Dades.",
    sections: [
      {
        h: "Responsable del tractament",
        p: `Azafaran, ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.locality}, ${SITE.address.region}. Contacte: ${SITE.email}.`,
      },
      {
        h: "Dades que recollim",
        p: "Dades de compte (nom, correu, telèfon, adreça de lliurament), historial de comandes i dades tècniques del dispositiu quan fas servir l'app.",
      },
      {
        h: "Finalitats",
        p: "Processar les teves comandes, gestionar el lliurament, donar suport, enviar notificacions operatives i millorar el servei.",
      },
      {
        h: "Pagaments",
        p: "Els pagaments es processen mitjançant Stripe. Azafaran no desa les dades completes de la targeta.",
      },
      {
        h: "Els teus drets",
        p: `Pots exercir els drets d'accés, rectificació, supressió, oposició, portabilitat i limitació escrivint a ${SITE.email}.`,
      },
      {
        h: "Galetes",
        p: "Aquest web utilitza només galetes tècniques necessàries per al seu funcionament bàsic.",
      },
    ],
  },
  en: {
    title: "Privacy — Azafaran",
    h1: "Privacy policy",
    intro:
      "At Azafaran we process your personal data responsibly and in accordance with the EU General Data Protection Regulation (GDPR) and Spain's Organic Law 3/2018.",
    sections: [
      {
        h: "Data controller",
        p: `Azafaran, ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.locality}, ${SITE.address.region}. Contact: ${SITE.email}.`,
      },
      {
        h: "Data we collect",
        p: "Account data (name, email, phone, delivery address), order history and technical device data when you use the app.",
      },
      {
        h: "Purposes",
        p: "Process your orders, manage delivery, provide support, send operational notifications and improve the service.",
      },
      {
        h: "Payments",
        p: "Payments are processed by Stripe. Azafaran does not store full card details.",
      },
      {
        h: "Your rights",
        p: `You can exercise your access, rectification, deletion, objection, portability and restriction rights by writing to ${SITE.email}.`,
      },
      {
        h: "Cookies",
        p: "This website uses only technical cookies necessary for basic functionality.",
      },
    ],
  },
} as const;

export default function PrivacyPage() {
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
          <div id="cookies" className="mt-10 space-y-8">
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
