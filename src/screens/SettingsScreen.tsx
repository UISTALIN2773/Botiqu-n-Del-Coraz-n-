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
  const [nextDateMeet, setNextDateMeet] = useState<string>(currentPrefs.nextDateMeet);
  const [selectedColor, setSelectedColor] = useState<string>(currentPrefs.widgetColor);
  const [selectedTheme, setSelectedTheme] = useState<any>(currentPrefs.themeName);
  const [hapticStrength, setHapticStrength] = useState<any>(currentPrefs.hapticStrength);
  const [isPinEnabled, setIsPinEnabled] = useState<boolean>(currentPrefs.isPinEnabled);
  const [pinCode, setPinCode] = useState<string>(currentPrefs.pinCode);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const themes = [
    { key: 'minimal_clean', name: 'Minimal Clean', desc: 'Blanco puro y rojo cereza' },
    { key: 'rose_gold', name: 'Rose Gold Romance', desc: 'Tonos rosados y dorados' },
    { key: 'midnight_star', name: 'Midnight Star', desc: 'Índigo oscuro nocturno' },
    { key: 'cozy_warmth', name: 'Cozy Warmth', desc: 'Ámbar cálido y papel artesanal' },
  ];

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
      nextDateMeet,
      widgetColor: selectedColor,
      themeName: selectedTheme,
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
        Configura los nombres, fechas, estilo visual y audios para tu pareja.
      </Text>

      {/* 1. Nombres y Fechas de Pareja */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nombres & Fechas Especiales</Text>

        <Text style={styles.label}>Nombre o Apodo de tu Pareja (quien recibe la app):</Text>
        <TextInput
          value={partnerName}
          onChangeText={setPartnerName}
          style={styles.input}
          placeholder="Ej: Mi Amor, Princesa, Cielo..."
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>Tu Nombre o Firma (quien graba y escribe):</Text>
        <TextInput
          value={senderName}
          onChangeText={setSenderName}
          style={styles.input}
          placeholder="Ej: Tu novio/a, Tu persona favorita..."
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>Fecha de Aniversario (AAAA-MM-DD):</Text>
        <TextInput
          value={anniversaryDate}
          onChangeText={setAnniversaryDate}
          style={styles.input}
          placeholder="2023-01-01"
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.label}>Próxima Fecha de Encuentro / Cita (AAAA-MM-DD):</Text>
        <TextInput
          value={nextDateMeet}
          onChangeText={setNextDateMeet}
          style={styles.input}
          placeholder="2026-09-15"
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* 2. Temas Visuales */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tema Visual de la Aplicación</Text>
        <View style={styles.themesGrid}>
          {themes.map((t) => {
            const isSelected = selectedTheme === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                activeOpacity={0.8}
                onPress={() => {
                  HapticsService.triggerSoftFeedback();
                  setSelectedTheme(t.key as any);
                }}
                style={[styles.themeBox, isSelected && styles.themeBoxSelected]}
              >
                <Text style={[styles.themeName, isSelected && styles.themeNameSelected]}>
                  {t.name}
                </Text>
                <Text style={styles.themeDesc}>{t.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Color del Widget y Acento */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Color de Acento del Widget</Text>
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

      {/* 4. Intensidad Háptica */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fuerza de Latido (Hápticos)</Text>
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

      {/* 5. Privacidad y Bloqueo PIN */}
      <View style={styles.card}>
        <View style={styles.pinToggleRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.cardTitle}>Bloqueo por PIN de Privacidad</Text>
            <Text style={styles.sublabel}>
              Protege el baúl y notas íntimas con clave de 4 dígitos. El widget seguirá disponible para emergencias.
            </Text>
          </View>
          <Switch
            value={isPinEnabled}
            onValueChange={(val) => {
              HapticsService.triggerSoftFeedback();
              setIsPinEnabled(val);
            }}
            thumbColor={isPinEnabled ? selectedColor : '#CBD5E1'}
          />
        </View>

        {isPinEnabled && (
          <View style={{ marginTop: 8 }}>
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

      {/* Audio & WhatsApp Guide Card */}
      <View style={styles.guideCard}>
        <Text style={styles.guideIcon}>🎙️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.guideTitle}>Audios y Notas de WhatsApp</Text>
          <Text style={styles.guideText}>
            Puedes añadir cartas y audios desde el Baúl de Recuerdos con el botón "+ Crear". Las notas de voz que envíes por WhatsApp también pueden guardarse en la memoria del teléfono para reproducirse sin internet.
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
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 6,
    marginBottom: 4,
  },
  sublabel: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  themeBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  themeBoxSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  themeName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  themeNameSelected: {
    color: '#FFFFFF',
  },
  themeDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  colorBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  hapticBtnActive: {
    backgroundColor: '#0F172A',
  },
  hapticBtnText: {
    fontSize: 10,
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
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
    marginBottom: 24,
  },
  guideIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  guideText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
});
