import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { FutureGoalItem } from '../config/database';
import { storageService } from '../modules/storageService';
import { HapticsService } from '../modules/hapticsService';

interface FutureTreeScreenProps {
  onClose?: () => void;
}

export const FutureTreeScreen: React.FC<FutureTreeScreenProps> = ({ onClose }) => {
  const [activeView, setActiveView] = useState<'arbol' | 'countdown'>('arbol');
  const [goals, setGoals] = useState<FutureGoalItem[]>(storageService.getFutureGoals());
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<FutureGoalItem['category']>('viaje');

  const daysUntilMeet = storageService.getDaysUntilNextMeet();
  const completedCount = goals.filter((g) => g.isCompleted).length;

  const handleToggle = (id: string) => {
    HapticsService.triggerSuccessFeedback();
    storageService.toggleGoal(id);
    setGoals([...storageService.getFutureGoals()]);
  };

  const handleAddGoal = () => {
    if (!newTitle.trim()) return;
    HapticsService.triggerSoftFeedback();
    storageService.addGoal(newTitle, newCategory);
    setGoals([...storageService.getFutureGoals()]);
    setNewTitle('');
  };

  const isNight = activeView === 'countdown';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.container, isNight && styles.containerNight]}
    >
      {/* Top Nav Header */}
      <View style={styles.navBar}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.navBtn}>
            <Text style={[styles.navArrow, isNight && { color: '#F5EBE1' }]}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            onPress={() => {
              HapticsService.triggerSoftFeedback();
              setActiveView('arbol');
            }}
            style={[styles.tabToggleBtn, activeView === 'arbol' && styles.tabToggleBtnActive]}
          >
            <Text style={[styles.tabToggleText, activeView === 'arbol' && styles.tabToggleTextActive]}>
              🌱 Árbol de Sueños
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              HapticsService.triggerSoftFeedback();
              setActiveView('countdown');
            }}
            style={[styles.tabToggleBtn, activeView === 'countdown' && styles.tabToggleBtnActive]}
          >
            <Text style={[styles.tabToggleText, activeView === 'countdown' && styles.tabToggleTextActive]}>
              ⏳ Countdown Cita
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: 20 }} />
      </View>

      {/* VISTA 1: ÁRBOL DE NUESTRO FUTURO + BUCKET LIST */}
      {activeView === 'arbol' && (
        <View>
          {/* Ilustración Central Superior: Silueta de árbol con ramas y copa formadas por hojas de corazones en tonos terracota y crema */}
          <View style={styles.treeIllustrationCard}>
            <View style={styles.treeCanopy}>
              <View style={styles.heartRow1}>
                <Text style={[styles.canopyHeart, { color: '#E11D48' }]}>❤️</Text>
                <Text style={[styles.canopyHeart, { color: '#F5EBE1' }]}>🤍</Text>
                <Text style={[styles.canopyHeart, { color: '#993D1E' }]}>🤎</Text>
              </View>
              <View style={styles.heartRow2}>
                <Text style={[styles.canopyHeart, { color: '#F5EBE1' }]}>🤍</Text>
                <Text style={[styles.canopyHeartLarge, { color: '#E11D48' }]}>❤️</Text>
                <Text style={[styles.canopyHeart, { color: '#F5EBE1' }]}>🤍</Text>
                <Text style={[styles.canopyHeart, { color: '#993D1E' }]}>🤎</Text>
              </View>
              {/* Tronco del Árbol */}
              <View style={styles.treeTrunk} />
            </View>
            <Text style={styles.treeCaption}>
              {completedCount} de {goals.length} Sueños Florecidos Juntos
            </Text>
          </View>

          {/* Bloque Inferior: Bucket List de Pareja */}
          <View style={styles.bucketListSection}>
            <Text style={styles.bucketListTitle}>Bucket List de Pareja</Text>

            {goals.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => handleToggle(item.id)}
                style={[styles.goalRow, item.isCompleted && styles.goalRowCompleted]}
              >
                {/* Casilla de verificación interactiva (✓) en el extremo izquierdo */}
                <View style={[styles.checkboxLeft, item.isCompleted && styles.checkboxLeftCompleted]}>
                  {item.isCompleted && <Text style={styles.checkIcon}>✓</Text>}
                </View>

                {/* Texto tachado al marcarse */}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.goalText, item.isCompleted && styles.goalTextStrikethrough]}>
                    {item.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Formulario para Añadir Metas */}
          <View style={styles.addGoalCard}>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Escribe un nuevo sueño juntos..."
              placeholderTextColor="#94A3B8"
              style={styles.addInput}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAddGoal}
              style={styles.addGoalBtn}
            >
              <Text style={styles.addGoalBtnText}>+ Agregar a la Lista</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* VISTA 2: MODO CUENTA REGRESIVA (FILA 2, IMAGEN 2 - FONDO NEGRO PURO) */}
      {activeView === 'countdown' && (
        <View style={styles.countdownContainerNight}>
          {/* Etiqueta Superior */}
          <Text style={styles.countdownLabelNight}>COUNTDOWN</Text>

          {/* Dato de Alto Impacto */}
          <Text style={styles.countdownBigNumberNight}>{daysUntilMeet}</Text>
          <Text style={styles.countdownImpactTitleNight}>Días para volver a vernos</Text>

          {/* Sello Miniatura del Árbol de Corazones */}
          <View style={styles.treeSealNight}>
            <Text style={{ fontSize: 24 }}>🌱❤️</Text>
          </View>

          {/* Sección Inferior: Vista compacta de la lista de deseos con checkmark */}
          <View style={styles.compactListNight}>
            <Text style={styles.compactTitleNight}>Planes para nuestro reencuentro:</Text>
            {goals.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleToggle(item.id)}
                style={styles.compactRowNight}
              >
                <View style={[styles.checkboxLeftNight, item.isCompleted && styles.checkboxLeftCompletedNight]}>
                  {item.isCompleted && <Text style={styles.checkIconNight}>✓</Text>}
                </View>
                <Text style={[styles.compactTextNight, item.isCompleted && styles.goalTextStrikethrough]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#FAF5EE',
    minHeight: '100%',
  },
  containerNight: {
    backgroundColor: '#000000', // Fondo negro puro para modo Countdown
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    padding: 6,
  },
  navArrow: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2B1810',
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#EBDCCE',
    borderRadius: 20,
    padding: 3,
  },
  tabToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabToggleBtnActive: {
    backgroundColor: '#2B1810',
  },
  tabToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C3E2E',
  },
  tabToggleTextActive: {
    color: '#FFFFFF',
  },
  treeIllustrationCard: {
    backgroundColor: '#F5EBE1',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EBDCCE',
    elevation: 3,
    marginBottom: 18,
  },
  treeCanopy: {
    alignItems: 'center',
    marginBottom: 10,
  },
  heartRow1: {
    flexDirection: 'row',
  },
  heartRow2: {
    flexDirection: 'row',
    marginTop: -6,
  },
  canopyHeart: {
    fontSize: 26,
    marginHorizontal: 3,
  },
  canopyHeartLarge: {
    fontSize: 34,
    marginHorizontal: 3,
  },
  treeTrunk: {
    width: 14,
    height: 28,
    backgroundColor: '#78350F',
    borderRadius: 4,
    marginTop: 2,
  },
  treeCaption: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5C3E2E',
    marginTop: 6,
  },
  bucketListSection: {
    marginBottom: 16,
  },
  bucketListTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2B1810',
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBDCCE',
    elevation: 1,
  },
  goalRowCompleted: {
    backgroundColor: '#F7EFE8',
  },
  checkboxLeft: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#C4A48A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxLeftCompleted: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  goalText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B1810',
  },
  goalTextStrikethrough: {
    textDecorationLine: 'line-through',
    color: '#8C6F58',
  },
  addGoalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EBDCCE',
  },
  addInput: {
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#2B1810',
    marginBottom: 10,
  },
  addGoalBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  addGoalBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  countdownContainerNight: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  countdownLabelNight: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 2,
  },
  countdownBigNumberNight: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  countdownImpactTitleNight: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F5EBE1',
    marginTop: 2,
  },
  treeSealNight: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1E1B18',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
    borderWidth: 1,
    borderColor: '#3D2314',
  },
  compactListNight: {
    width: '100%',
    backgroundColor: '#120F0D',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#261C16',
  },
  compactTitleNight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F5EBE1',
    marginBottom: 12,
  },
  compactRowNight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1813',
  },
  checkboxLeftNight: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#5C3E2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxLeftCompletedNight: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkIconNight: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  compactTextNight: {
    fontSize: 12,
    color: '#E6D5C3',
    fontWeight: '600',
  },
});
