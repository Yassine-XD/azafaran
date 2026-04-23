import React from "react";
import { View, Text, TouchableOpacity, Alert, Image, Platform } from "react-native";
import { Paperclip, Image as ImageIcon, FileText, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import type { LocalAttachment } from "@/lib/tickets";

const MAX_FILES = 5;
const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

type Props = {
  value: LocalAttachment[];
  onChange: (next: LocalAttachment[]) => void;
  pickLabel?: string;
};

function extToMime(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext) return "application/octet-stream";
  if (["jpg", "jpeg"].includes(ext)) return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";
  if (ext === "heif") return "image/heif";
  if (ext === "pdf") return "application/pdf";
  return "application/octet-stream";
}

export default function TicketAttachmentPicker({
  value,
  onChange,
  pickLabel = "Adjuntar",
}: Props) {
  const remaining = MAX_FILES - value.length;

  const warnLimit = () =>
    Alert.alert("Límite", `Puedes adjuntar un máximo de ${MAX_FILES} archivos`);
  const warnSize = () =>
    Alert.alert("Archivo demasiado grande", "El tamaño máximo por archivo es 8 MB");

  const addMany = (files: LocalAttachment[]) => {
    if (files.length === 0) return;
    const validSize = files.filter((f) => !f.size || f.size <= MAX_SIZE_BYTES);
    if (validSize.length < files.length) warnSize();
    const free = MAX_FILES - value.length;
    const accepted = validSize.slice(0, Math.max(free, 0));
    if (validSize.length > free) warnLimit();
    if (accepted.length) onChange([...value, ...accepted]);
  };

  const pickImages = async () => {
    if (remaining <= 0) return warnLimit();
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (result.canceled) return;
    const files: LocalAttachment[] = (result.assets || []).map((a) => {
      const name = a.fileName || a.uri.split("/").pop() || "image.jpg";
      const mimeType =
        a.mimeType && ALLOWED_IMAGE_MIMES.includes(a.mimeType)
          ? a.mimeType
          : extToMime(name);
      return { uri: a.uri, name, mimeType, size: a.fileSize };
    });
    addMany(files);
  };

  const pickDocument = async () => {
    if (remaining <= 0) return warnLimit();
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const files: LocalAttachment[] = (result.assets || []).map((a) => {
      const name = a.name || a.uri.split("/").pop() || "file";
      const mimeType = a.mimeType || extToMime(name);
      return { uri: a.uri, name, mimeType, size: a.size ?? undefined };
    });
    addMany(files);
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={pickImages}
          disabled={remaining <= 0}
          className="flex-row items-center gap-2 bg-muted px-3 py-2 rounded-xl border border-border"
          style={{ opacity: remaining <= 0 ? 0.5 : 1 }}
        >
          <ImageIcon size={18} color="#ea580c" />
          <Text className="text-foreground text-sm font-medium">Fotos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={pickDocument}
          disabled={remaining <= 0}
          className="flex-row items-center gap-2 bg-muted px-3 py-2 rounded-xl border border-border"
          style={{ opacity: remaining <= 0 ? 0.5 : 1 }}
        >
          <Paperclip size={18} color="#ea580c" />
          <Text className="text-foreground text-sm font-medium">PDF</Text>
        </TouchableOpacity>
        <View className="flex-1 justify-center">
          <Text className="text-xs text-muted-foreground text-right">
            {value.length}/{MAX_FILES}
          </Text>
        </View>
      </View>

      {value.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-3">
          {value.map((f, idx) => (
            <View
              key={`${f.uri}-${idx}`}
              className="relative bg-muted rounded-xl border border-border overflow-hidden"
              style={{ width: 80, height: 80 }}
            >
              {f.mimeType.startsWith("image/") ? (
                <Image
                  source={{ uri: f.uri }}
                  style={{ width: 80, height: 80 }}
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center p-2">
                  <FileText size={22} color="#ea580c" />
                  <Text
                    className="text-[10px] text-foreground mt-1 text-center"
                    numberOfLines={2}
                  >
                    {f.name}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => remove(idx)}
                className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5"
                hitSlop={6}
              >
                <X size={12} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export { MAX_FILES, MAX_SIZE_BYTES };
