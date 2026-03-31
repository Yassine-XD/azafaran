import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, ShoppingCart, Check, Grid3X3, List, Heart, Minus, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock Data
const FILTERS = [
  { id: 'all', name: 'All', icon: 'check' },
  { id: 'curry', name: 'Curry Cut & Whole Uncut' },
  { id: 'chicken', name: 'Chicken Breast' },
  { id: 'boneless', name: 'Boneless' },
  { id: 'wings', name: 'Wings & Drums' },
];

const PRODUCTS = [
  {
    id: '1',
    name: 'Chicken W/O Skin (Skinless)',
    subtitle: '480Gm-500Gm',
    price: 140,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=60',
    isFavorite: true,
    quantity: 0,
  },
  {
    id: '2',
    name: 'Chicken Liver / Kaleji',
    subtitle: '480Gm-500Gm',
    price: 85,
    image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400&auto=format&fit=crop&q=60',
    isFavorite: false,
    quantity: 0,
  },
  {
    id: '3',
    name: 'Chicken W/O Skin (Skinless)',
    subtitle: '1Kg Pack',
    price: 280,
    image: 'https://images.unsplash.com/photo-1587590227264-0ac64ce63ce8?w=400&auto=format&fit=crop&q=60',
    isFavorite: true,
    quantity: 2,
  },
  {
    id: '4',
    name: 'Chicken Gizzard',
    subtitle: '480Gm-500Gm',
    price: 95,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=60',
    isFavorite: false,
    quantity: 1,
  },
  {
    id: '5',
    name: 'Chicken Drumsticks',
    subtitle: '500Gm Pack',
    price: 165,
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&auto=format&fit=crop&q=60',
    isFavorite: false,
    quantity: 0,
  },
  {
    id: '6',
    name: 'Chicken Wings',
    subtitle: '500Gm Pack',
    price: 120,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&auto=format&fit=crop&q=60',
    isFavorite: true,
    quantity: 0,
  },
];

type ViewMode = 'single' | 'grid' | 'list';

export default function ShopScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [products, setProducts] = useState(PRODUCTS);
  const [cartCount] = useState(5);
  const [cartTotal] = useState(1264);

  const toggleFavorite = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const updateQuantity = (id: string, delta: number) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const newQty = Math.max(0, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  const renderFilterItem = ({ item }: { item: typeof FILTERS[0] }) => {
    const isSelected = selectedFilter === item.id;
    return (
      <TouchableOpacity
        onPress={() => setSelectedFilter(item.id)}
        className={`flex-row items-center px-4 py-2.5 rounded-full mr-3 ${
          isSelected ? 'bg-primary' : 'bg-card border border-border'
        }`}
      >
        {item.icon === 'check' && isSelected && (
          <Check size={16} className="text-primary-foreground mr-1.5" />
        )}
        <Text className={`text-sm font-medium ${
          isSelected ? 'text-primary-foreground' : 'text-foreground'
        }`}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProductCard = ({ item }: { item: typeof PRODUCTS[0] }) => (
    <View className="flex-1 m-2 bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
      {/* Image Container */}
      <View className="relative">
        <Image 
          source={{ uri: item.image }} 
          className="w-full h-36"
          resizeMode="cover"
        />
        <TouchableOpacity 
          onPress={() => toggleFavorite(item.id)}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full items-center justify-center shadow-sm"
        >
          <Heart 
            size={16} 
            className={item.isFavorite ? 'text-primary' : 'text-muted-foreground'} 
            fill={item.isFavorite ? '#ea580c' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="p-3">
        <Text className="text-foreground font-semibold text-sm mb-0.5" numberOfLines={2}>
          {item.name}
        </Text>
        <Text className="text-muted-foreground text-xs mb-2">
          {item.subtitle}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text className="text-primary font-bold text-lg">₹{item.price}</Text>
          
          {item.quantity > 0 ? (
            <View className="flex-row items-center bg-primary/10 rounded-full px-2 py-1">
              <TouchableOpacity 
                onPress={() => updateQuantity(item.id, -1)}
                className="w-6 h-6 items-center justify-center"
              >
                <Minus size={14} className="text-primary" />
              </TouchableOpacity>
              <Text className="text-foreground font-semibold mx-2 min-w-[20px] text-center">
                {item.quantity}
              </Text>
              <TouchableOpacity 
                onPress={() => updateQuantity(item.id, 1)}
                className="w-6 h-6 items-center justify-center"
              >
                <Plus size={14} className="text-primary" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => updateQuantity(item.id, 1)}
              className="w-8 h-8 bg-primary rounded-full items-center justify-center"
            >
              <Plus size={18} className="text-primary-foreground" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="bg-primary px-4 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-primary-foreground/20 rounded-xl items-center justify-center"
          >
            <ArrowLeft size={22} className="text-primary-foreground" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-primary-foreground">Chicken</Text>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity className="w-10 h-10 bg-primary-foreground/20 rounded-xl items-center justify-center">
              <Search size={20} className="text-primary-foreground" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/cart')}
              className="w-10 h-10 bg-primary-foreground/20 rounded-xl items-center justify-center relative"
            >
              <ShoppingCart size={20} className="text-primary-foreground" />
              {cartCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-white w-5 h-5 rounded-full items-center justify-center">
                  <Text className="text-primary text-xs font-bold">{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="py-3 bg-background border-b border-border">
        <FlatList
          data={FILTERS}
          renderItem={renderFilterItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* View Options */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-background">
        <Text className="text-foreground font-medium">View Options</Text>
        <View className="flex-row items-center bg-muted rounded-full p-1">
          <TouchableOpacity
            onPress={() => setViewMode('single')}
            className={`flex-row items-center px-3 py-1.5 rounded-full ${
              viewMode === 'single' ? 'bg-card shadow-sm' : ''
            }`}
          >
            <Grid3X3 size={16} className={viewMode === 'single' ? 'text-primary' : 'text-muted-foreground'} />
            <Text className={`text-xs ml-1.5 font-medium ${
              viewMode === 'single' ? 'text-primary' : 'text-muted-foreground'
            }`}>
              Single
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            className={`flex-row items-center px-3 py-1.5 rounded-full ${
              viewMode === 'grid' ? 'bg-primary shadow-sm' : ''
            }`}
          >
            <Grid3X3 size={16} className={viewMode === 'grid' ? 'text-primary-foreground' : 'text-muted-foreground'} />
            <Text className={`text-xs ml-1.5 font-medium ${
              viewMode === 'grid' ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}>
              Grid
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`flex-row items-center px-3 py-1.5 rounded-full ${
              viewMode === 'list' ? 'bg-card shadow-sm' : ''
            }`}
          >
            <List size={16} className={viewMode === 'list' ? 'text-primary' : 'text-muted-foreground'} />
            <Text className={`text-xs ml-1.5 font-medium ${
              viewMode === 'list' ? 'text-primary' : 'text-muted-foreground'
            }`}>
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Grid */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap">
          {products.map((item) => (
            <View key={item.id} className="w-1/2">
              {renderProductCard({ item })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Cart Bar */}
      <View className="absolute bottom-6 left-4 right-4">
        <TouchableOpacity 
          onPress={() => router.push('/cart')}
          className="bg-foreground rounded-2xl flex-row items-center justify-between px-5 py-4 shadow-2xl"
          style={{ elevation: 8 }}
        >
          <View className="flex-row items-center">
            <Text className="text-background font-semibold">{cartCount} Items</Text>
            <View className="w-px h-4 bg-background/30 mx-3" />
            <Text className="text-background font-bold text-lg">₹{cartTotal.toLocaleString()}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-background font-semibold mr-2">View Cart</Text>
            <ArrowLeft size={16} className="text-background rotate-180" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}