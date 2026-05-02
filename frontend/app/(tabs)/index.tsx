import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Display, Body } from "@/components/ui/Text";

export default function HomeScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-5 py-6">
        <Display>Hola.</Display>
        <Body className="mt-2 text-muted-foreground">
          Tu carnicería halal a un toque.
        </Body>
        <View className="h-96" />
      </ScrollView>
    </SafeAreaView>
  );
}
