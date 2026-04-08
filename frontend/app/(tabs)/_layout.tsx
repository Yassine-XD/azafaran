import { Tabs } from "expo-router";
import { Home, Grid, Tag, ShoppingBag, User } from "lucide-react-native";
import { cssInterop } from "nativewind";

cssInterop(Home, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(Grid, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(Tag, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(ShoppingBag, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(User, { className: { target: "style", nativeStyleToProp: { color: true } } });

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fffbf7",
          borderTopColor: "#f5ebe6",
        },
        tabBarActiveTintColor: "#660710",
        tabBarInactiveTintColor: "#78716c",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <Home className={focused ? "text-primary" : "text-muted-foreground"} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categorías",
          tabBarIcon: ({ focused }) => (
            <Grid className={focused ? "text-primary" : "text-muted-foreground"} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: "Ofertas",
          tabBarIcon: ({ focused }) => (
            <Tag className={focused ? "text-primary" : "text-muted-foreground"} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Pedidos",
          tabBarIcon: ({ focused }) => (
            <ShoppingBag className={focused ? "text-primary" : "text-muted-foreground"} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <User className={focused ? "text-primary" : "text-muted-foreground"} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
