import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart, Check, Truck, Shield, Clock } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Mock product data - in a real app, this would come from an API
const PRODUCT_DATA: Record<string, {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  weights: { label: string; price: number }[];
  isFavorite: boolean;
}> = {
  '1': {
    id: '1',
    name: 'Chicken W/O Skin (Skinless)',
    subtitle: 'Premium quality chicken breast',
    description: 'Fresh, skinless chicken breast perfect for healthy meals. Our chicken is sourced from local farms, ensuring the highest quality and freshness. Perfect for grilling, baking, or pan-frying.',
    price: 140,
    originalPrice: 160,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&auto=format&fit=crop&q=60',
    rating: 4.8,
    reviews: 124,
    weights: [
      { label: '480Gm-500Gm', price: 140 },
      { label: '1Kg Pack', price: 280 },
      { label: '2Kg Pack', price: 540 },
    ],
    isFavorite: true,
  },
  '2': {
    id: '2',
    name: 'Chicken Liver / Kaleji',
    subtitle: 'Fresh and nutritious',
    description: 'Fresh chicken liver, rich in iron and vitamins. Perfect for traditional recipes or as a healthy addition to your diet.',
    price: 85,
    image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800&auto=format&fit=crop&q=60',
    rating: 4.6,
    reviews: 89,
    weights: [
      { label: '480Gm-500Gm', price: 85 },
      { label: '1Kg Pack', price: 170 },
    ],
    isFavorite: false,
  },
};

type WeightOption = { label: string; price: number };

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = params.id as string;
  
  const product = PRODUCT_DATA[productId] || PRODUCT_DATA['1'];
  
  const [selectedWeight, setSelectedWeight] = useState<WeightOption>(product.weights[0]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite);
  const [addedToCart, setAddedToCart] = useState(false);

  const totalPrice = selectedWeight.price * quantity;

  const handleAddToCart = () => {
    setAddedToCart(true);
    Alert.alert(
      'Added to Cart',
      `${product.name} (${selectedWeight.label}) x${quantity} added to your cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/cart') }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 px-4 py-4 flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full items-center justify-center"
        >
          <ArrowLeft size={22} className="text-white" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
            onPress={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full items-center justify-center"
          >
            <Heart 
              size={20} 
              className={isFavorite ? 'text-red-500' : 'text-white'} 
              fill={isFavorite ? '#ef4444' : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/cart')}
            className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full items-center justify-center relative"
          >
            <ShoppingCart size={20} className="text-white" />
            <View className="absolute -top-1 -right-1 bg-primary w-5 h-5 rounded-full items-center justify-center">
              <Text className="text-primary-foreground text-[10px] font-bold">2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View className="relative">
          <Image 
            source={{ uri: product.image }} 
            className="w-full h-80"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
          />
        </View>

        {/* Product Info */}
        <View className="bg-background -mt-6 rounded-t-3xl relative px-6 pt-8 pb-4">
          {/* Rating & Reviews */}
          <View className="flex-row items-center mb-3">
            <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-lg">
              <Text className="text-yellow-700 font-bold text-sm mr-1">★</Text>
              <Text className="text-yellow-700 font-semibold text-sm">{product.rating}</Text>
            </View>
            <Text className="text-muted-foreground text-sm ml-2">({product.reviews} reviews)</Text>
          </View>

          {/* Title & Price */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-foreground mb-1">{product.name}</Text>
            <Text className="text-muted-foreground text-base">{product.subtitle}</Text>
          </View>

          {/* Price */}
          <View className="flex-row items-baseline mb-6">
            <Text className="text-3xl font-bold text-primary">₹{totalPrice}</Text>
            {product.originalPrice && (
              <Text className="text-muted-foreground text-lg line-through ml-3">₹{product.originalPrice}</Text>
            )}
            <Text className="text-muted-foreground text-sm ml-2">/ {selectedWeight.label}</Text>
          </View>

          

          {/* Weight Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Select Weight</Text>
            <View className="flex-row flex-wrap gap-2">
              {product.weights.map((weight, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedWeight(weight)}
                  className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl border-2 ${
                    selectedWeight.label === weight.label
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card'
                  }`}
                >
                  <Text className={`text-sm font-semibold ${
                    selectedWeight.label === weight.label ? 'text-primary' : 'text-foreground'
                  }`}>
                    {weight.label}
                  </Text>
                  <Text className={`text-xs mt-1 ${
                    selectedWeight.label === weight.label ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    ₹{weight.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">Quantity</Text>
            <View className="flex-row items-center bg-muted rounded-xl p-1 w-40">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-card rounded-lg items-center justify-center"
              >
                <Minus size={20} className="text-foreground" />
              </TouchableOpacity>
              <Text className="flex-1 text-center text-xl font-bold text-foreground">{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                className="w-12 h-12 bg-primary rounded-lg items-center justify-center"
              >
                <Plus size={20} className="text-primary-foreground" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View className="mb-32">
            <Text className="text-lg font-semibold text-foreground mb-3">Description</Text>
            <Text className="text-muted-foreground text-base leading-relaxed">
              {product.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Add to Cart Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-6 rounded-t-3xl shadow-2xl">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-muted-foreground text-sm">Total Price</Text>
            <Text className="text-2xl font-bold text-primary">₹{totalPrice}</Text>
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            className={`flex-row items-center px-8 py-4 rounded-2xl ${
              addedToCart ? 'bg-green-600' : 'bg-primary'
            }`}
          >
            {addedToCart ? (
              <>
                <Check size={20} className="text-white mr-2" />
                <Text className="text-white font-bold text-lg">Added!</Text>
              </>
            ) : (
              <>
                <ShoppingCart size={20} className="text-white mr-2" />
                <Text className="text-white font-bold text-lg">Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}