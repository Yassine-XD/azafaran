import { useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { Display, Heading2, Body, Small } from "@/components/ui/Text";
import { useLang } from "@/contexts/LanguageContext";

type Tab = "privacy" | "terms";

export default function PoliciesScreen() {
  const router = useRouter();
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("privacy");

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-5 py-3 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-muted">
          <ArrowLeft size={20} color="#0B0B0C" strokeWidth={2} />
        </Pressable>
        <Display>{tab === "privacy" ? t("rebuild.profile.privacy") : t("rebuild.profile.terms")}</Display>
      </View>

      {/* Tab switch */}
      <View className="px-5 pb-3 flex-row gap-2">
        <Chip label={t("rebuild.profile.privacy")} active={tab === "privacy"} onPress={() => setTab("privacy")} />
        <Chip label={t("rebuild.profile.terms")} active={tab === "terms"} onPress={() => setTab("terms")} />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-12">
        {tab === "privacy" ? <PrivacyContent /> : <TermsContent />}
        <Small className="mt-8 text-muted-foreground">
          Última actualización: mayo 2026 · Azafarán S.L. · CIF B12345678
        </Small>
      </ScrollView>
    </SafeAreaView>
  );
}

function PrivacyContent() {
  return (
    <View className="gap-4">
      <Section title="1. Quiénes somos">
        <Body>
          Azafarán S.L. es la responsable del tratamiento de tus datos. Nos
          comprometemos a cumplir el RGPD y la LOPDGDD en todo momento.
        </Body>
      </Section>
      <Section title="2. Qué datos recogemos">
        <Body>
          Email, nombre, apellido, teléfono, dirección de entrega, idioma
          preferido e historial de pedidos. Los datos de pago los procesa
          Stripe; nosotros nunca vemos tu número de tarjeta.
        </Body>
      </Section>
      <Section title="3. Para qué los usamos">
        <Body>
          Para procesar tus pedidos, enviarte notificaciones de envío,
          atender tu soporte y, si lo aceptas, enviarte ofertas. No
          vendemos ni cedemos tus datos a terceros con fines comerciales.
        </Body>
      </Section>
      <Section title="4. Tus derechos">
        <Body>
          Acceso, rectificación, supresión, oposición, limitación y
          portabilidad. Escríbenos a privacidad@azafaran.es para
          ejercerlos.
        </Body>
      </Section>
    </View>
  );
}

function TermsContent() {
  return (
    <View className="gap-4">
      <Section title="1. Aceptación">
        <Body>
          Al usar la app aceptas estos términos. Si no estás de acuerdo,
          no la uses.
        </Body>
      </Section>
      <Section title="2. Pedidos y entregas">
        <Body>
          Los pedidos se entregan en el horario de la franja seleccionada.
          Si no estás en casa intentaremos contactarte; tras dos intentos
          fallidos el pedido vuelve a tienda y se aplica un cargo de
          reentrega.
        </Body>
      </Section>
      <Section title="3. Pagos">
        <Body>
          Los pagos se procesan vía Stripe. Aceptamos tarjeta y Bizum. El
          cargo se realiza al confirmar el pedido.
        </Body>
      </Section>
      <Section title="4. Devoluciones">
        <Body>
          Por tratarse de productos perecederos, no admitimos
          devoluciones salvo defecto del producto. Contacta con soporte
          en menos de 24h tras la entrega.
        </Body>
      </Section>
      <Section title="5. Halal">
        <Body>
          Nuestra carne está certificada halal por la entidad indicada
          en cada producto. Garantizamos la trazabilidad completa.
        </Body>
      </Section>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="p-4 rounded-2xl bg-surface border border-border">
      <Heading2 className="mb-2">{title}</Heading2>
      {children}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 h-9 rounded-pill items-center justify-center border ${
        active ? "bg-primary border-primary" : "bg-card border-border"
      } active:opacity-80`}
    >
      <Small className={`font-body-semibold ${active ? "text-primary-foreground" : "text-foreground"}`}>
        {label}
      </Small>
    </Pressable>
  );
}
