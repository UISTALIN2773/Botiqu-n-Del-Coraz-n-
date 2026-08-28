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

export const FutureTreeScreen: React.FC = () => {
  const [goals, setGoals] = useState<FutureGoalItem[]>(storageService.getFutureGoals());
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<FutureGoalItem['category']>('viaje');
  const daysUntilMeet = storageService.getDaysUntilNextMeet();

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

  const categoryIcons: Record<FutureGoalItem['category'], string> = {
    viaje: '✈️',
    cita: '🍷',
    hogar: '🏡',
    experiencia: '🎡',
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>El Árbol de Nuestro Futuro 🌱</Text>
      <Text style={styles.subheading}>
        La certeza de todo lo hermoso que aún nos falta por vivir juntos.
      </Text>

      {/* Countdown Card to Next Meeting */}
      <View style={styles.countdownCard}>
        <Text style={styles.countdownTag}>⏳ NUESTRA PRÓXIMA CITA / REENCUENTRO</Text>
        <View style={styles.countdownRow}>
          <Text style={styles.countdownDays}>{daysUntilMeet}</Text>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.countdownTitle}>Días para volver a vernos</Text>
            <Text style={styles.countdownSub}>
              Cada segundo que pasa es un segundo más cerca de abrazarte fuerte.
            </Text>
          </View>
        </View>
      </View>

      {/* Bucket List Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nuestra Lista de Sueños y Planes 🗺️</Text>

        {goals.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => handleToggle(item.id)}
            style={[styles.goalCard, item.isCompleted && styles.goalCardCompleted]}
          >
            <Text style={styles.categoryIcon}>{categoryIcons[item.category]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.goalTitle, item.isCompleted && styles.goalTitleCompleted]}>
                {item.title}
              </Text>
              {item.completedDate && (
                <Text style={styles.completedBadge}>{item.completedDate}</Text>
              )}
            </View>
            <View style={[styles.checkCircle, item.isCompleted && styles.checkCircleCompleted]}>
              <Text style={styles.checkText}>{item.isCompleted ? '✓' : ''}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add New Goal Box */}
      <View style={styles.addCard}>
        <Text style={styles.addTitle}>+ Agregar Nuevo Plan Juntos</Text>
        <TextInput
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="Ej: Ver las estrellas juntos en el campo..."
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        <View style={styles.categoryRow}>
          {(['viaje', 'cita', 'hogar', 'experiencia'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setNewCategory(cat)}
              style={[styles.catBtn, newCategory === cat && styles.catBtnActive]}
            >
              <Text style={[styles.catBtnText, newCategory === cat && styles.catBtnTextActive]}>
                {categoryIcons[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAddGoal}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>Añadir al Árbol de Sueños</Text>
        </TouchableOpacity>
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
    lineHeight: 18,
  },
  countdownCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },
  countdownTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownDays: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  countdownTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countdownSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  goalCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  categoryIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  goalTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#15803D',
  },
  completedBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  addCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
  },
  addTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
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
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  catBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  catBtnActive: {
    backgroundColor: '#0F172A',
  },
  catBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  catBtnTextActive: {
    color: '#FFFFFF',
  },
  addBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
