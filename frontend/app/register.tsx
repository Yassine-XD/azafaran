import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleRegister = async () => {
    // Simple validation
    if (!name || !email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to login screen upon success
      router.replace('/login');
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
              <UserPlus size={40} className="text-primary-foreground" />
            </View>
            <Text className="text-3xl font-bold text-foreground">Crear Cuenta</Text>
            <Text className="text-muted-foreground mt-2 text-center">
              Regístrate para comenzar a pedir
            </Text>
          </View>

          {/* Form */}
          <View className="gap-5">
            {/* Name Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground ml-1">Nombre Completo</Text>
              <View className="flex-row items-center bg-input rounded-xl px-4 py-3 border border-border">
                <User size={20} className="text-muted-foreground mr-3" />
                <TextInput
                  className="flex-1 text-foreground text-base"
                  placeholder="Juan Pérez"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

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
              <Text className="text-sm font-medium text-foreground ml-1">Contraseña</Text>
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

            {/* Confirm Password Input */}
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground ml-1">Confirmar Contraseña</Text>
              <View className="flex-row items-center bg-input rounded-xl px-4 py-3 border border-border">
                <Lock size={20} className="text-muted-foreground mr-3" />
                <TextInput
                  className="flex-1 text-foreground text-base"
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} className="text-muted-foreground" />
                  ) : (
                    <Eye size={20} className="text-muted-foreground" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="bg-primary rounded-xl py-4 flex-row items-center justify-center shadow-md mt-4 active:scale-[0.98] transition-transform"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-primary-foreground font-semibold text-lg mr-2">
                    Registrarse
                  </Text>
                  <UserPlus size={20} className="text-primary-foreground" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-2">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-muted-foreground text-sm">o regístrate con</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Social Register */}
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

          {/* Login Link */}
          <View className="mt-10 items-center">
            <Text className="text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text className="text-primary font-bold">Inicia Sesión</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}