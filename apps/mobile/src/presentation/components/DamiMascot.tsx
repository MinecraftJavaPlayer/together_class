import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface DamiMascotProps {
  message?: string;
  size?: number;
}

export const DamiMascot: React.FC<DamiMascotProps> = ({
  message = '안녕하세요! 함께 공부해요!',
  size = 48,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.5 }}>🤖</Text>
      </View>
      {message ? (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  avatar: {
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  bubble: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexShrink: 1,
    ...theme.shadows.soft,
  },
  bubbleText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
