import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Mock Data for Onboarding Slides
const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Carne Fresca y Halal',
    description: 'Descubre nuestra selección de carnes premium, 100% Halal y certificadas.',
    image: 'https://images.unsplash.com/photo-1600675608140-991fcf38cc6e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fDMlMjBncmFwaGljc3xlbnwwfHwwfHx8MA%3D%3D',
  },
  {
    id: '2',
    title: 'Entrega Rápida',
    description: 'Recibe tu pedido en la puerta de tu casa en menos de 30 minutos.',
    image: 'https://images.unsplash.com/photo-1564393333316-a1a043196554?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fDMlMjBncmFwaGljc3xlbnwwfHwwfHx8MA%3D%3D',
  },
  {
    id: '3',
    title: 'Mejores Precios',
    description: 'Calidad de carnicero a precios de supermercado. Ahorra en cada compra.',
    image: 'https://images.unsplash.com/photo-1557425529-b1ae9c141e7d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cmVjcnVpdG1lbnR8ZW58MHx8MHx8fDA%3D',
  },
];

type Slide = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const windowWidth = useWindowDimensions().width;

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / windowWidth);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * windowWidth,
        animated: true,
      });
    } else {
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Skip Button */}
      <View className="absolute top-0 left-0 right-0 z-10 p-6 flex-row justify-end">
        <TouchableOpacity onPress={handleSkip} className="p-2">
          <X size={24} className="text-muted-foreground" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{ width: windowWidth * ONBOARDING_DATA.length }}
      >
        {ONBOARDING_DATA.map((slide: Slide) => (
          <View key={slide.id} style={{ width: windowWidth }} className="flex-1 justify-center items-center">
            <Image 
              source={{ uri: slide.image }} 
              className="w-full h-[55%]"
              resizeMode="cover"
            />
            
            <View className="flex-1 w-full px-8 pt-8 justify-start items-center">
              <Text className="text-3xl font-bold text-foreground text-center mb-4">
                {slide.title}
              </Text>
              <Text className="text-base text-muted-foreground text-center leading-6">
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View className="flex-row justify-center gap-2 mb-6">
        {ONBOARDING_DATA.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </View>

      {/* CTA Button */}
      <View className="px-6 pb-10 pt-2">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
          <Text className="text-primary-foreground font-semibold text-lg">
            {currentIndex === ONBOARDING_DATA.length - 1 ? 'Comenzar' : 'Siguiente'}
          </Text>
          <ChevronRight size={20} className="text-primary-foreground" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}