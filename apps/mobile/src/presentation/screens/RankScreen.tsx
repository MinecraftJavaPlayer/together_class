import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { theme } from '../theme';
import {
  RANK_TIERS,
  getUserRank,
  getCurrentUser,
  MonthlySeasonState,
} from '@dahamkke/shared';
import { RankEmblemImage } from '../components/RankEmblemImage';

export const RankScreen = ({ navigation }: any) => {
  const [currentUser] = useState(getCurrentUser());
  const [seasonState] = useState<MonthlySeasonState>({
    currentSeasonKey: '2026-07',
    userPoints: currentUser.points,
    seasonHistory: [
      { seasonKey: '2026-06', finalPoints: 850, highestRankName: '골드 2', resetAt: '2026-07-01T00:00:00Z' },
    ],
  });

  const currentRank = getUserRank(currentUser);

  // Class Leaderboard Mock Data
  const leaderboard = [
    { rankNo: 1, name: '김민준 (한국어 짝꿍)', points: 1850, tier: '다이아 1', tierGroup: 'diamond' },
    { rankNo: 2, name: currentUser.name, points: currentUser.points, tier: currentRank.name, tierGroup: currentRank.tierGroup, isUser: true },
    { rankNo: 3, name: '안나 (러시아)', points: 320, tier: '실버 3', tierGroup: 'silver' },
    { rankNo: 4, name: '왕웨이 (중국)', points: 95, tier: '브론즈 3', tierGroup: 'bronze' },
    { rankNo: 5, name: '흐엉 (베트남)', points: 80, tier: '브론즈 3', tierGroup: 'bronze' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🏆 랭크 & 월간 시즌 (Rank)</Text>
        <Text style={styles.subtitle}>학습 성취도 평가를 통해 포인트를 얻고 모둠/학급 랭크를 올려보세요!</Text>

        {/* Hero Current Rank Card */}
        <View style={[styles.heroRankCard, { backgroundColor: currentRank.bgColor, borderColor: currentRank.color }]}>
          <View style={styles.heroRankHeader}>
            <RankEmblemImage tierGroup={currentRank.tierGroup} style={{ width: 64, height: 64, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.seasonBadge}>월간 시즌: {seasonState.currentSeasonKey}</Text>
              <Text style={[styles.heroRankTitle, { color: currentRank.color }]}>{currentRank.name}</Text>
              <Text style={styles.heroPtsText}>누적 포인트: {currentUser.points} pt</Text>
            </View>
          </View>

          {/* Season Reset Notice */}
          <View style={styles.resetNoticeBox}>
            <Text style={styles.resetNoticeText}>⏰ 매월 1일 00:00 랭크 초기화 (전 시즌 기록 보존)</Text>
          </View>
        </View>

        {/* Go to 10 Questions Evaluation Button */}
        <TouchableOpacity
          style={styles.takeQuizBtn}
          onPress={() => navigation.navigate('EvaluationQuiz')}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 24, marginRight: 8 }}>📝</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.takeQuizTitle}>10문항 학습 성취도 평가 풀기</Text>
            <Text style={styles.takeQuizSub}>학습 완료 후 평가를 치르고 0~20pt 포인트를 획득하세요!</Text>
          </View>
          <Text style={{ fontSize: 20, color: '#FFF' }}>➔</Text>
        </TouchableOpacity>

        {/* Class Leaderboard */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🥇 다함께 학급 랭킹 리더보드</Text>
        </View>
        <View style={styles.leaderboardCard}>
          {leaderboard.map((item) => (
            <View
              key={item.rankNo}
              style={[
                styles.leaderRow,
                item.isUser && styles.userLeaderRow,
              ]}
            >
              <Text style={[styles.rankNoText, item.rankNo <= 3 && styles.topRankNo]}>
                {item.rankNo === 1 ? '🥇 1위' : item.rankNo === 2 ? '🥈 2위' : item.rankNo === 3 ? '🥉 3위' : `${item.rankNo}위`}
              </Text>
              <RankEmblemImage tierGroup={item.tierGroup} style={{ width: 24, height: 24, marginRight: 8 }} />
              <Text style={[styles.leaderName, item.isUser && styles.userNameText]}>{item.name}</Text>
              <Text style={styles.leaderPts}>{item.points} pt ({item.tier})</Text>
            </View>
          ))}
        </View>

        {/* All 13 Rank Tier Guide */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📜 전체 13개 랭크 티어 안내</Text>
        </View>
        <View style={styles.tierGuideCard}>
          {RANK_TIERS.map((tier) => (
            <View key={tier.id} style={styles.tierRow}>
              <RankEmblemImage tierGroup={tier.tierGroup} style={{ width: 22, height: 22, marginRight: 8 }} />
              <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
              <Text style={styles.tierRange}>{tier.minPoints} ~ {tier.maxPoints === Infinity ? 'MAX' : `${tier.maxPoints} pt`}</Text>
            </View>
          ))}
        </View>

        {/* Season History Section */}
        {seasonState.seasonHistory && seasonState.seasonHistory.length > 0 && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>📜 지난 월간 시즌 명예의 전당</Text>
            {seasonState.seasonHistory.map((h, idx) => (
              <View key={idx} style={styles.historyRow}>
                <Text style={styles.historySeasonText}>{h.seasonKey} 시즌</Text>
                <Text style={styles.historyRankText}>최고 랭크: {h.highestRankName} ({h.finalPoints} pt)</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  heroRankCard: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    ...theme.shadows.medium,
  },
  heroRankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  seasonBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  heroRankTitle: {
    fontSize: 26,
    fontWeight: '900',
  },
  heroPtsText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  resetNoticeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs + 2,
    alignItems: 'center',
  },
  resetNoticeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  takeQuizBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  takeQuizTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  takeQuizSub: {
    color: '#E6FFFA',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  leaderboardCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  userLeaderRow: {
    backgroundColor: '#EFF6FF',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.xs,
  },
  rankNoText: {
    fontSize: 13,
    fontWeight: '700',
    width: 45,
    color: '#64748B',
  },
  topRankNo: {
    fontWeight: '800',
    color: '#D97706',
  },
  leaderName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  userNameText: {
    fontWeight: '800',
    color: '#2563EB',
  },
  leaderPts: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  tierGuideCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tierName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  tierRange: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  historyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: theme.spacing.lg,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: theme.spacing.xs,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  historySeasonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyRankText: {
    fontSize: 12,
    color: '#64748B',
  },
});
