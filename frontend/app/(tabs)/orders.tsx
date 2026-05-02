import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading1 } from "@/components/ui/Text";
import { useLang } from "@/contexts/LanguageContext";

export default function OrdersScreen() {
  const { t } = useLang();
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 py-6">
        <Heading1>{t("tabs.orders")}</Heading1>
      </ScrollView>
    </SafeAreaView>
  );
}
