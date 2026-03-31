import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      // Simple validation feedback
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to home tabs
      router.replace('/(tabs)');
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          className="px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Brand Area */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-4 shadow-lg">
              <LogIn size={40} className="text-primary-foreground" />
            </View>
            <Text className="text-3xl font-bold text-foreground">Bienvenido</Text>
            <Text className="text-muted-foreground mt-2 text-center">
              Inicia sesión para continuar con tus pedidos
            </Text>
          </View>

          {/* Form */}
          <View className="gap-5">
            {/* Email Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground ml-1">Correo Electrónico</Text>
              <View className="flex-row items-center bg-input rounded-xl px-4 py-3 border border-border">
                <Mail size={20} className="text-muted-foreground mr-3" />
                <TextInput
                  className="flex-1 text-foreground text-base"
                  placeholder="tu@email.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center ml-1">
                <Text className="text-sm font-medium text-foreground">Contraseña</Text>
                <TouchableOpacity>
                  <Text className="text-sm text-primary font-medium">¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center bg-input rounded-xl px-4 py-3 border border-border">
                <Lock size={20} className="text-muted-foreground mr-3" />
                <TextInput
                  className="flex-1 text-foreground text-base"
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} className="text-muted-foreground" />
                  ) : (
                    <Eye size={20} className="text-muted-foreground" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-primary rounded-xl py-4 flex-row items-center justify-center shadow-md mt-4 active:scale-[0.98] transition-transform"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-primary-foreground font-semibold text-lg mr-2">
                    Iniciar Sesión
                  </Text>
                  <LogIn size={20} className="text-primary-foreground" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-2">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-muted-foreground text-sm">o continúa con</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Social Login */}
            <View className="flex-row gap-4">
              <TouchableOpacity className="flex-1 bg-card border border-border rounded-xl py-3 flex-row items-center justify-center shadow-sm">
                <Text className="text-foreground font-semibold">G</Text>
                <Text className="text-foreground font-semibold ml-1">oogle</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-card border border-border rounded-xl py-3 flex-row items-center justify-center shadow-sm">
                <Text className="text-foreground font-semibold">Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Link */}
          <View className="mt-10 items-center">
            <Text className="text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text className="text-primary font-bold">Regístrate</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}