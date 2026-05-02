import { useEffect, useState } from "react";
import { ScrollView, View, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ArrowLeft, Check, Plus } from "lucide-react-native";

import { Display, Heading2, Heading3, Body, Small, Caption } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useStripePay } from "@/hooks/useStripePay";
import type { Address } from "@/lib/types";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal, appliedPromo, clearCart } = useCart();
  const { payWithCard, CardField } = useStripePay();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addingAddress, setAddingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  const total = subtotal - (appliedPromo?.discount_amount ?? 0);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    const r = await api.get<Address[]>("/users/me/addresses");
    setLoadingAddresses(false);
    if (r.success && r.data) {
      setAddresses(r.data);
      const defaultAddr = r.data.find((a) => a.is_default) ?? r.data[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    }
  };

  const onSubmit = async () => {
    if (!selectedAddressId) {
      Alert.alert("Selecciona una dirección", "Necesitamos una dirección de entrega.");
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      // 1. Place order (no payment_ref yet — Stripe webhook will mark paid)
      const orderRes = await api.post<{ id: string }>("/orders", {
        address_id: selectedAddressId,
        payment_method: "card",
        delivery_notes: notes || undefined,
        promo_code: appliedPromo?.code,
      });
      if (!orderRes.success || !orderRes.data) {
        Alert.alert("No se pudo crear el pedido", orderRes.error?.message || "Inténtalo de nuevo");
        setSubmitting(false);
        return;
      }

      // 2. Create Stripe payment intent
      const intentRes = await api.post<{ clientSecret: string }>("/payments/intent", {
        orderId: orderRes.data.id,
        currency: "eur",
      });
      if (!intentRes.success || !intentRes.data?.clientSecret) {
        Alert.alert("Error de pago", intentRes.error?.message || "Inténtalo de nuevo");
        setSubmitting(false);
        return;
      }

      // 3. Pay
      const payRes = await payWithCard(intentRes.data.clientSecret, user);
      if (!payRes.success) {
        if (!payRes.cancelled) {
          Alert.alert("Pago fallido", payRes.error || "Inténtalo de nuevo");
        }
        setSubmitting(false);
        return;
      }

      // 4. Success
      await clearCart();
      router.replace("/(tabs)/orders");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Inténtalo de nuevo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-5 py-3 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-muted"
        >
          <ArrowLeft size={20} color="#0B0B0C" strokeWidth={2} />
        </Pressable>
        <Display>Pago</Display>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="px-5 pb-32">
          {/* Address selector */}
          <View className="mt-4">
            <Heading2>Dirección de entrega</Heading2>
            {loadingAddresses ? (
              <View className="mt-3 gap-2">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </View>
            ) : addresses.length === 0 || addingAddress ? (
              <AddAddressForm
                onCreated={async () => {
                  setAddingAddress(false);
                  await fetchAddresses();
                }}
                onCancel={addresses.length > 0 ? () => setAddingAddress(false) : undefined}
              />
            ) : (
              <View className="mt-3 gap-2">
                {addresses.map((a) => {
                  const active = a.id === selectedAddressId;
                  return (
                    <Pressable
                      key={a.id}
                      onPress={() => setSelectedAddressId(a.id)}
                      className={`flex-row items-start gap-3 p-4 rounded-2xl border ${
                        active ? "border-primary bg-surface" : "border-border bg-card"
                      } active:opacity-80`}
                    >
                      <View
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 ${
                          active ? "border-primary" : "border-border"
                        } items-center justify-center`}
                      >
                        {active ? <View className="w-2.5 h-2.5 rounded-full bg-primary" /> : null}
                      </View>
                      <View className="flex-1">
                        <Body className="font-body-semibold">{a.label}</Body>
                        <Small className="text-muted-foreground">
                          {a.street}, {a.postcode} {a.city}
                        </Small>
                      </View>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => setAddingAddress(true)}
                  className="flex-row items-center gap-2 px-4 h-12 rounded-2xl border border-dashed border-border active:opacity-80"
                >
                  <Plus size={16} color="#0B0B0C" strokeWidth={2} />
                  <Small className="font-body-semibold">Añadir nueva dirección</Small>
                </Pressable>
              </View>
            )}
          </View>

          {/* Notes */}
          <View className="mt-6">
            <Heading3>Notas para el repartidor</Heading3>
            <View className="mt-2 px-4 py-3 rounded-xl bg-card border border-border">
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Opcional"
                placeholderTextColor="#A1A1A6"
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                  color: "#0B0B0C",
                  minHeight: 60,
                  textAlignVertical: "top",
                }}
              />
            </View>
          </View>

          {/* Card field — web only renders, native uses Payment Sheet */}
          {CardField ? (
            <View className="mt-6">
              <Heading2>Datos de pago</Heading2>
              <View className="mt-3 p-4 rounded-2xl border border-border bg-card">
                <CardField />
              </View>
            </View>
          ) : null}

          {/* Summary */}
          <View className="mt-6 p-4 rounded-2xl bg-surface border border-border">
            <Heading3 className="mb-3">Resumen</Heading3>
            <View className="flex-row justify-between">
              <Body className="text-muted-foreground">Subtotal</Body>
              <Body className="font-mono-medium">{fmt(subtotal)}</Body>
            </View>
            {appliedPromo ? (
              <View className="mt-2 flex-row justify-between">
                <Body className="text-halal">Descuento</Body>
                <Body className="font-mono-medium text-halal">
                  −{fmt(appliedPromo.discount_amount)}
                </Body>
              </View>
            ) : null}
            <View className="mt-3 pt-3 border-t border-border flex-row justify-between items-baseline">
              <Heading3>Total</Heading3>
              <Body className="font-mono-semibold text-h2">{fmt(total)}</Body>
            </View>
          </View>
        </ScrollView>

        {/* Sticky CTA */}
        <View className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-6 bg-background border-t border-border shadow-sticky">
          <Button
            title={submitting ? "Procesando…" : `Pagar ${fmt(total)}`}
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!selectedAddressId || items.length === 0}
            leftIcon={!submitting ? <Check size={18} color="#FFFFFF" strokeWidth={2.5} /> : undefined}
            onPress={onSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AddAddressForm({ onCreated, onCancel }: { onCreated: () => void; onCancel?: () => void }) {
  const [form, setForm] = useState({
    label: "Casa",
    street: "",
    city: "",
    postcode: "",
    province: "",
    country: "ES",
    instructions: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const valid = form.street.trim() && form.city.trim() && form.postcode.trim() && form.province.trim();

  const onSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    const r = await api.post<Address>("/users/me/addresses", form);
    setSubmitting(false);
    if (r.success) {
      onCreated();
    } else {
      Alert.alert("Error", r.error?.message || "No se pudo guardar la dirección");
    }
  };

  return (
    <View className="mt-3 gap-3">
      <Field label="Etiqueta" value={form.label} onChange={(v) => set("label", v)} />
      <Field label="Calle y número" value={form.street} onChange={(v) => set("street", v)} />
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Field label="Código postal" value={form.postcode} onChange={(v) => set("postcode", v)} keyboardType="number-pad" />
        </View>
        <View className="flex-1">
          <Field label="Ciudad" value={form.city} onChange={(v) => set("city", v)} />
        </View>
      </View>
      <Field label="Provincia" value={form.province} onChange={(v) => set("province", v)} />
      <View className="flex-row gap-2 mt-2">
        <Button
          title={submitting ? "Guardando…" : "Guardar dirección"}
          variant="primary"
          size="md"
          loading={submitting}
          disabled={!valid}
          onPress={onSubmit}
        />
        {onCancel ? <Button title="Cancelar" variant="secondary" size="md" onPress={onCancel} /> : null}
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View>
      <Caption className="uppercase tracking-wide text-muted-foreground mb-1">{label}</Caption>
      <View className="px-4 h-11 rounded-xl bg-card border border-border justify-center">
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          style={{ fontFamily: "Inter_400Regular", fontSize: 15, color: "#0B0B0C" }}
          placeholderTextColor="#A1A1A6"
        />
      </View>
    </View>
  );
}
