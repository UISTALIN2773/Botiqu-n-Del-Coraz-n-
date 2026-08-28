import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { storageService } from '../modules/storageService';
import { WidgetBridge } from '../modules/widgetBridge';
import { HapticsService } from '../modules/hapticsService';

export const SettingsScreen: React.FC = () => {
  const currentPrefs = storageService.getPreferences();

  const [partnerName, setPartnerName] = useState<string>(currentPrefs.partnerName);
  const [senderName, setSenderName] = useState<string>(currentPrefs.senderName);
  const [anniversaryDate, setAnniversaryDate] = useState<string>(currentPrefs.anniversaryDate);
  const [selectedColor, setSelectedColor] = useState<string>(currentPrefs.widgetColor);
  const [hapticStrength, setHapticStrength] = useState<any>(currentPrefs.hapticStrength);
  const [isPinEnabled, setIsPinEnabled] = useState<boolean>(currentPrefs.isPinEnabled);
  const [pinCode, setPinCode] = useState<string>(currentPrefs.pinCode);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const colorPalette = [
    { name: 'Rojo Pasión', hex: '#E11D48' },
    { name: 'Rosa Pastel', hex: '#FB7185' },
    { name: 'Azul Calma', hex: '#0EA5E9' },
    { name: 'Morado Neón', hex: '#8B5CF6' },
    { name: 'Esmeralda', hex: '#10B981' },
    { name: 'Ámbar Cálido', hex: '#F59E0B' },
  ];

  const handleSave = () => {
    storageService.updatePreferences({
      partnerName,
      senderName,
      anniversaryDate,
      widgetColor: selectedColor,
      hapticStrength,
      isPinEnabled,
      pinCode,
    });

    WidgetBridge.updateWidgetData();
    HapticsService.triggerSuccessFeedback();
    setSaveMessage('¡Ajustes guardados y sincronizados con el Widget!');
    setTimeout(() => setSaveMessage(''), 3500);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Personalización & Ajustes ⚙️</Text>
      <Text style={styles.subheading}>
        Configura los nombres, fechas y el estilo visual para ti y tu pareja.
      </Text>

      {/* 1. Nombres y Relación */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nombres & Saludo</Text>

        <Text style={styles.label}>Nombre o Apodo de tu Pareja (quien recibe):</Text>
        <TextInput
          value={partnerName}
          onChangeText={setPartnerName}
          style={styles.input}
          placeholder="Ej: Mi Amor, Princesa, Osito..."
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>Tu Nombre o Firma (quien graba/escribe):</Text>
        <TextInput
          value={senderName}
          onChangeText={setSenderName}
          style={styles.input}
          placeholder="Ej: Tu novio/a, Tu persona favorita..."
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>Fecha de Inicio de Relación (AAAA-MM-DD):</Text>
        <TextInput
          value={anniversaryDate}
          onChangeText={setAnniversaryDate}
          style={styles.input}
          placeholder="2023-01-01"
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* 2. Personalización del Widget */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Color y Estilo del Corazón</Text>
        <Text style={styles.sublabel}>Selecciona el color de acento del Widget y la App:</Text>

        <View style={styles.colorsRow}>
          {colorPalette.map((color) => {
            const isSelected = selectedColor === color.hex;
            return (
              <TouchableOpacity
                key={color.hex}
                activeOpacity={0.8}
                onPress={() => {
                  HapticsService.triggerSoftFeedback();
                  setSelectedColor(color.hex);
                }}
                style={[
                  styles.colorBubble,
                  { backgroundColor: color.hex },
                  isSelected && styles.colorBubbleSelected,
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* 3. Fuerza de Vibración Háptica */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fuerza de Latido (Hápticos)</Text>
        <Text style={styles.sublabel}>Ajusta la intensidad de vibración "Lub-Dub":</Text>

        <View style={styles.hapticRow}>
          {(['suave', 'normal', 'fuerte', 'desactivado'] as const).map((level) => {
            const isSelected = hapticStrength === level;
            return (
              <TouchableOpacity
                key={level}
                activeOpacity={0.8}
                onPress={() => {
                  setHapticStrength(level);
                  storageService.updatePreferences({ hapticStrength: level });
                  HapticsService.triggerHeartbeat();
                }}
                style={[styles.hapticBtn, isSelected && styles.hapticBtnActive]}
              >
                <Text style={[styles.hapticBtnText, isSelected && styles.hapticBtnTextActive]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Privacidad y Seguridad (PIN Opcional) */}
      <View style={styles.card}>
        <View style={styles.pinToggleRow}>
          <View style={styles.pinCol}>
            <Text style={styles.cardTitle}>Bloqueo por PIN de Privacidad</Text>
            <Text style={styles.sublabel}>
              Protege el baúl de cartas y recuerdos con clave (el widget sigue abriendo en emergencias).
            </Text>
          </View>
          <Switch
            value={isPinEnabled}
            onValueChange={(val) => {
              HapticsService.triggerSoftFeedback();
              setIsPinEnabled(val);
            }}
            thumbColor={isPinEnabled ? '#E11D48' : '#CBD5E1'}
          />
        </View>

        {isPinEnabled && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Código PIN de 4 dígitos:</Text>
            <TextInput
              value={pinCode}
              onChangeText={setPinCode}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              style={styles.input}
              placeholder="1234"
              placeholderTextColor="#94A3B8"
            />
          </View>
        )}
      </View>

      {/* Save Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleSave}
        style={[styles.saveBtn, { backgroundColor: selectedColor }]}
      >
        <Text style={styles.saveBtnText}>Guardar y Sincronizar Cambios</Text>
      </TouchableOpacity>

      {saveMessage ? <Text style={styles.saveMsgText}>{saveMessage}</Text> : null}

      {/* Offline Status Badge */}
      <View style={styles.offlineCard}>
        <Text style={styles.offlineIcon}>🔒</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.offlineTitle}>100% Offline y Privado</Text>
          <Text style={styles.offlineSub}>
            Todos los audios, recuerdos y textos se guardan estrictamente en tu dispositivo. Cero servidores externos.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subheading: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 8,
    marginBottom: 4,
  },
  sublabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 16,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  colorBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  colorBubbleSelected: {
    borderWidth: 3,
    borderColor: '#0F172A',
    transform: [{ scale: 1.15 }],
  },
  hapticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  hapticBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  hapticBtnActive: {
    backgroundColor: '#0F172A',
  },
  hapticBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  hapticBtnTextActive: {
    color: '#FFFFFF',
  },
  pinToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pinCol: {
    flex: 1,
    marginRight: 10,
  },
  saveBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  saveMsgText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    padding: 14,
    marginTop: 20,
    marginBottom: 20,
  },
  offlineIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  offlineTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  offlineSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
});
