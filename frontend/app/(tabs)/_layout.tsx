import { Tabs } from "expo-router";
import { Home, Grid3x3, Package, User } from "lucide-react-native";
import { useLang } from "@/contexts/LanguageContext";

export default function TabsLayout() {
  const { t } = useLang();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0B0B0C",
        tabBarInactiveTintColor: "#A1A1A6",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E5E7",
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t("tabs.categories"),
          tabBarIcon: ({ color, size }) => <Grid3x3 color={color} size={size} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("tabs.orders"),
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  );
}
