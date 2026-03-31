import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, MapPin, Check, Truck, Wallet } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

type PaymentMethod = 'card' | 'cash';

export default function PaymentScreen() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mock Card Data
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // Mock Order Data (In real app, this comes from Cart context/params)
  const orderTotal = 45.50;
  const deliveryFee = 2.99;
  const subtotal = 42.51;
  const address = '123 Calle Principal, Madrid, 28001';

  const handlePay = () => {
    if (paymentMethod === 'card') {
      if (!cardNumber || !expiry || !cvv || !cardHolder) {
        Alert.alert('Error', 'Por favor completa todos los datos de la tarjeta');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        '¡Pago Exitoso!',
        'Tu pedido ha sido confirmado y será enviado pronto.',
        [
          {
            text: 'Ver Mis Pedidos',
            onPress: () => router.replace('/(tabs)/orders'),
          },
        ]
      );
    }, 2000);
  };

  const formatCardNumber = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    // Limit to 16 digits
    const limited = cleaned.substring(0, 16);
    // Add spaces every 4 digits
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground flex-1">Finalizar Compra</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 200, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address */}
        <View className="bg-card rounded-2xl p-4 border border-border">
          <View className="flex-row items-center mb-3">
            <MapPin size={20} className="text-primary mr-2" />
            <Text className="font-semibold text-foreground">Dirección de Entrega</Text>
          </View>
          <Text className="text-muted-foreground text-sm leading-relaxed">
            {address}
          </Text>
          <TouchableOpacity className="mt-3">
            <Text className="text-primary font-semibold text-sm">Cambiar dirección</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method Selection */}
        <View>
          <Text className="text-lg font-bold text-foreground mb-3">Método de Pago</Text>
          
          {/* Card Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('card')}
            className={`flex-row items-center justify-between p-4 rounded-2xl border-2 mb-3 ${
              paymentMethod === 'card' 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-card'
            }`}
          >
            <View className="flex-row items-center">
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                paymentMethod === 'card' ? 'bg-primary' : 'bg-muted'
              }`}>
                <CreditCard size={20} className={paymentMethod === 'card' ? 'text-white' : 'text-muted-foreground'} />
              </View>
              <View>
                <Text className="font-semibold text-foreground">Tarjeta de Crédito/Débito</Text>
                <Text className="text-xs text-muted-foreground">Visa, Mastercard, Maestro</Text>
              </View>
            </View>
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              paymentMethod === 'card' ? 'border-primary' : 'border-border'
            }`}>
              {paymentMethod === 'card' && <View className="w-3 h-3 rounded-full bg-primary" />}
            </View>
          </TouchableOpacity>

          {/* Cash Option */}
          <TouchableOpacity
            onPress={() => setPaymentMethod('cash')}
            className={`flex-row items-center justify-between p-4 rounded-2xl border-2 mb-3 ${
              paymentMethod === 'cash' 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-card'
            }`}
          >
            <View className="flex-row items-center">
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                paymentMethod === 'cash' ? 'bg-primary' : 'bg-muted'
              }`}>
                <Wallet size={20} className={paymentMethod === 'cash' ? 'text-white' : 'text-muted-foreground'} />
              </View>
              <View>
                <Text className="font-semibold text-foreground">Efectivo al Entregar</Text>
                <Text className="text-xs text-muted-foreground">Paga cuando recibas tu pedido</Text>
              </View>
            </View>
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              paymentMethod === 'cash' ? 'border-primary' : 'border-border'
            }`}>
              {paymentMethod === 'cash' && <View className="w-3 h-3 rounded-full bg-primary" />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Card Details Form */}
        {paymentMethod === 'card' && (
          <View className="bg-card rounded-2xl p-5 border border-border">
            <Text className="font-semibold text-foreground mb-4">Datos de la Tarjeta</Text>
            
            <View className="space-y-4">
              <View>
                <Text className="text-sm text-muted-foreground mb-2">Número de Tarjeta</Text>
                <TextInput
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                  maxLength={19}
                  className="bg-input border border-border rounded-xl px-4 py-3 text-foreground"
                />
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-2">Titular de la Tarjeta</Text>
                <TextInput
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  placeholder="NOMBRE APELLIDO"
                  autoCapitalize="characters"
                  className="bg-input border border-border rounded-xl px-4 py-3 text-foreground"
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm text-muted-foreground mb-2">Fecha de Expiración</Text>
                  <TextInput
                    value={expiry}
                    onChangeText={(text) => setExpiry(formatExpiry(text))}
                    placeholder="MM/AA"
                    keyboardType="numeric"
                    maxLength={5}
                    className="bg-input border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-muted-foreground mb-2">CVV</Text>
                  <TextInput
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                    className="bg-input border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View className="bg-card rounded-2xl p-5 border border-border">
          <Text className="font-semibold text-foreground mb-4">Resumen del Pedido</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Subtotal</Text>
              <Text className="text-foreground">€{subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Envío</Text>
              <Text className="text-foreground">€{deliveryFee.toFixed(2)}</Text>
            </View>
            <View className="h-px bg-border my-2" />
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-foreground">Total</Text>
              <Text className="text-2xl font-bold text-primary">€{orderTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-6 rounded-t-3xl shadow-2xl">
        <TouchableOpacity
          onPress={handlePay}
          disabled={isProcessing}
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
              opacity: isProcessing ? 0.7 : 1
            }}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : (
              <Check size={20} className="text-white mr-2" />
            )}
            <Text className="text-white font-bold text-lg">
              {isProcessing ? 'Procesando...' : `Pagar €${orderTotal.toFixed(2)}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}