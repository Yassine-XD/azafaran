import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Mail, Lock, Eye, EyeOff, Phone } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsLoading(true);
    const result = await register({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
    });
    setIsLoading(false);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", result.error || "No se pudo crear la cuenta");
    }
  };

  const inputClass = "flex-row items-center bg-card border border-border rounded-xl px-4 py-3";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-4xl font-bold text-primary mb-2">Crear Cuenta</Text>
            <Text className="text-muted-foreground text-base">Únete a Azafaran</Text>
          </View>

          {/* Name Row */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <View className={inputClass}>
                <User size={20} className="text-muted-foreground mr-3" />
                <TextInput
                  className="flex-1 text-foreground text-base"
                  placeholder="Nombre"
                  placeholderTextColor="#a8a29e"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>
            <View className="flex-1">
              <View className={inputClass}>
                <TextInput
                  className="flex-1 text-foreground text-base"
                  placeholder="Apellido"
                  placeholderTextColor="#a8a29e"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
            <View className={inputClass}>
              <Mail size={20} className="text-muted-foreground mr-3" />
              <TextInput
                className="flex-1 text-foreground text-base"
                placeholder="Email"
                placeholderTextColor="#a8a29e"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Phone */}
          <View className="mb-4">
            <View className={inputClass}>
              <Phone size={20} className="text-muted-foreground mr-3" />
              <TextInput
                className="flex-1 text-foreground text-base"
                placeholder="Teléfono (+34...)"
                placeholderTextColor="#a8a29e"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-4">
            <View className={inputClass}>
              <Lock size={20} className="text-muted-foreground mr-3" />
              <TextInput
                className="flex-1 text-foreground text-base"
                placeholder="Contraseña"
                placeholderTextColor="#a8a29e"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} className="text-muted-foreground" /> : <Eye size={20} className="text-muted-foreground" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-6">
            <View className={inputClass}>
              <Lock size={20} className="text-muted-foreground mr-3" />
              <TextInput
                className="flex-1 text-foreground text-base"
                placeholder="Confirmar Contraseña"
                placeholderTextColor="#a8a29e"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity onPress={handleRegister} disabled={isLoading} className="bg-primary py-4 rounded-xl items-center mb-4">
            {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-primary-foreground font-bold text-lg">Crear Cuenta</Text>}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-muted-foreground">¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text className="text-primary font-semibold">Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
