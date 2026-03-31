import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Clock,
  Share2,
  Plus,
  Minus,
  Tag,
  CheckCircle,
} from 'lucide-react-native';

// Mock Data for the deal
const DEAL_DATA = {
  id: '1',
  name: 'Pechuga Premium',
  description: 'Pechuga de pollo fresca y tierna, criada en campo libre. Sin antibióticos ni hormonas. Perfecta para una alimentación saludable y deliciosa.',
  image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&auto=format&fit=crop&q=80',
  originalPrice: 8.50,
  price: 4.25,
  discount: '-50%',
  category: 'Pollo',
  weight: '500g',
  endTime: '02h 30m 15s',
  features: [
    '100% Natural',
    'Sin conservantes',
    'Campo libre',
    'Alta proteína',
  ],
};

export default function DealDetailScreen() {
  const router = useRouter();
  const [quantity, setQuantity] = React.useState(1);

  const updateQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-6 pt-12 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full items-center justify-center border border-border"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </TouchableOpacity>
        
        <View className="bg-destructive px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">{DEAL_DATA.discount}</Text>
        </View>

        <TouchableOpacity className="w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full items-center justify-center border border-border">
          <Share2 size={20} className="text-foreground" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={{ uri: DEAL_DATA.image }}
            className="w-full h-80"
            resizeMode="cover"
          />
          
          {/* Timer Badge */}
          <View className="absolute bottom-4 left-6 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl flex-row items-center">
            <Clock size={16} className="text-primary mr-2" />
            <Text className="text-white font-semibold text-sm">
              Termina en: {DEAL_DATA.endTime}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="px-6 pt-6">
          {/* Title & Price */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground mb-2">
                {DEAL_DATA.name}
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-muted-foreground text-sm line-through">
                  €{DEAL_DATA.originalPrice.toFixed(2)}
                </Text>
                <Text className="text-2xl font-bold text-primary">
                  €{DEAL_DATA.price.toFixed(2)}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  / {DEAL_DATA.weight}
                </Text>
              </View>
            </View>
          </View>

          {/* Badges */}
          <View className="flex-row gap-2 mb-6">
            <View className="bg-secondary px-3 py-1 rounded-full">
              <Text className="text-secondary-foreground text-xs font-medium">
                {DEAL_DATA.category}
              </Text>
            </View>
            <View className="bg-secondary px-3 py-1 rounded-full">
              <Text className="text-secondary-foreground text-xs font-medium">
                Oferta Flash
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-2">
              Descripción
            </Text>
            <Text className="text-muted-foreground leading-relaxed">
              {DEAL_DATA.description}
            </Text>
          </View>

          {/* Features */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Características
            </Text>
            <View className="gap-3">
              {DEAL_DATA.features.map((feature, index) => (
                <View key={index} className="flex-row items-center">
                  <CheckCircle size={18} className="text-primary mr-3" />
                  <Text className="text-foreground">{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quantity Selector */}
          <View className="flex-row items-center justify-between bg-card p-4 rounded-xl border border-border mb-6">
            <Text className="text-foreground font-semibold">Cantidad</Text>
            <View className="flex-row items-center bg-input rounded-lg px-3 py-2">
              <TouchableOpacity
                onPress={() => updateQuantity(-1)}
                className="p-1"
                disabled={quantity <= 1}
              >
                <Minus
                  size={18}
                  className={
                    quantity <= 1
                      ? 'text-muted-foreground/50'
                      : 'text-foreground'
                  }
                />
              </TouchableOpacity>
              <Text className="text-foreground font-bold mx-4 min-w-[24px] text-center">
                {quantity}
              </Text>
              <TouchableOpacity onPress={() => updateQuantity(1)} className="p-1">
                <Plus size={18} className="text-foreground" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-6 rounded-t-3xl shadow-lg">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-muted-foreground">Total</Text>
          <Text className="text-2xl font-bold text-primary">
            €{(DEAL_DATA.price * quantity).toFixed(2)}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => router.push('/cart')}
          className="rounded-2xl overflow-hidden shadow-lg"
        >
          <LinearGradient
            colors={['#ea580c', '#c2410c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tag size={20} className="text-white mr-2" />
            <Text className="text-white font-bold text-lg">
              Añadir Oferta al Carrito
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}