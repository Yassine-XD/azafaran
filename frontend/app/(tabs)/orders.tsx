import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Clock, Truck, CheckCircle, RotateCcw } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useRouter } from "expo-router";


// Mock Data for Orders
const ORDERS = [
  {
    id: 'ORD-2847',
    date: '15 Ene 2024',
    status: 'delivered',
    total: 45.50,
    items: [
      { name: 'Pollo Entero', qty: 1, price: 12.00, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=100&auto=format&fit=crop&q=80' },
      { name: 'Chuletas de Ternera', qty: 2, price: 16.75, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=100&auto=format&fit=crop&q=80' },
      { name: 'Salchichas Ibéricas', qty: 1, price: 6.50, image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=100&auto=format&fit=crop&q=80' },
    ]
  },
  {
    id: 'ORD-2912',
    date: '18 Ene 2024',
    status: 'out_for_delivery',
    total: 32.00,
    items: [
      { name: 'Hamburguesas Premium', qty: 4, price: 8.00, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80' },
    ]
  },
  {
    id: 'ORD-2955',
    date: '20 Ene 2024',
    status: 'preparing',
    total: 28.90,
    items: [
      { name: 'Costillas de Cerdo', qty: 1, price: 28.90, image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=100&auto=format&fit=crop&q=80' },
    ]
  },
  {
    id: 'ORD-3010',
    date: '22 Ene 2024',
    status: 'pending',
    total: 15.75,
    items: [
      { name: 'Alitas de Pollo', qty: 2, price: 7.85, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=100&auto=format&fit=crop&q=80' },
    ]
  },
];

type OrderItem = {
  name: string;
  qty: number;
  price: number;
  image: string;
};

type Order = {
  id: string;
  date: string;
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered';
  total: number;
  items: OrderItem[];
};

// Status Configuration
const getStatusConfig = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return { 
        label: 'Entregado', 
        bgColor: 'bg-green-100 dark:bg-green-900/30', 
        textColor: 'text-green-700 dark:text-green-400', 
        icon: CheckCircle 
      };
    case 'out_for_delivery':
      return { 
        label: 'En camino', 
        bgColor: 'bg-blue-100 dark:bg-blue-900/30', 
        textColor: 'text-blue-700 dark:text-blue-400', 
        icon: Truck 
      };
    case 'preparing':
      return { 
        label: 'Preparando', 
        bgColor: 'bg-orange-100 dark:bg-orange-900/30', 
        textColor: 'text-orange-700 dark:text-orange-400', 
        icon: Clock 
      };
    default:
      return { 
        label: 'Pendiente', 
        bgColor: 'bg-gray-100 dark:bg-gray-800', 
        textColor: 'text-gray-700 dark:text-gray-400', 
        icon: Package 
      };
  }
};

export default function OrdersScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-border">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Mis Pedidos</Text>
          <ThemeToggle />
        </View>
      </View>

      {/* Orders List */}
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 128, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {ORDERS.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;

          return (
            <View  key={order.id} className="bg-card rounded-2xl p-4 shadow-sm border border-border" >
              {/* Order Header: ID, Date & Status */}
              <View className="flex-row items-start justify-between mb-4"
                
              >
                <View >
                  <Text className="text-sm font-semibold text-foreground">{order.id}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">{order.date}</Text>
                </View>
                <View className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                  <StatusIcon size={14} strokeWidth={2.5} />
                  <Text className="text-xs font-semibold">{statusConfig.label}</Text>
                </View>
              </View>

              {/* Order Items Preview */}
              <View className="flex-row gap-2 mb-4">
                {order.items.slice(0, 3).map((item, idx) => (
                  <Image 
                    key={idx}
                    source={{ uri: item.image }} 
                    className="w-14 h-14 rounded-xl bg-muted"
                    resizeMode="cover"
                  />
                ))}
                {order.items.length > 3 && (
                  <View className="w-14 h-14 rounded-xl bg-muted items-center justify-center border border-border">
                    <Text className="text-xs font-medium text-muted-foreground">+{order.items.length - 3}</Text>
                  </View>
                )}
              </View>

              {/* Order Footer: Total & Reorder Button */}
              <View className="flex-row items-center justify-between pt-3 border-t border-border">
                <View>
                  <Text className="text-xs text-muted-foreground">Total</Text>
                  <Text className="text-lg font-bold text-foreground">€{order.total.toFixed(2)}</Text>
                </View>
                
                <TouchableOpacity className="flex-row items-center gap-2 bg-primary px-4 py-2.5 rounded-full active:opacity-80">
                  <RotateCcw size={16} className="text-primary-foreground" strokeWidth={2.5} />
                  <Text className="text-sm font-semibold text-primary-foreground">Repetir</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}