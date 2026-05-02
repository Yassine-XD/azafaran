import { ScrollView, View, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Globe, Bell, FileText, LogOut, User as UserIcon, ShieldCheck } from "lucide-react-native";

import { Display, Heading3, Body, Small, Caption } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import type { Lang } from "@/lib/i18n";

const LANG_LABEL: Record<Lang, string> = { es: "Español", ca: "Català", en: "English" };

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, t } = useLang();

  const onLogout = () => {
    Alert.alert("Cerrar sesión", "¿Quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-12">
        <View className="px-5 pt-4 pb-6">
          <Display>{t("tabs.profile")}</Display>
        </View>

        {isAuthenticated && user ? (
          <View className="px-5">
            <View className="flex-row items-center gap-3 p-4 rounded-2xl bg-surface border border-border">
              <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                <UserIcon size={20} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Heading3>
                  {user.first_name} {user.last_name}
                </Heading3>
                <Small className="text-muted-foreground">{user.email}</Small>
              </View>
            </View>
          </View>
        ) : (
          <View className="px-5">
            <View className="p-5 rounded-2xl bg-surface border border-border">
              <Heading3>Inicia sesión</Heading3>
              <Small className="mt-1 text-muted-foreground">
                Para guardar tu carrito, hacer pedidos y recibir ofertas.
              </Small>
              <View className="flex-row gap-2 mt-4">
                <Button
                  title="Iniciar sesión"
                  variant="primary"
                  size="md"
                  onPress={() => router.push("/login")}
                />
                <Button
                  title="Crear cuenta"
                  variant="secondary"
                  size="md"
                  onPress={() => router.push("/register")}
                />
              </View>
            </View>
          </View>
        )}

        {/* Settings rows */}
        <View className="mt-6 px-5">
          <Caption className="uppercase tracking-wide text-muted-foreground mb-2 px-1">
            Preferencias
          </Caption>
          <View className="rounded-2xl bg-card border border-border overflow-hidden">
            <Row
              icon={<Globe size={18} color="#0B0B0C" strokeWidth={1.8} />}
              title="Idioma"
              value={LANG_LABEL[lang]}
              onPress={() => router.push("/language-select")}
            />
            <Divider />
            <Row
              icon={<Bell size={18} color="#0B0B0C" strokeWidth={1.8} />}
              title="Notificaciones"
              onPress={() => router.push("/notification-preferences" as any)}
            />
          </View>
        </View>

        <View className="mt-6 px-5">
          <Caption className="uppercase tracking-wide text-muted-foreground mb-2 px-1">
            Información
          </Caption>
          <View className="rounded-2xl bg-card border border-border overflow-hidden">
            <Row
              icon={<ShieldCheck size={18} color="#0B0B0C" strokeWidth={1.8} />}
              title="Política de privacidad"
              onPress={() => router.push("/policies" as any)}
            />
            <Divider />
            <Row
              icon={<FileText size={18} color="#0B0B0C" strokeWidth={1.8} />}
              title="Términos y condiciones"
              onPress={() => router.push("/policies" as any)}
            />
          </View>
        </View>

        {isAuthenticated ? (
          <View className="mt-6 px-5">
            <Pressable
              onPress={onLogout}
              className="flex-row items-center gap-3 p-4 rounded-2xl bg-card border border-border active:opacity-80"
            >
              <LogOut size={18} color="#D6342C" strokeWidth={1.8} />
              <Body className="text-sale font-body-semibold">Cerrar sesión</Body>
            </Pressable>
          </View>
        ) : null}

        <View className="mt-8 items-center">
          <Caption className="text-muted-foreground">Azafaran · v1.0</Caption>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface RowProps {
  icon: React.ReactNode;
  title: string;
  value?: string;
  onPress: () => void;
}

function Row({ icon, title, value, onPress }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 h-14 active:opacity-80"
    >
      <View className="w-8">{icon}</View>
      <Body className="flex-1 font-body-medium">{title}</Body>
      {value ? <Small className="text-muted-foreground mr-2">{value}</Small> : null}
      <ChevronRight size={16} color="#A1A1A6" strokeWidth={2} />
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-border ml-12" />;
}
