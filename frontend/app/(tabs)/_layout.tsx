import { Tabs } from 'expo-router';
import { Home, Grid, Tag, ShoppingBag, Menu } from 'lucide-react-native';
import { cssInterop, useColorScheme } from 'nativewind';

cssInterop(Home, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Grid, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Tag, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ShoppingBag, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Menu, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1c1917' : '#fffbf7',
          borderTopColor: isDark ? '#44403c' : '#f5ebe6',
        },
        tabBarActiveTintColor: isDark ? '#ea580c' : '#ea580c',
        tabBarInactiveTintColor: isDark ? '#a8a29e' : '#78716c',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Home className={focused ? 'text-primary' : 'text-muted-foreground'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ focused }) => (
            <Grid className={focused ? 'text-primary' : 'text-muted-foreground'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: 'Deals',
          tabBarIcon: ({ focused }) => (
            <Tag className={focused ? 'text-primary' : 'text-muted-foreground'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => (
            <ShoppingBag className={focused ? 'text-primary' : 'text-muted-foreground'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ focused }) => (
            <Menu className={focused ? 'text-primary' : 'text-muted-foreground'} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}