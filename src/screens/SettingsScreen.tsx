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
  const [selectedTheme, setSelectedTheme] = useState<any>(currentPrefs.themeName);

  // Toggles tipo switch ON/OFF
  const [autoReminderAnniversary, setAutoReminderAnniversary] = useState<boolean>(true);
  const [autoReminderCountdown, setAutoReminderCountdown] = useState<boolean>(true);

  // PIN Modal
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isPinEnabled, setIsPinEnabled] = useState<boolean>(currentPrefs.isPinEnabled);
  const [pinCode, setPinCode] = useState<string>(currentPrefs.pinCode);

  // Feedback notice
  const [saveNotice, setSaveNotice] = useState<string>('');

  // 4 Temas Visuales Muestrarios Cuadrados
  const themeSwatches = [
    { key: 'minimal_clean', name: 'Minimal Clean', colors: ['#FFFFFF', '#E11D48'] },
    { key: 'rose_gold', name: 'Rose Gold Romance', colors: ['#FFF1F2', '#FB7185'] },
    { key: 'midnight_star', name: 'Midnight Star', colors: ['#1E1B4B', '#818CF8'] },
    { key: 'oled_black', name: 'OLED Black', colors: ['#000000', '#F5EBE1'] },
  ];

  const handleSaveAll = () => {
    storageService.updatePreferences({
      partnerName,
      senderName,
      anniversaryDate,
      nextDateMeet,
      themeName: selectedTheme,
      isPinEnabled,
      pinCode,
    });

    WidgetBridge.updateWidgetData();
    HapticsService.triggerSuccessFeedback();
    setSaveNotice('¡Configuración guardada y respaldada en el dispositivo!');
    setTimeout(() => setSaveNotice(''), 3000);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Ajustes & Personalización ⚙️</Text>
      <Text style={styles.subheading}>
        Configura los nombres de pareja, recordatorios automáticos, temas visuales y seguridad.
      </Text>

      {/* Sección Superior (Nombres y Fechas con conmutadores ON/OFF) */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Nombres de Pareja</Text>

        <Text style={styles.fieldLabel}>Nombre de tu Pareja (recibe la app):</Text>
        <TextInput
          value={partnerName}
          onChangeText={setPartnerName}
          style={styles.input}
          placeholder="Ej. Mi Amor, Cielo..."
          placeholderTextColor="#A1826E"
        />

        <Text style={styles.fieldLabel}>Tu Nombre o Firma (quien graba y escribe):</Text>
        <TextInput
          value={senderName}
          onChangeText={setSenderName}
          style={styles.input}
          placeholder="Ej. Tu novio/a..."
          placeholderTextColor="#A1826E"
        />

        <View style={styles.divider} />

        <Text style={styles.cardSectionTitle}>Fechas Especiales & Recordatorios</Text>

        {/* Aniversario Row con Switch */}
        <View style={styles.dateToggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Fecha de Aniversario (AAAA-MM-DD):</Text>
            <TextInput
              value={anniversaryDate}
              onChangeText={setAnniversaryDate}
              style={[styles.input, { marginTop: 2 }]}
              placeholder="2023-01-01"
              placeholderTextColor="#A1826E"
            />
          </View>
          <View style={styles.switchWrapper}>
            <Text style={styles.switchLabel}>Recordar</Text>
            <Switch
              value={autoReminderAnniversary}
              onValueChange={setAutoReminderAnniversary}
              thumbColor={autoReminderAnniversary ? '#E11D48' : '#CBD5E1'}
            />
          </View>
        </View>

        {/* Próxima Cita con Switch */}
        <View style={styles.dateToggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Próxima Cita / Reencuentro:</Text>
            <TextInput
              value={nextDateMeet}
              onChangeText={setNextDateMeet}
              style={[styles.input, { marginTop: 2 }]}
              placeholder="2026-09-15"
              placeholderTextColor="#A1826E"
            />
          </View>
          <View style={styles.switchWrapper}>
            <Text style={styles.switchLabel}>Countdown</Text>
            <Switch
              value={autoReminderCountdown}
              onValueChange={setAutoReminderCountdown}
              thumbColor={autoReminderCountdown ? '#E11D48' : '#CBD5E1'}
            />
          </View>
        </View>
      </View>

      {/* Selector de Temas Visuales (4 Muestrarios Cuadrados) */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Selector de Temas Visuales</Text>
        <Text style={styles.swatchSub}>
          Toca una paleta para cambiar la atmósfera de la aplicación:
        </Text>

        <View style={styles.swatchRow}>
          {themeSwatches.map((t) => {
            const isSelected = selectedTheme === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                activeOpacity={0.85}
                onPress={() => {
                  HapticsService.triggerSoftFeedback();
                  setSelectedTheme(t.key as any);
                }}
                style={[styles.squareSwatch, isSelected && styles.squareSwatchSelected]}
              >
                {/* Cuadricula bicolor */}
                <View style={styles.swatchColorSplit}>
                  <View style={[styles.splitHalf, { backgroundColor: t.colors[0] }]} />
                  <View style={[styles.splitHalf, { backgroundColor: t.colors[1] }]} />
                </View>
                <Text style={[styles.swatchName, isSelected && styles.swatchNameSelected]}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Módulo de Seguridad (Inferior): Botón ancho redondeado en tono crema: 🔒 PIN Lock */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Seguridad & Privacidad</Text>
        <Text style={styles.swatchSub}>
          El Botiquín de Emergencia y Widget siempre estarán abiertos; el PIN solo protege el baúl íntimo.
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsPinModalOpen(true)}
          style={styles.pinLockBtnCream}
        >
          <Text style={styles.pinLockBtnIcon}>🔒</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.pinLockBtnText}>PIN Lock</Text>
            <Text style={styles.pinLockBtnSub}>
              {isPinEnabled ? 'Activado (Código de 4 dígitos configurado)' : 'Desactivado • Toca para proteger'}
            </Text>
          </View>
          <Text style={styles.pinArrow}>➔</Text>
        </TouchableOpacity>
      </View>

      {/* Botón Guardar */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleSaveAll}
        style={styles.saveMainBtn}
      >
        <Text style={styles.saveMainBtnText}>Guardar y Aplicar Cambios</Text>
      </TouchableOpacity>

      {saveNotice ? <Text style={styles.noticeText}>{saveNotice}</Text> : null}

      {/* Modal PIN Lock */}
      <Modal visible={isPinModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPaper}>
            <Text style={styles.modalTitle}>Configurar Clave PIN de 4 Dígitos 🔒</Text>

            <View style={styles.pinSwitchRow}>
              <Text style={styles.fieldLabel}>Habilitar bloqueo de seguridad:</Text>
              <Switch
                value={isPinEnabled}
                onValueChange={setIsPinEnabled}
                thumbColor={isPinEnabled ? '#E11D48' : '#CBD5E1'}
              />
            </View>

            {isPinEnabled && (
              <TextInput
                value={pinCode}
                onChangeText={setPinCode}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                placeholder="1234"
                placeholderTextColor="#A1826E"
                style={styles.pinCodeInput}
              />
            )}

            <TouchableOpacity
              onPress={() => setIsPinModalOpen(false)}
              style={styles.modalConfirmBtn}
            >
              <Text style={styles.modalConfirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#FAF5EE',
  },
  heading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2B1810',
  },
  subheading: {
    fontSize: 12,
    color: '#8C6F58',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 17,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBDCCE',
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2B1810',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C3E2E',
    marginTop: 6,
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: '#EBDCCE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#2B1810',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5EBE1',
    marginVertical: 14,
  },
  dateToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchWrapper: {
    alignItems: 'center',
    marginLeft: 12,
  },
  switchLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8C6F58',
    marginBottom: 2,
  },
  swatchSub: {
    fontSize: 11,
    color: '#8C6F58',
    marginBottom: 12,
  },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  squareSwatch: {
    width: '23%',
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EBDCCE',
  },
  squareSwatchSelected: {
    borderColor: '#E11D48',
    backgroundColor: '#FFF1F2',
    transform: [{ scale: 1.05 }],
  },
  swatchColorSplit: {
    width: 38,
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 6,
  },
  splitHalf: {
    flex: 1,
    height: '100%',
  },
  swatchName: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5C3E2E',
    textAlign: 'center',
  },
  swatchNameSelected: {
    color: '#E11D48',
  },
  pinLockBtnCream: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EBE1', // Tono crema
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EBDCCE',
    marginTop: 6,
  },
  pinLockBtnIcon: {
    fontSize: 24,
  },
  pinLockBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2B1810',
  },
  pinLockBtnSub: {
    fontSize: 10,
    color: '#8C6F58',
    marginTop: 1,
  },
  pinArrow: {
    fontSize: 16,
    fontWeight: '900',
    color: '#8C6F58',
  },
  saveMainBtn: {
    backgroundColor: '#2B1810',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    elevation: 4,
  },
  saveMainBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
    textAlign: 'center',
    marginTop: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalPaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#EBDCCE',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2B1810',
    marginBottom: 16,
    textAlign: 'center',
  },
  pinSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pinCodeInput: {
    backgroundColor: '#FAF5EE',
    borderRadius: 14,
    paddingVertical: 10,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1.5,
    borderColor: '#EBDCCE',
    color: '#2B1810',
    fontWeight: '900',
    marginBottom: 16,
  },
  modalConfirmBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
