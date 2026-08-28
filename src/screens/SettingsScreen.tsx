import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
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

  // Backup / Restore Modal State
  const [isBackupModalVisible, setIsBackupModalVisible] = useState<boolean>(false);
  const [backupText, setBackupText] = useState<string>('');
  const [backupNotice, setBackupNotice] = useState<string>('');

  const themes = [
    { key: 'minimal_clean', name: 'Minimal Clean', desc: 'Blanco puro y rojo cereza' },
    { key: 'rose_gold', name: 'Rose Gold Romance', desc: 'Tonos rosados y dorados' },
    { key: 'midnight_star', name: 'OLED Black 🌙', desc: 'Negro puro #000000 para no deslumbrar' },
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

  const handleOpenExport = () => {
    const json = storageService.exportDataJSON();
    setBackupText(json);
    setBackupNotice('Copia y guarda este texto en tus notas para no perder nada si cambias de móvil.');
    setIsBackupModalVisible(true);
  };

  const handleImport = () => {
    if (!backupText.trim()) return;
    const success = storageService.importDataJSON(backupText);
    if (success) {
      HapticsService.triggerSuccessFeedback();
      setBackupNotice('¡Respaldo restaurado con éxito!');
      setTimeout(() => setIsBackupModalVisible(false), 1500);
    } else {
      setBackupNotice('Error: Formato de respaldo JSON no válido.');
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Personalización & Ajustes ⚙️</Text>
      <Text style={styles.subheading}>
        Configura los nombres, fechas, estilo visual, respaldo y temas para tu pareja.
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

      {/* 2. Temas Visuales con OLED Black */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tema Visual & Modo Nocturno</Text>
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

      {/* 4. Intensidad Háptica con Protección Térmica */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fuerza de Latido (Hápticos)</Text>
        <Text style={styles.sublabel}>
          Incluye apagado térmico automático a los 15 minutos en el simulador para cuidar la batería.
        </Text>
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
              Protege el baúl y notas íntimas con clave de 4 dígitos.
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

      {/* 6. Respaldo y Exportación Local */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Respaldo de Recuerdos (.json) 💾</Text>
        <Text style={styles.sublabel}>
          Exporta o restaura tus cartas y metas para no perder nada al cambiar de celular.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleOpenExport}
          style={styles.backupBtn}
        >
          <Text style={styles.backupBtnText}>Exportar o Restaurar Respaldo</Text>
        </TouchableOpacity>
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

      {/* Backup Modal */}
      <Modal visible={isBackupModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Copia de Seguridad de Recuerdos</Text>
            <Text style={styles.modalSub}>{backupNotice}</Text>

            <TextInput
              value={backupText}
              onChangeText={setBackupText}
              multiline
              numberOfLines={8}
              style={styles.backupTextArea}
              placeholder="Pega aquí tu código JSON de respaldo..."
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setIsBackupModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleImport}
                style={styles.modalImportBtn}
              >
                <Text style={styles.modalImportText}>Restaurar Datos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backupBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  backupBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginVertical: 6,
    lineHeight: 16,
  },
  backupTextArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 12,
    fontSize: 11,
    height: 140,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  modalCancelText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 13,
  },
  modalImportBtn: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  modalImportText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
