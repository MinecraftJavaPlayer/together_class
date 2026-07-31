import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { theme } from '../theme';
import {
  getShuffledEvaluationQuiz,
  QuizQuestion,
  getRankByPoints,
  calculateQuizPoints,
  getCurrentUser,
  addPointsToCurrentUser,
  RankTier,
  RANK_TIERS,
  UserProfile,
} from '@dahamkke/shared';
import { RankEmblemImage } from '../components/RankEmblemImage';

export const EvaluationQuizScreen = ({ navigation, route }: any) => {
  const [isUnlocked, setIsUnlocked] = useState(route?.params?.fromLesson ?? true);
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    setQuizQuestions(getShuffledEvaluationQuiz());
  }, []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Animation states for mobile result modal
  const [animValue, setAnimValue] = useState(0);

  const currentQ: QuizQuestion = quizQuestions[currentIdx] || {
    id: 0,
    question: '로딩 중...',
    type: 'multiple-choice',
    difficulty: '중',
    options: [],
    answerIndex: 0,
    explanation: '',
  };
  const currentRank = getRankByPoints(currentUser.points);

  // Find next rank tier for progress bar
  const currentRankIndex = RANK_TIERS.findIndex((r) => r.id === currentRank.id);
  const nextRank = RANK_TIERS[currentRankIndex + 1] || currentRank;

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitQuestion = () => {
    if (currentQ.type === 'short-answer') {
      if (!shortAnswerInput.trim()) {
        Alert.alert('알림', '정답을 입력해 주세요.');
        return;
      }
      const normInput = shortAnswerInput.trim().toLowerCase().replace(/\s+/g, '');
      const isCorrect = currentQ.acceptableAnswers?.some(
        (ans) => ans.trim().toLowerCase().replace(/\s+/g, '') === normInput
      );
      setIsSubmitted(true);
      setIsLastAnswerCorrect(!!isCorrect);
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }
    } else {
      if (selectedOption === null) {
        Alert.alert('알림', '답안을 선택해 주세요.');
        return;
      }
      const isCorrect = selectedOption === currentQ.answerIndex;
      setIsSubmitted(true);
      setIsLastAnswerCorrect(isCorrect);
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    setIsSubmitted(false);
    setSelectedOption(null);
    setShortAnswerInput('');
    setIsLastAnswerCorrect(false);

    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Calculate points (-20 to +20)
      const pts = calculateQuizPoints(correctCount);
      const { updatedUser } = addPointsToCurrentUser(pts);

      setEarnedPoints(pts);
      setCurrentUser(updatedUser);
      setQuizFinished(true);

      // Start Number Counting Animation
      setAnimValue(0);

      const target = pts;
      const duration = 1400;
      const steps = 30;
      const stepTime = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentVal = Math.round(target * progress);
        setAnimValue(currentVal);

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimValue(target);
        }
      }, stepTime);
    }
  };

  const handleRestartQuiz = () => {
    setQuizQuestions(getShuffledEvaluationQuiz());
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setQuizFinished(false);
    setCorrectCount(0);
    setEarnedPoints(0);
    setAnimValue(0);
  };

  // Progress percentage calculation
  const totalRange = nextRank.id === currentRank.id ? 1 : nextRank.minPoints - currentRank.minPoints;
  const currentProgressPoints = currentUser.points - currentRank.minPoints;
  const progressPercent = nextRank.id === currentRank.id ? 100 : Math.min(100, Math.max(0, (currentProgressPoints / totalRange) * 100));

  // Determine point text color and sign
  let ptColor = '#FBBF24'; // Default Dark Yellow (+0)
  let ptFormatted = '+0 pt';

  if (earnedPoints > 0) {
    ptColor = '#4ADE80'; // Lime Green (+)
    ptFormatted = `+${animValue} pt`;
  } else if (earnedPoints < 0) {
    ptColor = '#F87171'; // Vibrant Red (-)
    ptFormatted = `${animValue} pt`;
  } else {
    ptColor = '#FBBF24'; // Dark Yellow (0)
    ptFormatted = `+0 pt`;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Rank Badge Status Bar */}
        <View style={[styles.rankStatusBar, { backgroundColor: currentRank.bgColor, borderColor: currentRank.color }]}>
          <View style={styles.rankStatusHeader}>
            <RankEmblemImage tierGroup={currentRank.tierGroup} style={{ width: 36, height: 36, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rankStatusTitle, { color: currentRank.color }]}>
                현재 랭크: {currentRank.name}
              </Text>
              <Text style={styles.rankStatusPts}>
                누적 포인트: {currentUser.points} pt
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>📝 학습 성취도 10문항 평가 (Quiz)</Text>
        <Text style={styles.subtitle}>단원 학습을 마치고 10문제를 풀어 성취도에 따라 -20pt ~ +20pt를 획득/차감하세요!</Text>

        {!isUnlocked ? (
          <View style={styles.lockedCard}>
            <Text style={{ fontSize: 64, marginBottom: 12 }}>🔒</Text>
            <Text style={styles.lockedTitle}>학습 미완료 상태입니다</Text>
            <Text style={styles.lockedSub}>
              교과서 번역, 통역, AI 토론, 인물 인터뷰 등 단원 학습을 먼저 완료해야 10문항 성취도 평가에 응시할 수 있습니다.
            </Text>

            <TouchableOpacity
              style={styles.goLearningBtn}
              onPress={() => navigation.navigate('Translate')}
            >
              <Text style={styles.goLearningBtnText}>📷 교과서 단원 학습 시작하기 ➔</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.quizCard}>
            <View style={styles.quizProgressHeader}>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: currentQ.difficulty === '하' ? '#166534' : currentQ.difficulty === '중' ? '#92400E' : '#991B1B', backgroundColor: currentQ.difficulty === '하' ? '#DCFCE7' : currentQ.difficulty === '중' ? '#FEF3C7' : '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                  난이도: {currentQ.difficulty || '중'}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '800', color: currentQ.type === 'short-answer' ? '#4338CA' : '#475569', backgroundColor: currentQ.type === 'short-answer' ? '#EEF2FF' : '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                  {currentQ.type === 'short-answer' ? '✍️ 주관식' : '🔘 객관식'}
                </Text>
              </View>
              <Text style={styles.progressText}>문제 {currentIdx + 1} / {quizQuestions.length}</Text>
            </View>

            <Text style={styles.questionText}>Q{currentIdx + 1}. {currentQ.question}</Text>

            {currentQ.type === 'short-answer' ? (
              <View style={{ marginBottom: 20 }}>
                <TextInput
                  style={{
                    borderWidth: 2,
                    borderColor: isSubmitted ? (isLastAnswerCorrect ? '#22C55E' : '#EF4444') : '#3B82F6',
                    backgroundColor: isSubmitted ? (isLastAnswerCorrect ? '#DCFCE7' : '#FEE2E2') : '#FFFFFF',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#0F172A',
                  }}
                  placeholder="정답을 직접 입력하세요 (예: 제비, 학익진)"
                  value={shortAnswerInput}
                  onChangeText={(text) => !isSubmitted && setShortAnswerInput(text)}
                  editable={!isSubmitted}
                />
              </View>
            ) : (
              <View style={styles.optionsList}>
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.answerIndex;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.optionItem,
                        isSelected && styles.selectedOptionItem,
                        isSubmitted && isCorrect && styles.correctOptionItem,
                        isSubmitted && isSelected && !isCorrect && styles.wrongOptionItem,
                      ]}
                      onPress={() => handleSelectOption(idx)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.optionNum}>{idx + 1}.</Text>
                      <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {isSubmitted && (
              <View style={styles.explanationBox}>
                <Text style={styles.expTitle}>
                  {isLastAnswerCorrect ? '✅ 정답입니다!' : '❌ 아쉽습니다!'}
                  {currentQ.type === 'short-answer' && !isLastAnswerCorrect && (
                    <Text style={{ color: '#059669', fontSize: 13 }}>
                      {` (정답 예시: ${currentQ.acceptableAnswers?.[0]})`}
                    </Text>
                  )}
                </Text>
                <Text style={styles.expText}>{currentQ.explanation}</Text>
              </View>
            )}

            {!isSubmitted ? (
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitQuestion}>
                <Text style={styles.btnText}>정답 제출</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.nextBtn} onPress={handleNextQuestion}>
                <Text style={styles.btnText}>
                  {currentIdx + 1 < quizQuestions.length ? '다음 문제 ➔' : '최종 평가 결과 보기 🏆'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Mobile Full-Screen Dimmed Overlay Modal (No Solid White Container, Glass Style) */}
        <Modal
          visible={quizFinished}
          transparent={true}
          animationType="fade"
          onRequestClose={handleRestartQuiz}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.glassModalContent}>
              <Text style={styles.modalTitle}>🎉 10문항 학습 평가 결과</Text>
              <Text style={styles.modalSub}>정답 수: {correctCount} / 10개</Text>

              {/* Large Centered 3D Rank Emblem Image */}
              <View style={styles.modalEmblemBox}>
                <RankEmblemImage
                  tierGroup={currentRank.tierGroup}
                  style={{ width: 100, height: 100, borderRadius: 20, borderWidth: 3, borderColor: currentRank.color }}
                />
              </View>

              <Text style={[styles.modalRankName, { color: currentRank.color }]}>{currentRank.name}</Text>
              <Text style={styles.modalTotalPts}>현재 누적 포인트: {currentUser.points} pt</Text>

              {/* Rank Progress Bar (Current Rank Emblem -> Progress Track -> Next Rank Emblem) */}
              <View style={styles.progressBarBox}>
                <View style={styles.progressHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RankEmblemImage tierGroup={currentRank.tierGroup} style={{ width: 24, height: 24, borderRadius: 6, marginRight: 4 }} />
                    <Text style={[styles.progressTierName, { color: currentRank.color }]}>{currentRank.name}</Text>
                  </View>

                  <Text style={styles.progressPtsText}>
                    {currentUser.points} / {nextRank.minPoints === Infinity ? 'MAX' : nextRank.minPoints} pt
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.progressTierName, { color: nextRank.color, marginRight: 4 }]}>{nextRank.name}</Text>
                    <RankEmblemImage tierGroup={nextRank.tierGroup} style={{ width: 24, height: 24, borderRadius: 6 }} />
                  </View>
                </View>

                {/* Track */}
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: currentRank.color }]} />
                </View>
              </View>

              {/* Animated Points Counter Area */}
              <View style={styles.modalCounterBox}>
                <Text style={styles.counterLabel}>획득 / 차감 랭크 포인트</Text>
                <Text style={[styles.counterVal, { color: ptColor }]}>{ptFormatted}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.restartBtn} onPress={handleRestartQuiz}>
                  <Text style={styles.restartBtnText}>🔄 다시 풀기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Main')}>
                  <Text style={styles.homeBtnText}>🏠 홈으로 이동</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  rankStatusBar: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    ...theme.shadows.soft,
  },
  rankStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankStatusTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  rankStatusPts: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '600',
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
  lockedCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  lockedSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: theme.spacing.lg,
  },
  goLearningBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  goLearningBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  quizCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  quizProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  pointRewardBadge: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  optionsList: {
    marginBottom: theme.spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs + 2,
  },
  selectedOptionItem: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  correctOptionItem: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
    borderWidth: 2,
  },
  wrongOptionItem: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  optionNum: {
    fontSize: 15,
    fontWeight: '800',
    marginRight: 8,
    color: '#475569',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  explanationBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  expTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
    color: '#0F172A',
  },
  expText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  nextBtn: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // Slightly lower opacity backdrop
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  glassModalContent: {
    backgroundColor: 'rgba(30, 41, 59, 0.92)', // Glass style, no solid white box
    borderRadius: theme.borderRadius.xl + 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: theme.spacing.lg + 4,
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    ...theme.shadows.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  modalSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: theme.spacing.md,
  },
  modalEmblemBox: {
    marginBottom: theme.spacing.xs,
  },
  modalRankName: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 2,
  },
  modalTotalPts: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: theme.spacing.md,
  },
  progressBarBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: theme.spacing.sm + 4,
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTierName: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressPtsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalCounterBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: theme.spacing.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  counterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 2,
  },
  counterVal: {
    fontSize: 38,
    fontWeight: '900',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  restartBtn: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginRight: 6,
  },
  restartBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  homeBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginLeft: 6,
  },
  homeBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
