import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export function Header({ title, showBack = true }: HeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-6 py-4 bg-background border-b border-border">
      <View className="flex-row items-center gap-4 flex-1">
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} className="active:opacity-70">
            <ArrowLeft size={24} className="text-foreground" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
        <Text className="text-xl font-bold text-foreground flex-1" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <ThemeToggle />
    </View>
  );
}