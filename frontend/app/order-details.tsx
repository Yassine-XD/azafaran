import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, Clock, Truck, Package, RotateCcw, MapPin, Phone, ChevronRight } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock Order Data
const ORDER_DATA: Record<string, {
  id: string;
  date: string;
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered';
  total: number;
  subtotal: number;
  deliveryFee: number;
  estimatedDelivery: string;
  address: string;
  items: {
    id: string;
    name: string;
    weight: string;
    price: number;
    quantity: number;
    image: string;
  }[];
}> = {
  'ORD-2847': {
    id: 'ORD-2847',
    date: '15 Ene 2024, 14:30',
    status: 'out_for_delivery',
    total: 45.50,
    subtotal: 42.50,
    deliveryFee: 3.00,
    estimatedDelivery: '15:45 - 16:00',
    address: '123 Calle Principal, Madrid',
    items: [
      { id: '1', name: 'Pollo Entero', weight: '1.5kg', price: 12.00, quantity: 1, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&auto=format&fit=crop&q=60' },
      { id: '2', name: 'Chuletas de Ternera', weight: '500g', price: 16.75, quantity: 2, image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&auto=format&fit=crop&q=60' },
      { id: '3', name: 'Salchichas Ibéricas', weight: '400g', price: 6.50, quantity: 1, image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=200&auto=format&fit=crop&q=60' },
    ]
  },
  'ORD-2912': {
    id: 'ORD-2912',
    date: '18 Ene 2024, 10:15',
    status: 'delivered',
    total: 32.00,
    subtotal: 32.00,
    deliveryFee: 0.00,
    estimatedDelivery: '10:45 - 11:00',
    address: '45 Avenida Central, Barcelona',
    items: [
      { id: '4', name: 'Hamburguesas Premium', weight: '200g', price: 8.00, quantity: 4, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=60' },
    ]
  }
};

type TimelineStep = {
  key: string;
  label: string;
  icon: React.ElementType;
};

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'preparing', label: 'Preparing', icon: Clock },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const orderId = id as string;
  
  const order = ORDER_DATA[orderId] || ORDER_DATA['ORD-2847'];

  // Determine current step index
  const currentStepIndex = TIMELINE_STEPS.findIndex(step => step.key === order.status);

  const handleReorder = () => {
    // In a real app, this would add items to cart
    router.push('/cart');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-border flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">Order Details</Text>
        <View className="w-8" /> {/* Spacer for center alignment */}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View className="mx-6 mt-6 bg-card rounded-2xl p-5 border border-border shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-foreground">{order.id}</Text>
              <Text className="text-sm text-muted-foreground mt-1">{order.date}</Text>
            </View>
            <View className={`px-3 py-1.5 rounded-full ${
              order.status === 'delivered' 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-primary/10'
            }`}>
              <Text className={`text-xs font-bold uppercase ${
                order.status === 'delivered' ? 'text-green-700 dark:text-green-400' : 'text-primary'
              }`}>
                {order.status.replace('_', ' ')}
              </Text>
            </View>
          </View>

          {order.status !== 'delivered' && (
            <View className="bg-muted rounded-xl p-3 flex-row items-center">
              <Clock size={18} className="text-primary mr-3" />
              <View>
                <Text className="text-xs text-muted-foreground">Estimated Delivery</Text>
                <Text className="text-sm font-semibold text-foreground">{order.estimatedDelivery}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Timeline */}
        <View className="mx-6 mt-8">
          <Text className="text-lg font-bold text-foreground mb-4">Tracking</Text>
          <View className="pl-2">
            {TIMELINE_STEPS.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const isPending = index > currentStepIndex;
              const Icon = step.icon;

              return (
                <View key={step.key} className="flex-row mb-6 relative">
                  {/* Vertical Line */}
                  {index < TIMELINE_STEPS.length - 1 && (
                    <View 
                      className={`absolute left-[11px] top-6 w-0.5 h-full ${
                        isCompleted ? 'bg-primary' : 'bg-border'
                      }`} 
                    />
                  )}

                  {/* Icon */}
                  <View 
                    className={`w-6 h-6 rounded-full items-center justify-center mr-4 z-10 ${
                      isActive ? 'bg-primary' : isCompleted ? 'bg-primary' : 'bg-muted border-2 border-border'
                    }`}
                  >
                    <Icon 
                      size={14} 
                      className={isActive || isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'} 
                    />
                  </View>

                  {/* Label */}
                  <View className="flex-1 pt-0.5">
                    <Text className={`text-sm font-medium ${
                      isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </Text>
                    {isActive && (
                      <Text className="text-xs text-primary mt-0.5">In Progress</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Delivery Address */}
        <View className="mx-6 mt-6 bg-card rounded-2xl p-4 border border-border">
          <View className="flex-row items-center mb-3">
            <MapPin size={18} className="text-primary mr-2" />
            <Text className="text-sm font-semibold text-foreground">Delivery Address</Text>
          </View>
          <Text className="text-sm text-muted-foreground">{order.address}</Text>
        </View>

        {/* Order Items */}
        <View className="mx-6 mt-6">
          <Text className="text-lg font-bold text-foreground mb-4">Order Items ({order.items.length})</Text>
          
          <View className="gap-3">
            {order.items.map((item) => (
              <View key={item.id} className="bg-card rounded-xl p-3 flex-row items-center border border-border">
                <Image 
                  source={{ uri: item.image }} 
                  className="w-16 h-16 rounded-lg"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-foreground font-semibold text-sm">{item.name}</Text>
                  <Text className="text-muted-foreground text-xs mt-0.5">{item.weight}</Text>
                  <View className="flex-row items-center mt-2">
                    <Text className="text-primary font-bold">€{item.price.toFixed(2)}</Text>
                    <Text className="text-muted-foreground text-xs ml-2">x{item.quantity}</Text>
                  </View>
                </View>
                <View className="bg-muted px-2 py-1 rounded">
                  <Text className="text-foreground font-bold text-sm">€{(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Price Breakdown */}
        <View className="mx-6 mt-6 bg-card rounded-2xl p-5 border border-border">
          <Text className="text-lg font-bold text-foreground mb-4">Payment Summary</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Subtotal</Text>
              <Text className="text-foreground">€{order.subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Delivery Fee</Text>
              <Text className="text-foreground">
                {order.deliveryFee === 0 ? 'Free' : `€${order.deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View className="h-px bg-border my-2" />
            <View className="flex-row justify-between">
              <Text className="text-lg font-bold text-foreground">Total</Text>
              <Text className="text-lg font-bold text-primary">€{order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <TouchableOpacity className="mx-6 mt-6 mb-8 flex-row items-center justify-between p-4 bg-card rounded-xl border border-border">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-muted rounded-full items-center justify-center mr-3">
              <Phone size={18} className="text-primary" />
            </View>
            <View>
              <Text className="text-foreground font-semibold text-sm">Need Help?</Text>
              <Text className="text-muted-foreground text-xs">Contact support</Text>
            </View>
          </View>
          <ChevronRight size={20} className="text-muted-foreground" />
        </TouchableOpacity>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-6 rounded-t-3xl shadow-2xl">
        <TouchableOpacity 
          onPress={handleReorder}
          className="bg-primary rounded-2xl py-4 flex-row items-center justify-center active:opacity-90"
        >
          <RotateCcw size={20} className="text-primary-foreground mr-2" />
          <Text className="text-primary-foreground font-bold text-lg">Re-order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}