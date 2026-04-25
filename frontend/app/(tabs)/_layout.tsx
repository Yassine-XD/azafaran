import { Tabs } from "expo-router";
import { Home, Grid, Tag, ShoppingBag, User } from "lucide-react-native";
import { cssInterop } from "nativewind";
import { useLang } from "@/contexts/LanguageContext";

cssInterop(Home, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(Grid, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(Tag, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(ShoppingBag, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(User, { className: { target: "style", nativeStyleToProp: { color: true } } });

export default function TabsLayout() {
  const { t } = useLang();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#EADBD1",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#7A0E1F",
        tabBarInactiveTintColor: "#9A8C8C",
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ focused }) => (
            <Home
              className={focused ? "text-primary" : "text-muted-foreground"}
              size={22}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t("tabs.categories"),
          tabBarIcon: ({ focused }) => (
            <Grid
              className={focused ? "text-primary" : "text-muted-foreground"}
              size={22}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: t("tabs.deals"),
          tabBarIcon: ({ focused }) => (
            <Tag
              className={focused ? "text-primary" : "text-muted-foreground"}
              size={22}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("tabs.orders"),
          tabBarIcon: ({ focused }) => (
            <ShoppingBag
              className={focused ? "text-primary" : "text-muted-foreground"}
              size={22}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ focused }) => (
            <User
              className={focused ? "text-primary" : "text-muted-foreground"}
              size={22}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
