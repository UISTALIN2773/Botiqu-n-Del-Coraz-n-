import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HapticsService } from '../modules/hapticsService';

export type TabType = 'home' | 'memories' | 'calm' | 'settings';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  accentColor?: string;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  accentColor = '#E11D48',
}) => {
  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'home', label: 'Inicio', icon: '🏠' },
    { key: 'memories', label: 'Baúl', icon: '💌' },
    { key: 'calm', label: 'Calma', icon: '🍃' },
    { key: 'settings', label: 'Ajustes', icon: '⚙️' },
  ];

  const handleTabPress = (tab: TabType) => {
    HapticsService.triggerSoftFeedback();
    onTabChange(tab);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            onPress={() => handleTabPress(tab.key)}
            style={styles.tabButton}
          >
            <Text style={[styles.iconText, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text
              style={[
                styles.labelText,
                isActive ? { color: accentColor, fontWeight: '700' } : styles.labelInactive,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={[styles.activeBar, { backgroundColor: accentColor }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconText: {
    fontSize: 18,
    marginBottom: 2,
  },
  iconActive: {
    transform: [{ scale: 1.15 }],
  },
  labelText: {
    fontSize: 11,
  },
  labelInactive: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  activeBar: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    marginTop: 3,
  },
});
