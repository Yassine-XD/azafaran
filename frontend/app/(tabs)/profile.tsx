import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, MapPin, Phone, Mail, CreditCard, Bell, Shield, HelpCircle, Settings, LogOut, ChevronRight, Heart } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';

// Mock Data
const USER = {
  name: 'Carlos Martínez',
  email: 'carlos.martinez@email.com',
  phone: '+34 612 345 678',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  address: 'Calle Granada 12, Madrid',
  memberSince: 'Ene 2023'
};

const MENU_SECTIONS = [
  {
    title: 'Mi Cuenta',
    items: [
      { id: '1', label: 'Información Personal', icon: User, color: 'text-blue-500' },
      { id: '2', label: 'Direcciones', icon: MapPin, color: 'text-green-500' },
      { id: '3', label: 'Métodos de Pago', icon: CreditCard, color: 'text-purple-500' },
    ]
  },
  {
    title: 'Preferencias',
    items: [
      { id: '4', label: 'Notificaciones', icon: Bell, color: 'text-orange-500' },
      { id: '5', label: 'Lista de Deseos', icon: Heart, color: 'text-red-500' },
      { id: '6', label: 'Seguridad', icon: Shield, color: 'text-cyan-500' },
    ]
  },
  {
    title: 'Soporte',
    items: [
      { id: '7', label: 'Centro de Ayuda', icon: HelpCircle, color: 'text-indigo-500' },
      { id: '8', label: 'Configuración', icon: Settings, color: 'text-gray-500' },
    ]
  }
];

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  color: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

export default function ProfileScreen() {
  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity 
        key={item.id} 
        className="flex-row items-center justify-between py-3 border-b border-border last:border-0 active:opacity-70"
      >
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
            <Icon size={20} className={item.color} strokeWidth={2.5} />
          </View>
          <Text className="text-foreground font-medium">{item.label}</Text>
        </View>
        <ChevronRight size={20} className="text-muted-foreground" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-border">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Perfil</Text>
          <ThemeToggle />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View className="p-6">
          <View className="bg-card rounded-2xl p-5 shadow-sm border border-border">
            <View className="flex-row items-center gap-4">
              <Image 
                source={{ uri: USER.avatar }} 
                className="w-20 h-20 rounded-full border-2 border-primary"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">{USER.name}</Text>
                <Text className="text-sm text-muted-foreground mt-1">{USER.email}</Text>
                <View className="flex-row items-center gap-2 mt-2">
                  <View className="bg-primary/10 px-2 py-1 rounded-md">
                    <Text className="text-xs font-semibold text-primary">Miembro desde {USER.memberSince}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Info */}
            <View className="flex-row gap-4 mt-5 pt-4 border-t border-border">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Phone size={14} className="text-muted-foreground" />
                  <Text className="text-xs text-muted-foreground">Teléfono</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground mt-1">{USER.phone}</Text>
              </View>
              <View className="w-px bg-border" />
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <MapPin size={14} className="text-muted-foreground" />
                  <Text className="text-xs text-muted-foreground">Dirección</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground mt-1" numberOfLines={1}>{USER.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} className="px-6 mb-6">
            <Text className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              {section.title}
            </Text>
            <View className="bg-card rounded-2xl p-4 shadow-sm border border-border">
              {section.items.map(renderMenuItem)}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View className="px-6 mb-6">
          <TouchableOpacity className="flex-row items-center justify-center gap-3 bg-destructive/10 py-4 rounded-2xl border border-destructive/20 active:opacity-80">
            <LogOut size={20} className="text-destructive" strokeWidth={2.5} />
            <Text className="text-destructive font-semibold">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center pb-6">
          <Text className="text-xs text-muted-foreground">Carnicería App v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}