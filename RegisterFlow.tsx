import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { ScreenKey } from "../../App";

export default function RegisterFlow({ onNavigate }: { onNavigate: (s: ScreenKey) => void }) {
  const [step, setStep] = useState(1);
  const total = 5;

  function nextStep() {
    if (step < total) setStep(step + 1);
    else onNavigate("main");
  }
  function prevStep() {
    if (step > 1) setStep(step - 1);
    else onNavigate("welcome");
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra de Progresso e Voltar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={prevStep}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.progress}>
          <View style={[styles.progressBar, { width: `${(step / total) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 && (
          <View>
            <Text style={styles.title}>Seus dados de acesso</Text>
            <TextInput
              placeholder="Seu melhor e-mail"
              style={styles.input}
              keyboardType="email-address"
              placeholderTextColor="#6b7280"
            />
            <TextInput
              placeholder="Crie uma palavra-passe segura"
              style={styles.input}
              secureTextEntry
              placeholderTextColor="#6b7280"
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.title}>Como podemos chamá-lo?</Text>
            <TextInput
              placeholder="Primeiro nome"
              style={styles.input}
              placeholderTextColor="#6b7280"
            />
            <Text style={styles.label}>Data de nascimento</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              style={styles.input}
              placeholderTextColor="#6b7280"
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.title}>Mostre o seu melhor lado</Text>
            <Text style={styles.subtitle}>Adicione pelo menos 2 fotos.</Text>
            <View style={styles.photoGrid}>
              <TouchableOpacity style={styles.photoBig}>
                <Text style={styles.plusIcon}>+</Text>
              </TouchableOpacity>
              <View style={styles.photoRow}>
                <TouchableOpacity style={styles.photoSmall}>
                  <Text style={styles.plusIconSmall}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoSmall}>
                  <Text style={styles.plusIconSmall}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoSmall}>
                  <Text style={styles.plusIconSmall}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.title}>Fale um pouco sobre si</Text>
            <TextInput
              placeholder="O que você gosta de fazer? Seja criativo!"
              style={[styles.input, { height: 160, textAlignVertical: "top" }]} // rows="6"
              multiline
              placeholderTextColor="#6b7280"
            />
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={styles.title}>Quais são os seus interesses?</Text>
            <Text style={styles.subtitle}>Escolha pelo menos 3.</Text>
            <View style={styles.tagsRow}>
              <TouchableOpacity style={styles.tag}>
                <Text style={styles.tagText}>Fotografia</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tag}>
                <Text style={styles.tagText}>Viagens</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tag}>
                <Text style={styles.tagText}>Música</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botão flutuante */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
          <Text style={styles.nextText}>{step < total ? "Continuar" : "Finalizar Cadastro"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    paddingTop: 24, // pt-6
    paddingHorizontal: 24, // px-6
  },
  back: {
    position: "absolute",
    top: 24, // top-6
    left: 24, // left-6
    zIndex: 10,
    padding: 8,
  },
  backText: {
    fontSize: 28,
    color: "#6b7280", // text-gray-500
  },
  progress: {
    backgroundColor: "#e5e7eb", // bg-gray-200
    borderRadius: 999,
    height: 6, // h-1.5
    overflow: "hidden",
  },
  progressBar: {
    height: 6, // h-1.5
    backgroundColor: "#4f46e5", // bg-indigo-600
    borderRadius: 999,
  },
  content: {
    padding: 32, // p-8
    paddingBottom: 100, // Espaço para o botão
  },
  title: {
    fontSize: 24, // text-2xl
    fontWeight: "700", // font-bold
    marginBottom: 24, // mb-6
    color: "#111827", // text-gray-900
  },
  input: {
    backgroundColor: "#f3f4f6", // bg-gray-100
    padding: 16, // p-4
    borderRadius: 8, // rounded-lg
    marginBottom: 16, // mb-4
    fontSize: 16,
    color: "#111827",
  },
  label: {
    color: "#6b7280", // text-gray-500
    marginBottom: 8, // mb-2
    fontSize: 14, // text-sm
  },
  subtitle: {
    color: "#6b7280", // text-gray-500
    marginBottom: 24, // mb-6
    fontSize: 16,
  },
  // Photo Grid
  photoGrid: {
    gap: 8, // gap-2 (requer RN 0.71+)
  },
  photoBig: {
    width: "100%",
    height: 160, // h-40
    backgroundColor: "#e5e7eb", // bg-gray-200
    borderRadius: 8, // rounded-lg
    alignItems: "center",
    justifyContent: "center",
  },
  plusIcon: {
    fontSize: 32, // w-8 h-8
    color: "#9ca3af", // text-gray-400
  },
  photoRow: {
    flexDirection: "row",
    gap: 8, // gap-2
    justifyContent: "space-between",
  },
  photoSmall: {
    flex: 1, // Para dividir espaço
    height: 100, // h-24
    backgroundColor: "#e5e7eb", // bg-gray-200
    borderRadius: 8, // rounded-lg
    alignItems: "center",
    justifyContent: "center",
  },
  plusIconSmall: {
    fontSize: 24, // w-6 h-6
    color: "#9ca3af", // text-gray-400
  },
  // Tags
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12, // gap-3
  },
  tag: {
    backgroundColor: "#e5e7eb", // bg-gray-200
    paddingVertical: 8, // py-2
    paddingHorizontal: 16, // px-4
    borderRadius: 999, // rounded-full
  },
  tagText: {
    color: "#374151", // text-gray-800
    fontWeight: "600", // font-semibold
  },
  // Footer Button
  footer: {
    padding: 32, // p-8
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
  },
  nextBtn: {
    backgroundColor: "#4f46e5", // bg-indigo-600
    paddingVertical: 16, // py-4
    borderRadius: 12, // rounded-xl
    alignItems: "center",
  },
  nextText: {
    color: "#fff",
    fontWeight: "700", // font-bold
    fontSize: 18, // text-lg
  },
});