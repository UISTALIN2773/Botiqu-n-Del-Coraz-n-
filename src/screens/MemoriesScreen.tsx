import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { EmotionalItem } from '../config/database';
import { storageService } from '../modules/storageService';
import { audioEngine } from '../modules/audioEngine';
import { HapticsService } from '../modules/hapticsService';

interface MemoriesScreenProps {
  onPlayMemory: (item: EmotionalItem) => void;
}

export const MemoriesScreen: React.FC<MemoriesScreenProps> = ({ onPlayMemory }) => {
  const [filter, setFilter] = useState<'todos' | 'audios' | 'letters' | 'favoritos'>('todos');
  const [memories, setMemories] = useState<EmotionalItem[]>(storageService.getMemories());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);

  // Creation Modal State (+ Crear)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubtitle, setNewSubtitle] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');
  const [newAudioName, setNewAudioName] = useState<string>('');
  const [newPhotoUri, setNewPhotoUri] = useState<string>('');

  const handleToggleFavorite = (id: string) => {
    HapticsService.triggerSoftFeedback();
    storageService.toggleFavorite(id);
    setMemories([...storageService.getMemories()]);
  };

  const handleSaveNewMemory = () => {
    if (!newTitle.trim()) return;

    HapticsService.triggerSuccessFeedback();
    const created = storageService.addCustomMemory({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Recuerdo especial de nosotros',
      note: newNote.trim() || 'Siempre estaré aquí contigo.',
      mood: 'te_extrano',
      voiceFilename: newAudioName.trim() || 'voice_te_extrano_01.wav',
      ambientTrack: 'lofi',
      durationSeconds: 120,
      isFavorite: false,
      dateAdded: new Date().toISOString().split('T')[0],
      photoUrl: newPhotoUri.trim() || undefined,
    });

    setMemories([created, ...storageService.getMemories()]);
    setNewTitle('');
    setNewSubtitle('');
    setNewNote('');
    setNewAudioName('');
    setNewPhotoUri('');
    setIsCreateModalOpen(false);
  };

  // Filter memories
  const filteredList = memories.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.note.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'favoritos') return m.isFavorite;
    if (filter === 'audios') return !!m.voiceFilename;
    if (filter === 'letters') return !!m.note;
    return true;
  });

  return (
    <View style={styles.root}>
      {/* Barra de Filtros y Búsqueda Superior */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Baúl de Recuerdos 💌</Text>
          {/* Icono de lupa (🔍) en la esquina superior derecha */}
          <TouchableOpacity
            onPress={() => {
              HapticsService.triggerSoftFeedback();
              setShowSearch(!showSearch);
            }}
            style={styles.searchIconBtn}
          >
            <Text style={styles.searchIconText}>🔍</Text>
          </TouchableOpacity>
        </View>

        {showSearch && (
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por carta, palabra o fecha..."
            placeholderTextColor="#8C6F58"
            style={styles.searchInput}
          />
        )}

        {/* Barra de píldoras horizontales deslizables */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'audios', label: 'Audios 🎙️' },
            { key: 'letters', label: 'Letters 📜' },
            { key: 'favoritos', label: 'Favoritos ⭐' },
          ].map((tab) => {
            const isActive = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.85}
                onPress={() => {
                  HapticsService.triggerSoftFeedback();
                  setFilter(tab.key as any);
                }}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Listado de Tarjetas de Memoria */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {filteredList.map((item) => (
          <View key={item.id} style={styles.memoryCard}>
            {/* Extremo Izquierdo: Miniatura cuadrada (ImageView) */}
            <View style={styles.thumbnailSquare}>
              <Text style={styles.thumbnailEmoji}>
                {item.voiceFilename ? '🎙️' : '💌'}
              </Text>
            </View>

            {/* Centro: Título, fecha y contador de archivos adjuntos */}
            <View style={styles.memoryContentCol}>
              <Text style={styles.memoryTitle}>{item.title}</Text>
              <Text style={styles.memorySubtitle}>{item.subtitle}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.memoryDate}>{item.dateAdded}</Text>
                <Text style={styles.attachmentCount}>• 1 Audio + 1 Carta</Text>
              </View>
            </View>

            {/* Extremo Derecho: Botón de tres puntos verticales (⋮) para opciones */}
            <TouchableOpacity
              onPress={() => handleToggleFavorite(item.id)}
              style={styles.menuDotsBtn}
            >
              <Text style={styles.menuDotsText}>
                {item.isFavorite ? '⭐' : '⋮'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Esquina Inferior Derecha: Botón de Acción Flotante (FAB) rectangular en tono crema: + Crear */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          HapticsService.triggerSoftFeedback();
          setIsCreateModalOpen(true);
        }}
        style={styles.fabCrear}
      >
        <Text style={styles.fabCrearText}>+ Crear</Text>
      </TouchableOpacity>

      {/* Modal de Creación y Subida de Fotos/Audios */}
      <Modal visible={isCreateModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPaper}>
            <Text style={styles.modalTitle}>Redactar y Guardar Recuerdo ✍️</Text>
            <Text style={styles.modalSub}>
              Se guardará permanentemente en el almacenamiento seguro de tu teléfono.
            </Text>

            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Título de la entrada (ej. Ánimo hoy, Carta 4)..."
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
            />

            <TextInput
              value={newSubtitle}
              onChangeText={setNewSubtitle}
              placeholder="Subtítulo corto (ej. Para leer cuando me extrañes)..."
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
            />

            <TextInput
              value={newNote}
              onChangeText={setNewNote}
              multiline
              numberOfLines={4}
              placeholder="Escribe la carta cariñosa completa..."
              placeholderTextColor="#94A3B8"
              style={[styles.modalInput, { height: 90, textAlignVertical: 'top' }]}
            />

            <TextInput
              value={newAudioName}
              onChangeText={setNewAudioName}
              placeholder="Nombre del audio (ej. nota_whatsapp_01.opus)..."
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
            />

            <TextInput
              value={newPhotoUri}
              onChangeText={setNewPhotoUri}
              placeholder="Ruta o URL de la foto adjunta..."
              placeholderTextColor="#94A3B8"
              style={styles.modalInput}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setIsCreateModalOpen(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveNewMemory}
                style={styles.modalSaveBtn}
              >
                <Text style={styles.modalSaveText}>Guardar Permanente</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF5EE',
  },
  topHeader: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FAF5EE',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2B1810',
  },
  searchIconBtn: {
    padding: 6,
  },
  searchIconText: {
    fontSize: 18,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#2B1810',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBDCCE',
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  filterPill: {
    backgroundColor: '#F5EBE1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EBDCCE',
  },
  filterPillActive: {
    backgroundColor: '#2B1810',
    borderColor: '#2B1810',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C6F58',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 18,
  },
  memoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBDCCE',
  },
  thumbnailSquare: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FAF3ED',
    borderWidth: 1,
    borderColor: '#EBDCCE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  thumbnailEmoji: {
    fontSize: 22,
  },
  memoryContentCol: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2B1810',
  },
  memorySubtitle: {
    fontSize: 11,
    color: '#8C6F58',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  memoryDate: {
    fontSize: 10,
    color: '#A1826E',
  },
  attachmentCount: {
    fontSize: 10,
    color: '#A1826E',
    marginLeft: 4,
  },
  menuDotsBtn: {
    padding: 8,
  },
  menuDotsText: {
    fontSize: 16,
    color: '#8C6F58',
    fontWeight: '900',
  },
  fabCrear: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#F5EBE1', // Tono crema
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C4A48A',
  },
  fabCrearText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2B1810',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalPaper: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#EBDCCE',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2B1810',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 11,
    color: '#8C6F58',
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#2B1810',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBDCCE',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  modalCancelText: {
    color: '#8C6F58',
    fontWeight: '700',
    fontSize: 12,
  },
  modalSaveBtn: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
