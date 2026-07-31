import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import {
  PRACTICE_WORDS,
  normalizePracticeAnswer,
  LanguageCode,
  UI_TRANSLATIONS,
  playKoreanSpeech,
} from '@dahamkke/shared';
import { LanguageSelector } from '../components/LanguageSelector';

export const DictationScreen = ({ navigation }: any) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('ru');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentWord = PRACTICE_WORDS[currentIndex];
  const copy = UI_TRANSLATIONS[selectedLang] || UI_TRANSLATIONS.ko;

  const handlePlayAudio = () => {
    // Play real TTS audio speech in Korean!
    playKoreanSpeech(currentWord.wordKo);
  };

  const handleCheckAnswer = () => {
    if (!userAnswer) {
      Alert.alert('알림', '단어를 입력해주세요.');
      return;
    }

    const isCorrect =
      normalizePracticeAnswer(userAnswer) === normalizePracticeAnswer(currentWord.wordKo);

    if (isCorrect) {
      setScore((prev) => prev + 20);
      Alert.alert('🎉 정답입니다!', `+20 포인트 획득! ("${currentWord.wordKo}")`, [
        { text: '다음 단어', onPress: handleNextWord },
      ]);
    } else {
      Alert.alert('❌ 아쉬워요!', `정답: ${currentWord.wordKo}\n입력: ${userAnswer}`, [
        { text: '다음 단어', onPress: handleNextWord },
      ]);
    }
  };

  const handleNextWord = () => {
    setUserAnswer('');
    if (currentIndex + 1 < PRACTICE_WORDS.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>✍️ {copy.dictationTitle || '받아쓰기 연습'}</Text>
        <Text style={styles.subtitle}>단어 발음을 듣고 정확하게 한국어로 적어보세요</Text>

        <LanguageSelector selectedLanguage={selectedLang} onSelectLanguage={setSelectedLang} />

        <View style={styles.scoreBar}>
          <Text style={styles.scoreText}>⭐ 획득 포인트: {score} Pt</Text>
          <Text style={styles.progressText}>
            진행률: {currentIndex + 1} / {PRACTICE_WORDS.length}
          </Text>
        </View>

        {!showResult ? (
          <View style={styles.card}>
            <View style={styles.wordHeader}>
              <Text style={styles.diffBadge}>난이도: {currentWord.difficulty.toUpperCase()}</Text>
              <Text style={styles.meaningText}>의미: {currentWord.meaning}</Text>
            </View>

            <TouchableOpacity style={styles.audioBtn} onPress={handlePlayAudio} activeOpacity={0.8}>
              <Text style={styles.audioIcon}>🔊</Text>
              <Text style={styles.audioBtnText}>한국어 발음 듣기 (TTS 재생)</Text>
            </TouchableOpacity>

            <Text style={styles.label}>받아쓰기 정답 입력:</Text>
            <TextInput
              style={styles.input}
              placeholder="들린 한국어 단어를 입력하세요"
              value={userAnswer}
              onChangeText={setUserAnswer}
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleCheckAnswer} activeOpacity={0.8}>
              <Text style={styles.submitBtnText}>정답 확인하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>🏆</Text>
            <Text style={styles.resultTitle}>받아쓰기 단원 학습 완료!</Text>
            <Text style={styles.resultScore}>획득 포인트: {score} Pt</Text>

            {/* Post Learning Quiz Trigger Button */}
            <TouchableOpacity
              style={styles.quizUnlockBtn}
              onPress={() => navigation.navigate('EvaluationQuiz')}
            >
              <Text style={styles.quizUnlockBtnText}>🎓 10문항 학습 성취도 평가 풀러 가기 ➔</Text>
            </TouchableOpacity>
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
    marginBottom: theme.spacing.xs,
  },
  scoreBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    padding: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350F',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.soft,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  diffBadge: {
    backgroundColor: theme.colors.primaryLight,
    color: theme.colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  meaningText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  audioBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  audioIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  audioBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: theme.spacing.md,
  },
  submitBtn: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  resultScore: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.lg,
  },
  quizUnlockBtn: {
    backgroundColor: '#EC4899',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  quizUnlockBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
