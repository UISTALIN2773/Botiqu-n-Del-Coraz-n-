import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MoodType, MOOD_DEFINITIONS } from '../config/database';
import { HapticsService } from '../modules/hapticsService';

interface MoodButtonProps {
  mood: MoodType;
  isSelected: boolean;
  onSelect: (mood: MoodType) => void;
}

export const MoodButton: React.FC<MoodButtonProps> = ({
  mood,
  isSelected,
  onSelect,
}) => {
  const def = MOOD_DEFINITIONS[mood];

  const handlePress = () => {
    HapticsService.triggerSoftFeedback();
    onSelect(mood);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        styles.button,
        isSelected
          ? { backgroundColor: def.color, borderColor: def.color }
          : styles.unselectedButton,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSelected ? styles.selectedText : styles.unselectedText,
        ]}
      >
        {def.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginHorizontal: 4,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unselectedButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unselectedText: {
    color: '#404040',
  },
});
