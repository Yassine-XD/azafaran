import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Tag, Plus } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';

// Types
type PackItem = {
  name: string;
  weight: string;
};

type DealItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  originalPrice: number;
  price: number;
  discount: string;
  category: 'meat' | 'pollo' | 'rabbit' | 'pack';
  endTime: string;
  packItems?: PackItem[];
};

// Mock Data with Packs
const DEALS: DealItem[] = [
  {
    id: '1',
    name: 'Pechuga Premium',
    description: 'Pechuga de pollo fresca y tierna',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=60',
    originalPrice: 8.50,
    price: 4.25,
    discount: '-50%',
    category: 'pollo',
    endTime: '02h 30m',
    packItems: [
      { name: 'Pechuga entera', weight: '500g' }
    ]
  },
  {
    id: '2',
    name: 'Chuletón Angus',
    description: 'Carne de res premium madurada',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&auto=format&fit=crop&q=60',
    originalPrice: 35.00,
    price: 24.50,
    discount: '-30%',
    category: 'meat',
    endTime: '05h 15m',
    packItems: [
      { name: 'Chuletón madurado', weight: '1kg' }
    ]
  },
  {
    id: '3',
    name: 'Pack Conejo',
    description: 'Piernas y lomo de conejo fresco',
    image: 'https://images.unsplash.com/photo-1643212263619-46b1a2295b94?w=400&auto=format&fit=crop&q=60',
    originalPrice: 18.00,
    price: 12.60,
    discount: '-30%',
    category: 'rabbit',
    endTime: '01h 45m',
    packItems: [
      { name: 'Pierna trasera', weight: '300g' },
      { name: 'Lomo', weight: '200g' }
    ]
  },
  {
    id: '4',
    name: 'Pack Familiar BBQ',
    description: 'Todo lo necesario para tu asado',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=60',
    originalPrice: 45.00,
    price: 32.50,
    discount: '-28%',
    category: 'pack',
    endTime: '12h 00m',
    packItems: [
      { name: 'Chuletón Angus', weight: '800g' },
      { name: 'Costillas Cerdo', weight: '500g' },
      { name: 'Salchichas Ibéricas', weight: '400g' }
    ]
  },
  {
    id: '5',
    name: 'Alitas Pollo',
    description: 'Pack de 10 alas listas para hornear',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&auto=format&fit=crop&q=60',
    originalPrice: 12.00,
    price: 7.20,
    discount: '-40%',
    category: 'pollo',
    endTime: '04h 00m',
    packItems: [
      { name: 'Alas', weight: '600g' }
    ]
  },
  {
    id: '6',
    name: 'Lomo de Res',
    description: 'Corte tierno perfecto para bistec',
    image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=400&auto=format&fit=crop&q=60',
    originalPrice: 22.00,
    price: 15.40,
    discount: '-30%',
    category: 'meat',
    endTime: '06h 10m',
    packItems: [
      { name: 'Lomo fileteado', weight: '1kg' }
    ]
  },
  {
    id: '7',
    name: 'Pack Semanal Pollo',
    description: 'Carne de pollo para toda la semana',
    image: 'https://images.unsplash.com/photo-1615557960916-5f4791effe9d?w=400&auto=format&fit=crop&q=60',
    originalPrice: 28.00,
    price: 19.60,
    discount: '-30%',
    category: 'pack',
    endTime: '08h 30m',
    packItems: [
      { name: 'Pechuga', weight: '500g' },
      { name: 'Muslos', weight: '600g' },
      { name: 'Alas', weight: '400g' }
    ]
  },
  {
    id: '8',
    name: 'Hamburguesas Gourmet',
    description: 'Pack de 6 hamburguesas premium',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60',
    originalPrice: 18.50,
    price: 12.95,
    discount: '-30%',
    category: 'meat',
    endTime: '03h 45m',
    packItems: [
      { name: 'Hamburguesas 150g', weight: '900g' }
    ]
  },
];

const FILTERS = [
  { id: 'all', label: 'ALL' },
  { id: 'meat', label: 'Meat' },
  { id: 'pollo', label: 'Pollo' },
  { id: 'rabbit', label: 'Rabbit' },
  { id: 'pack', label: 'Packs' },
];

export default function DealsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredDeals = selectedFilter === 'all' 
    ? DEALS 
    : DEALS.filter(deal => deal.category === selectedFilter);

  const renderFilterItem = ({ item }: { item: typeof FILTERS[0] }) => (
    <TouchableOpacity
      onPress={() => setSelectedFilter(item.id)}
      className={`mr-3 px-4 py-2 rounded-full ${
        selectedFilter === item.id 
          ? 'bg-primary' 
          : 'bg-muted'
      }`}
    >
      <Text className={`font-semibold text-sm ${
        selectedFilter === item.id 
          ? 'text-primary-foreground' 
          : 'text-muted-foreground'
      }`}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderDealItem = ({ item }: { item: DealItem }) => (
    <TouchableOpacity
      onPress={() => router.push(`/deal-detail?id=${item.id}`)}
      activeOpacity={0.9}
      className="flex-1 bg-card rounded-xl overflow-hidden shadow-sm border border-border mr-3 mb-3"
    >
      <View className="relative">
        <Image source={{ uri: item.image }} className="w-full h-32" resizeMode="cover" />
        <View className="absolute top-2 left-2 bg-destructive px-2 py-1 rounded-md">
          <Text className="text-white text-xs font-bold">{item.discount}</Text>
        </View>
        <View className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded-md flex-row items-center">
          <Clock size={10} className="text-white mr-1" />
          <Text className="text-white text-[10px] font-medium">{item.endTime}</Text>
        </View>
      </View>
      
      <View className="p-3">
        <Text className="text-foreground font-semibold text-sm mb-1" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-muted-foreground text-xs mb-3" numberOfLines={2}>
          {item.description}
        </Text>
        
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-primary font-bold">€{item.price.toFixed(2)}</Text>
            <Text className="text-muted-foreground text-xs line-through">€{item.originalPrice.toFixed(2)}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              // Handle add to cart directly if needed
            }}
            className="bg-primary w-8 h-8 rounded-full items-center justify-center"
          >
            <Plus size={16} className="text-primary-foreground" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground">Big Deals</Text>
        <ThemeToggle />
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Tabs */}
        <View className="mb-6">
          <FlatList
            data={FILTERS}
            renderItem={renderFilterItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        </View>

        {/* Deals Grid */}
        <View className="px-6">
          <FlatList
            data={filteredDeals}
            renderItem={renderDealItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-12">
                <Tag size={48} className="text-muted-foreground mb-4" />
                <Text className="text-muted-foreground">No deals available</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}