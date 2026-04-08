import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function PoliciesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground ml-2">Términos y Condiciones</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Terms of Service */}
        <Text className="text-foreground font-bold text-xl mb-4">
          Términos de Servicio
        </Text>
        <Text className="text-muted-foreground text-sm leading-6 mb-2">
          Última actualización: Abril 2026
        </Text>

        <Section title="1. Aceptación de los Términos">
          Al acceder y utilizar la aplicación Azafaran ("la Aplicación"), aceptas
          cumplir con estos Términos de Servicio. Si no estás de acuerdo con estos
          términos, no debes usar la Aplicación.
        </Section>

        <Section title="2. Descripción del Servicio">
          Azafaran es una plataforma de comercio electrónico que permite a los
          usuarios comprar carne halal certificada y productos relacionados con
          entrega a domicilio en la zona metropolitana de Barcelona. Todos nuestros
          productos cuentan con certificación halal oficial.
        </Section>

        <Section title="3. Registro y Cuenta">
          Para realizar pedidos, debes crear una cuenta proporcionando información
          veraz y actualizada. Eres responsable de mantener la confidencialidad de
          tus credenciales de acceso. Debes tener al menos 18 años para usar el
          servicio.
        </Section>

        <Section title="4. Pedidos y Entregas">
          Los pedidos realizados a través de la Aplicación están sujetos a
          disponibilidad. Los tiempos de entrega estimados son de 48 a 72 horas
          desde la confirmación del pedido. Nos reservamos el derecho de cancelar
          pedidos en caso de falta de stock o errores en el precio.
        </Section>

        <Section title="5. Precios y Pagos">
          Los precios mostrados incluyen IVA. El pago se realiza mediante los métodos
          habilitados en la Aplicación (tarjeta de crédito/débito). Los gastos de
          envío se calculan según el importe total del pedido, siendo gratuitos para
          pedidos superiores a 30€.
        </Section>

        <Section title="6. Devoluciones y Cancelaciones">
          Debido a la naturaleza perecedera de nuestros productos, las devoluciones
          solo se aceptan en caso de productos defectuosos o errores en el pedido.
          Puedes cancelar un pedido en estado "pendiente" antes de que sea preparado.
          Contacta con nuestro servicio de atención al cliente para gestionar
          devoluciones o reclamaciones.
        </Section>

        <Section title="7. Uso Aceptable">
          Te comprometes a utilizar la Aplicación de forma lícita y respetuosa. Queda
          prohibido el uso de la Aplicación para fines fraudulentos, la
          manipulación de precios o promociones, y cualquier actividad que pueda
          dañar el servicio o a otros usuarios.
        </Section>

        <View className="h-px bg-border my-6" />

        {/* Privacy Policy */}
        <Text className="text-foreground font-bold text-xl mb-4">
          Política de Privacidad
        </Text>

        <Section title="1. Datos que Recopilamos">
          Recopilamos la información que proporcionas al crear tu cuenta: nombre,
          apellidos, correo electrónico, teléfono, dirección de entrega, fecha de
          nacimiento y género. También recopilamos información sobre tus pedidos y
          preferencias de uso.
        </Section>

        <Section title="2. Uso de los Datos">
          Utilizamos tus datos personales para:{"\n"}
          • Procesar y entregar tus pedidos{"\n"}
          • Gestionar tu cuenta y proporcionar soporte{"\n"}
          • Enviarte notificaciones sobre el estado de tus pedidos{"\n"}
          • Mejorar nuestro servicio y personalizar tu experiencia{"\n"}
          • Enviarte comunicaciones comerciales (solo si has dado tu consentimiento)
        </Section>

        <Section title="3. Protección de Datos">
          Implementamos medidas técnicas y organizativas para proteger tus datos
          personales. Utilizamos cifrado SSL/TLS para todas las comunicaciones y
          almacenamos los datos de pago de forma segura a través de proveedores
          certificados PCI-DSS (Stripe).
        </Section>

        <Section title="4. Compartir Datos">
          No vendemos tus datos personales a terceros. Solo compartimos información
          con:{"\n"}
          • Servicios de entrega para completar tus pedidos{"\n"}
          • Procesadores de pago (Stripe) para gestionar transacciones{"\n"}
          • Autoridades legales cuando sea requerido por ley
        </Section>

        <Section title="5. Tus Derechos">
          Tienes derecho a acceder, rectificar, eliminar y portar tus datos
          personales. También puedes oponerte al tratamiento de tus datos o solicitar
          la limitación del mismo. Para ejercer estos derechos, contacta con nosotros
          a través de la Aplicación o por correo electrónico.
        </Section>

        <Section title="6. Cookies y Análisis">
          La Aplicación utiliza almacenamiento local para mantener tu sesión activa y
          mejorar tu experiencia. No utilizamos cookies de terceros con fines
          publicitarios.
        </Section>

        <Section title="7. Contacto">
          Para cualquier consulta sobre estos términos o nuestra política de
          privacidad, puedes contactarnos en:{"\n\n"}
          Azafaran — Carne Halal a Domicilio{"\n"}
          Barcelona, España{"\n"}
          soporte@azafaran.app
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View className="mb-5">
      <Text className="text-foreground font-semibold text-base mb-2">{title}</Text>
      <Text className="text-muted-foreground text-sm leading-6">{children}</Text>
    </View>
  );
}
