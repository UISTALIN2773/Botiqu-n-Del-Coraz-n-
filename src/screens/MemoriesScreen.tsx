import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { EmotionalItem, MoodType } from '../config/database';
import { storageService } from '../modules/storageService';
import { MemoryCard } from '../components/MemoryCard';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';

interface MemoriesScreenProps {
  onPlayMemory: (item: EmotionalItem) => void;
}

export const MemoriesScreen: React.FC<MemoriesScreenProps> = ({ onPlayMemory }) => {
  const [filter, setFilter] = useState<'todos' | 'favoritos' | 'audios' | 'cartas'>('todos');
  const [memories, setMemories] = useState<EmotionalItem[]>(storageService.getMemories());
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Add Memory Modal State
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubtitle, setNewSubtitle] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');
  const [newMood, setNewMood] = useState<MoodType>('te_extrano');
  const [newTag, setNewTag] = useState<string>('Especial');

  const filteredMemories = memories.filter((m) => {
    if (filter === 'favoritos') return m.isFavorite;
    if (filter === 'audios') return m.type === 'audio' || m.type === 'mixto';
    if (filter === 'cartas') return m.type === 'carta';
    return true;
  });

  const handleToggleFavorite = (id: string) => {
    storageService.toggleFavorite(id);
    setMemories([...storageService.getMemories()]);
  };

  const handlePlay = (item: EmotionalItem) => {
    if (playingId === item.id) {
      audioEngine.stopAll();
      setPlayingId(null);
    } else {
      setPlayingId(item.id);
      onPlayMemory(item);
    }
  };

  const handleCreateMemory = () => {
    if (!newTitle.trim() || !newNote.trim()) return;

    storageService.addCustomMemory({
      mood: newMood,
      type: 'carta',
      title: newTitle,
      subtitle: newSubtitle || 'Nota escrita por mí',
      note: newNote,
      date: new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }),
      ambientTrack: 'piano',
      durationSeconds: 30,
      isFavorite: false,
      tag: newTag || 'Personal',
    });

    setMemories([...storageService.getMemories()]);
    setIsAddModalVisible(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewNote('');
    HapticsService.triggerSuccessFeedback();
  };

  return (
    <View style={styles.container}>
      {/* Top Filter Bar */}
      <View style={styles.topFilterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'favoritos', label: '⭐ Favoritos' },
            { key: 'audios', label: '🎙️ Audios' },
            { key: 'cartas', label: '💌 Cartas' },
          ].map((f) => {
            const isSelected = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                activeOpacity={0.8}
                onPress={() => {
                  HapticsService.triggerSoftFeedback();
                  setFilter(f.key as any);
                }}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Add Memory Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsAddModalVisible(true)}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ Crear</Text>
        </TouchableOpacity>
      </View>

      {/* Memories List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {filteredMemories.map((item) => (
          <MemoryCard
            key={item.id}
            item={item}
            isPlaying={playingId === item.id}
            onPlay={handlePlay}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}

        {filteredMemories.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💌</Text>
            <Text style={styles.emptyTitle}>No hay recuerdos en este filtro</Text>
            <Text style={styles.emptySub}>
              Crea una carta o audio especial usando el botón "+ Crear" arriba.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Manual Memory Creator Modal */}
      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Crear Nota o Recuerdo Manual</Text>
            <Text style={styles.modalSub}>
              Escribe una dedicatoria o mensaje que tu pareja pueda leer en cualquier momento.
            </Text>

            <TextInput
              placeholder="Título (ej: Para cuando tengas dudas)"
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />

            <TextInput
              placeholder="Subtítulo corto (ej: Recuerda esto)"
              value={newSubtitle}
              onChangeText={setNewSubtitle}
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />

            <TextInput
              placeholder="Escribe tu mensaje cariñoso aquí..."
              value={newNote}
              onChangeText={setNewNote}
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setIsAddModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateMemory}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>Guardar en el Baúl</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#E11D48',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  addBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
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
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
