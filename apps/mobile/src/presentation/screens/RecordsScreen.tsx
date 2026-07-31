import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { theme } from '../theme';

export const RecordsScreen = () => {
  const [activeTab, setActiveTab] = useState<'translations' | 'dialogs'>('translations');

  const translations = [
    {
      id: '1',
      type: 'OCR 교과서',
      source: '옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다.',
      target: 'Давным-давно в одной деревне жили братья Хынбу и Нолбу.',
      lang: 'RU 🇷🇺',
      date: '2026-07-25',
    },
    {
      id: '2',
      type: '가정통신문',
      source: '2026학년도 현장체험학습 안내문',
      target: 'Уведомление об экскурсии на 2026 учебный год',
      lang: 'RU 🇷🇺',
      date: '2026-07-24',
    },
  ];

  const dialogs = [
    {
      id: '1',
      mode: 'AI 토론 친구',
      topic: '스마트폰 사용 금지 논란',
      lastMsg: '찬성하는 입장의 이유를 잘 명시해줘서 고마워!',
      date: '2026-07-25',
    },
    {
      id: '2',
      mode: '인물 인터뷰',
      character: '흥부',
      lastMsg: '제비 다리를 고쳐준 마음은 순수한 선의였단다.',
      date: '2026-07-24',
    },
  ];

  const handleReviewAI = () => {
    Alert.alert(
      '🤖 AI 복습 도우미 조언',
      '지난번 토론에서 "원망"이라는 단어와 "찬성/반대" 표현을 집중 학습했어요. 퀴즈로 복습해볼까요?'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>📚 학습 기록 (F6)</Text>
        <Text style={styles.subtitle}>내 번역 내역과 대화 기록을 확인하고 AI와 복습해보세요</Text>

        {/* Tab Buttons */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'translations' && styles.activeTabBtn]}
            onPress={() => setActiveTab('translations')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'translations' && styles.activeTabText]}>
              📝 번역 기록
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'dialogs' && styles.activeTabBtn]}
            onPress={() => setActiveTab('dialogs')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'dialogs' && styles.activeTabText]}>
              💬 대화 기록
            </Text>
          </TouchableOpacity>
        </View>

        {/* Record List */}
        <ScrollView style={styles.listContainer}>
          {activeTab === 'translations'
            ? translations.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardBadge}>{item.type}</Text>
                    <Text style={styles.cardDate}>{item.date} | {item.lang}</Text>
                  </View>
                  <Text style={styles.sourceText}>{item.source}</Text>
                  <Text style={styles.targetText}>{item.target}</Text>
                </View>
              ))
            : dialogs.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardBadge, { backgroundColor: '#EDE9FE', color: '#6D28D9' }]}>
                      {item.mode}
                    </Text>
                    <Text style={styles.cardDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.sourceText}>{item.topic || item.character}</Text>
                  <Text style={styles.targetText}>최근 대화: {item.lastMsg}</Text>
                </View>
              ))}
        </ScrollView>

        {/* Floating Review Helper Button */}
        <TouchableOpacity style={styles.reviewBtn} onPress={handleReviewAI} activeOpacity={0.8}>
          <Text style={styles.reviewBtnText}>✨ AI 맞춤 복습 도움 요청</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: theme.borderRadius.md,
    padding: 3,
    marginBottom: theme.spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: theme.spacing.xs + 4,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md - 2,
  },
  activeTabBtn: {
    backgroundColor: '#FFF',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  activeTabText: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardBadge: {
    backgroundColor: theme.colors.primaryLight,
    color: theme.colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  sourceText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  targetText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  reviewBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    ...theme.shadows.medium,
  },
  reviewBtnText: {
    color: '#78350F',
    fontWeight: '800',
    fontSize: 15,
  },
});
