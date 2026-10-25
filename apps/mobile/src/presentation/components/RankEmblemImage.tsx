import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export type TierGroup =
  | 'unranked'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'expert'
  | 'master'
  | 'grandmaster';

interface Props {
  tierGroup: string;
  subTier?: string;
  style?: StyleProp<ViewStyle>;
}

interface TierTheme {
  primary: string;
  secondary: string;
  darkBorder: string;
  symbol: string;
  label: string;
  isCircle?: boolean;
  isDiamond?: boolean;
}

const THEMES: Record<TierGroup, TierTheme> = {
  unranked: {
    primary: '#FFFFFF',
    secondary: '#E2E8F0',
    darkBorder: '#94A3B8',
    symbol: '?',
    label: '언랭크',
    isCircle: true,
  },
  bronze: {
    primary: '#CD7F32',
    secondary: '#E8A265',
    darkBorder: '#7A4D1D',
    symbol: '🥉',
    label: '브론즈',
  },
  silver: {
    primary: '#94A3B8',
    secondary: '#D4DCE6',
    darkBorder: '#475569',
    symbol: '🥈',
    label: '실버',
  },
  gold: {
    primary: '#F59E0B',
    secondary: '#FDE68A',
    darkBorder: '#B45309',
    symbol: '👑',
    label: '골드',
    isCircle: true,
  },
  platinum: {
    primary: '#10B981',
    secondary: '#A7F3D0',
    darkBorder: '#047857',
    symbol: '💠',
    label: '플레티넘',
  },
  diamond: {
    primary: '#06B6D4',
    secondary: '#A5F3FC',
    darkBorder: '#0369A1',
    symbol: '💎',
    label: '다이아',
    isDiamond: true,
  },
  expert: {
    primary: '#F97316',
    secondary: '#FED7AA',
    darkBorder: '#C2410C',
    symbol: '🔥',
    label: '익스퍼트',
  },
  master: {
    primary: '#8B5CF6',
    secondary: '#DDD6FE',
    darkBorder: '#6B21A8',
    symbol: '👑',
    label: '마스터',
  },
  grandmaster: {
    primary: '#EF4444',
    secondary: '#FECACA',
    darkBorder: '#990000',
    symbol: '🏆',
    label: '그랜드마스터',
    isCircle: true,
  },
};

export const RankEmblemImage = ({ tierGroup, subTier, style }: Props) => {
  const group = (tierGroup in THEMES ? tierGroup : 'bronze') as TierGroup;
  const theme = THEMES[group];
  const flatStyle = StyleSheet.flatten([style]) || {};
  const width = (flatStyle.width as number) || 56;
  const height = (flatStyle.height as number) || 56;
  const size = Math.min(width, height);

  const parsedSub = parseInt(subTier || '', 10);
  const showSub = !Number.isNaN(parsedSub) && parsedSub >= 1 && parsedSub <= 3;

  // Unranked: circular ring with ?
  if (group === 'unranked') {
    return (
      <View style={[{ width, height, alignItems: 'center', justifyContent: 'center' }, style]}>
        <View
          style={{
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: (size * 0.9) / 2,
            borderWidth: Math.max(3, size * 0.08),
            borderColor: '#CBD5E1',
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: size * 0.65,
              height: size * 0.65,
              borderRadius: (size * 0.65) / 2,
              borderWidth: 1.5,
              borderColor: '#94A3B8',
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: size * 0.35, fontWeight: '900', color: '#64748B' }}>?</Text>
          </View>
        </View>
      </View>
    );
  }

  // Diamond shape: 45 degree rotated outer view
  if (theme.isDiamond) {
    const innerSize = size * 0.68;
    return (
      <View style={[{ width, height, alignItems: 'center', justifyContent: 'center' }, style]}>
        <View
          style={{
            width: innerSize,
            height: innerSize,
            backgroundColor: theme.primary,
            borderColor: theme.darkBorder,
            borderWidth: Math.max(2, size * 0.05),
            borderRadius: Math.max(6, size * 0.12),
            transform: [{ rotate: '45deg' }],
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.primary,
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <View
            style={{
              width: innerSize * 0.72,
              height: innerSize * 0.72,
              borderWidth: 1.5,
              borderColor: theme.secondary,
              borderRadius: Math.max(4, size * 0.08),
            }}
          />
        </View>
        {/* Unrotated icon overlay */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: size * 0.36 }}>{theme.symbol}</Text>
          </View>
        </View>
        {showSub && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: size * 0.35,
              height: size * 0.35,
              borderRadius: (size * 0.35) / 2,
              backgroundColor: theme.darkBorder,
              borderWidth: 1.5,
              borderColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: size * 0.2, fontWeight: '900' }}>{parsedSub}</Text>
          </View>
        )}
      </View>
    );
  }

  // Circular shape (Gold, Grandmaster)
  if (theme.isCircle) {
    const emblemRadius = (size * 0.88) / 2;
    return (
      <View style={[{ width, height, alignItems: 'center', justifyContent: 'center' }, style]}>
        <View
          style={{
            width: size * 0.88,
            height: size * 0.88,
            borderRadius: emblemRadius,
            backgroundColor: theme.primary,
            borderWidth: Math.max(2.5, size * 0.06),
            borderColor: theme.darkBorder,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.primary,
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <View
            style={{
              width: size * 0.68,
              height: size * 0.68,
              borderRadius: (size * 0.68) / 2,
              borderWidth: 1.5,
              borderColor: theme.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: size * 0.34 }}>{theme.symbol}</Text>
          </View>
        </View>
        {showSub && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: size * 0.35,
              height: size * 0.35,
              borderRadius: (size * 0.35) / 2,
              backgroundColor: theme.darkBorder,
              borderWidth: 1.5,
              borderColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: size * 0.2, fontWeight: '900' }}>{parsedSub}</Text>
          </View>
        )}
      </View>
    );
  }

  // Shield / Rounded Octagon badge (Bronze, Silver, Platinum, Expert, Master)
  const isOctagon = group === 'platinum' || group === 'expert';
  const borderRadius = isOctagon ? Math.max(12, size * 0.25) : Math.max(8, size * 0.18);

  return (
    <View style={[{ width, height, alignItems: 'center', justifyContent: 'center' }, style]}>
      <View
        style={{
          width: size * 0.88,
          height: size * 0.92,
          backgroundColor: theme.primary,
          borderWidth: Math.max(2.5, size * 0.055),
          borderColor: theme.darkBorder,
          borderRadius: borderRadius,
          borderBottomLeftRadius: Math.max(16, size * 0.4),
          borderBottomRightRadius: Math.max(16, size * 0.4),
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: theme.primary,
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 3,
        }}
      >
        <View
          style={{
            width: size * 0.68,
            height: size * 0.72,
            borderWidth: 1.5,
            borderColor: theme.secondary,
            borderRadius: Math.max(6, borderRadius - 4),
            borderBottomLeftRadius: Math.max(12, size * 0.3),
            borderBottomRightRadius: Math.max(12, size * 0.3),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: size * 0.34 }}>{theme.symbol}</Text>
        </View>
      </View>
      {showSub && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: (size * 0.35) / 2,
            backgroundColor: theme.darkBorder,
            borderWidth: 1.5,
            borderColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: size * 0.2, fontWeight: '900' }}>{parsedSub}</Text>
        </View>
      )}
    </View>
  );
};
