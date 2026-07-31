import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LANGUAGE_LIST, LanguageCode } from '@dahamkke/shared';
import { theme } from '../theme';

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (code: LanguageCode) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>언어 선택 (Language):</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {LANGUAGE_LIST.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.chip,
                isSelected && styles.selectedChip,
              ]}
              onPress={() => onSelectLanguage(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  scroll: {
    paddingRight: theme.spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    marginRight: theme.spacing.xs + 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  flag: {
    fontSize: 14,
    marginRight: 4,
  },
  chipText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '600',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
});
