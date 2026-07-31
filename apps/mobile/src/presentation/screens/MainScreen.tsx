import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { theme } from '../theme';
import { DamiMascot } from '../components/DamiMascot';
import { LanguageSelector } from '../components/LanguageSelector';
import {
  LanguageCode,
  getUserRank,
  getCurrentUser,
  isAllLearningCompleted,
  UserProfile,
} from '@dahamkke/shared';
import { RankEmblemImage } from '../components/RankEmblemImage';

export const MainScreen = ({ navigation }: any) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('ru');
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const focusListener = navigation.addListener('focus', () => {
      setCurrentUser(getCurrentUser());
    });
    return focusListener;
  }, [navigation]);

  const currentRank = getUserRank(currentUser);
  const isQuizUnlocked = isAllLearningCompleted(currentUser);

  const features = [
    {
      id: 'Rank',
      title: '🏆 랭크 & 티어 보상',
      desc: `현재 랭크: ${currentRank.name} (${currentUser.points} pt)`,
      icon: '🏆',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      screen: 'Rank',
      highlight: true,
    },
    {
      id: 'EvaluationQuiz',
      title: isQuizUnlocked ? '📝 학습 평가 10문항' : '🔒 학습 평가 10문항 (잠김)',
      desc: isQuizUnlocked ? '🔓 단원 학습 완료! 10문제 풀고 성취도 0~20pt 획득' : '🔒 단원 학습(번역, 통역, 토론 등)을 최소 1개 완성해야 해제됩니다',
      icon: isQuizUnlocked ? '📝' : '🔒',
      color: isQuizUnlocked ? '#EC4899' : '#94A3B8',
      screen: 'EvaluationQuiz',
      highlight: isQuizUnlocked,
    },
    {
      id: 'Translate',
      title: '교과서 OCR 번역',
      desc: '지문 촬영 텍스트 추출 & 6개국 언어 병렬 번역',
      icon: '📷',
      color: '#14B8A6',
      bgColor: '#F0FDFA',
      screen: 'Translate',
      highlight: true,
    },
    {
      id: 'Interpret',
      title: '실시간 음성 통역',
      desc: '짝꿍과 마이크로 양방향 실시간 대화 통역',
      icon: '🎙️',
      color: '#FF7A59',
      bgColor: '#FFF5F3',
      screen: 'Interpret',
    },
    {
      id: 'Debate',
      title: 'AI 토론 친구',
      desc: '가상 초등 한국인 친구와 존중 토론 연습',
      icon: '💬',
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      screen: 'Debate',
    },
    {
      id: 'Persona',
      title: '교과서 인물 인터뷰',
      desc: '흥부·이순신 등 교과서 인물 1인칭 대화 (RAG)',
      icon: '🎭',
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
      screen: 'Persona',
    },
    {
      id: 'Notice',
      title: '가정통신문 번역',
      desc: '알림장 다국어 번역 & 주요 준비물/일정 요약 QR',
      icon: '📄',
      color: '#06B6D4',
      bgColor: '#ECFEFF',
      screen: 'Notice',
    },
    {
      id: 'Dictation',
      title: '받아쓰기 연습',
      desc: '듣고 맞히는 한국어 단어 받아쓰기 & 스티커',
      icon: '✍️',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      screen: 'Dictation',
    },
    {
      id: 'Writing',
      title: '글자 따라쓰기',
      desc: '손가락으로 한글 자모/단어 따라쓰기 채점',
      icon: '✏️',
      color: '#6366F1',
      bgColor: '#EEF2FF',
      screen: 'Writing',
    },
    {
      id: 'Records',
      title: '학습 기록 & 복습',
      desc: '저장된 번역/대화 기록 조회 & AI 복습 퀴즈',
      icon: '📚',
      color: '#10B981',
      bgColor: '#ECFDF5',
      screen: 'Records',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header Glass Card with 3D Rank Emblem */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <Text style={styles.welcomeText}>👋 반가워요!</Text>
                <TouchableOpacity
                  style={[styles.rankTierBadge, { backgroundColor: currentRank.bgColor, borderColor: currentRank.color }]}
                  onPress={() => navigation.navigate('Rank')}
                >
                  <RankEmblemImage tierGroup={currentRank.tierGroup} style={{ width: 18, height: 18, marginRight: 4 }} />
                  <Text style={[styles.rankTierText, { color: currentRank.color }]}>
                    {currentRank.name}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.nameText}>{currentUser.name} <Text style={{ color: currentRank.color, fontSize: 15 }}>[{currentUser.points} pt]</Text></Text>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={{ fontSize: 22 }}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Rank Progress Track */}
          <View style={styles.xpContainer}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLabel}>현재 티어 구간: {currentRank.minPoints} ~ {currentRank.maxPoints === Infinity ? 'MAX' : currentRank.maxPoints} pt</Text>
              <Text style={styles.xpVal}>{currentUser.points} pt</Text>
            </View>
            <View style={styles.xpBarTrack}>
              <View
                style={[
                  styles.xpBarFill,
                  {
                    width: `${Math.min(
                      100,
                      ((currentUser.points - currentRank.minPoints) /
                        (currentRank.maxPoints === Infinity ? 1000 : currentRank.maxPoints - currentRank.minPoints)) *
                        100
                    )}%`,
                    backgroundColor: currentRank.color,
                  },
                ]}
              />
            </View>
          </View>

          {/* Native Language Selector */}
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        </View>

        {/* Dami Mascot Banner */}
        <DamiMascot message="오늘 단원 학습을 마치고 10문항 평가를 풀어 랭크를 올려보세요! 🚀" size={56} />

        {/* Quick Stats Pill Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statPill} onPress={() => navigation.navigate('Rank')}>
            <RankEmblemImage tierGroup={currentRank.tierGroup} style={{ width: 28, height: 28, marginBottom: 2 }} />
            <Text style={styles.statVal}>{currentRank.name}</Text>
            <Text style={styles.statLabel}>현재 랭크</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statPill} onPress={() => navigation.navigate('EvaluationQuiz')}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statVal}>{currentUser.points} Pt</Text>
            <Text style={styles.statLabel}>누적 포인트</Text>
          </TouchableOpacity>
          <View style={styles.statPill}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statVal}>3개</Text>
            <Text style={styles.statLabel}>획득 뱃지</Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🎯 추천 학습 & 랭크 평가</Text>
          <Text style={styles.sectionSubtitle}>화면을 눌러 학습 및 10문항 평가를 시작하세요</Text>
        </View>

        {/* Feature Grid */}
        <View style={styles.grid}>
          {features.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                { borderLeftColor: item.color, backgroundColor: item.bgColor },
                item.highlight && styles.highlightCard,
              ]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.85}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                  <Text style={styles.cardIcon}>{item.icon}</Text>
                </View>
                {item.highlight && (
                  <View style={[styles.badge, { backgroundColor: item.color }]}>
                    <Text style={styles.badgeText}>BEST</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Teacher Admin Banner */}
        <View style={styles.teacherBanner}>
          <View style={styles.teacherBannerHeader}>
            <Text style={{ fontSize: 24 }}>👨‍🏫</Text>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.teacherBannerTitle}>교사 전용 스마트 콘솔</Text>
              <Text style={styles.teacherBannerSub}>교과서 RAG 지문 등록 & 페르소나 관리</Text>
            </View>
          </View>
          <View style={styles.teacherRow}>
            <TouchableOpacity
              style={styles.teacherBtn}
              onPress={() => navigation.navigate('TextbookIngest')}
            >
              <Text style={styles.teacherBtnText}>📖 교과서 RAG 색인</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.teacherBtn}
              onPress={() => navigation.navigate('PersonaAdmin')}
            >
              <Text style={styles.teacherBtnText}>🎭 페르소나 지침</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: theme.spacing.md,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md + 4,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadows.medium,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  rankTierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankTierText: {
    fontSize: 11,
    fontWeight: '800',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  settingsBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs + 2,
  },
  xpContainer: {
    marginVertical: theme.spacing.xs,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  xpLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  xpVal: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  xpBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.xs,
  },
  statPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadows.soft,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  card: {
    width: '48%',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadows.soft,
  },
  highlightCard: {
    ...theme.shadows.medium,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs + 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 22,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  teacherBanner: {
    marginTop: theme.spacing.xs,
    backgroundColor: '#EEF2FF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md + 2,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  teacherBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  teacherBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#3730A3',
  },
  teacherBannerSub: {
    fontSize: 11,
    color: '#6366F1',
  },
  teacherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teacherBtn: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  teacherBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4338CA',
  },
});
