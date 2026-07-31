import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import { LanguageSelector } from '../components/LanguageSelector';
import { LanguageCode, markModuleCompleted } from '@dahamkke/shared';
import { edgeApiClient } from '../../infrastructure/edgeApiClient';

const SAMPLE_PASSAGES = [
  {
    title: '📖 흥부전 (국어 4학년 1학기)',
    text: '옛날 옛적 어느 마을에 마음씨 착한 흥부와 부유한 놀부 형제가 살고 있었습니다. 어느 날 흥부는 다리가 부러진 제비를 구해주었고, 제비는 은혜를 갚기 위해 신기한 박 씨 하나를 물어다 주었습니다.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: '🛡️ 이순신 장군과 한산도 대첩 (사회 5학년 1학기)',
    text: '이순신 장군은 학이 날개를 편 모양으로 왜적의 함대를 둘러싸는 학익진 전법을 펼쳤습니다. 1592년 한산도 앞바다에서 거북선과 함께 대승을 거두어 나라의 바다를 지켜냈습니다.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: '👑 세종대왕과 훈민정음 (사회 5학년 2학기)',
    text: '세종대왕께서는 글을 몰라 자신의 뜻을 펼치지 못하는 백성들을 불쌍히 여겨 훈민정음을 창제하셨습니다. 한글은 과학적이고 배우기 쉬운 우리나라 고유 문자입니다.',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&auto=format&fit=crop&q=80',
  },
  {
    title: '🏗️ 정약용과 거중기 (과학 6학년 1학기)',
    text: '조선 후기의 실학자 정약용 선생은 무거운 돌을 적은 힘으로 들어 올릴 수 있는 거중기를 발명했습니다. 이 거중기는 수원 화성을 단기간에 견고하게 쌓는 데 큰 공헌을 했습니다.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
  },
];

export const TranslateScreen = ({ navigation }: any) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('ru');
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [passageIdx, setPassageIdx] = useState(0);

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedTitle, setCapturedTitle] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const executeTranslation = async (passage: typeof SAMPLE_PASSAGES[0]) => {
    setLoading(true);
    setCapturedPhoto(passage.image);
    setCapturedTitle(passage.title);
    setOcrText(passage.text);

    try {
      const res = await edgeApiClient.translate({
        text: passage.text,
        targetLang: selectedLanguage,
      });
      setTranslatedText(res.resultText);
      markModuleCompleted('translate');
    } catch (err) {
      Alert.alert('번역 오류', '번역 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhotoAndTranslate = () => {
    setIsCameraOpen(false);
    const nextPassage = SAMPLE_PASSAGES[passageIdx % SAMPLE_PASSAGES.length];
    setPassageIdx((prev) => prev + 1);
    executeTranslation(nextPassage);
  };

  const handleFinishAndQuiz = () => {
    markModuleCompleted('translate');
    Alert.alert('🔓 학습 완료', '교과서 번역 학습이 완료되어 10문항 성취도 평가가 해제되었습니다!');
    navigation.navigate('EvaluationQuiz', { fromLesson: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📷 교과서 사진 촬영 실시간 번역 (모바일전용)</Text>
        <Text style={styles.subtitle}>스마트폰 카메라로 교과서 지문을 촬영하면 바로 텍스트 인식 및 모국어 번역이 실행됩니다</Text>

        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
        />

        {/* Camera Trigger Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.cameraBtn, { flex: 1, backgroundColor: '#14B8A6' }]}
            onPress={() => setIsCameraOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.cameraIcon}>📸</Text>
            <Text style={styles.cameraBtnText}>카메라로 촬영하여 번역</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cameraBtn, { width: 110, backgroundColor: '#0284C7', marginLeft: 10 }]}
            onPress={() => {
              const nextPassage = SAMPLE_PASSAGES[passageIdx % SAMPLE_PASSAGES.length];
              setPassageIdx((prev) => prev + 1);
              executeTranslation(nextPassage);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.cameraIcon}>🖼️</Text>
            <Text style={styles.cameraBtnText}>샘플촬영</Text>
          </TouchableOpacity>
        </View>

        {/* Photo & Parallel Translation View */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text style={styles.loadingText}>📸 촬영된 이미지 OCR 분석 및 AI 번역 진행 중...</Text>
          </View>
        ) : ocrText ? (
          <View style={styles.comparisonContainer}>
            {/* Captured Image Preview Badge */}
            {capturedPhoto && (
              <View style={styles.photoCard}>
                <View style={styles.photoHeader}>
                  <Text style={styles.photoTag}>📸 촬영된 교과서 페이지 이미지</Text>
                  <Text style={styles.photoTitle}>{capturedTitle}</Text>
                </View>
                <Image source={{ uri: capturedPhoto }} style={styles.previewImage} resizeMode="cover" />
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardHeader}>🇰🇷 인식된 교과서 한국어 원문 (OCR)</Text>
              <Text style={styles.bodyText}>{ocrText}</Text>
            </View>

            <View style={[styles.card, styles.translatedCard]}>
              <Text style={styles.cardHeader}>🌐 {selectedLanguage.toUpperCase()} 모국어 AI 번역 결과</Text>
              <Text style={styles.bodyText}>{translatedText}</Text>
            </View>
          </View>
        ) : null}

        {/* Post Learning Quiz Trigger Button */}
        <TouchableOpacity
          style={styles.finishLearningBtn}
          onPress={handleFinishAndQuiz}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 22, marginRight: 8 }}>🎓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.finishLearningTitle}>단원 학습 완료 & 10문항 평가 풀기</Text>
            <Text style={styles.finishLearningSub}>성취도에 따라 0~20pt 포인트를 얻고 랭크를 올리세요!</Text>
          </View>
          <Text style={{ fontSize: 18, color: '#FFF' }}>➔</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Full-Screen Camera Viewfinder Modal */}
      <Modal visible={isCameraOpen} animationType="slide" transparent={false}>
        <View style={styles.cameraViewfinderContainer}>
          {/* Top Camera Toolbar */}
          <View style={styles.cameraTopBar}>
            <TouchableOpacity onPress={() => setIsCameraOpen(false)}>
              <Text style={styles.cameraTopBtn}>✕ 닫기</Text>
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>교과서 페이지 촬영</Text>
            <TouchableOpacity onPress={() => setFlashOn(!flashOn)}>
              <Text style={styles.cameraTopBtn}>{flashOn ? '⚡ 플래시 ON' : '⚡ 플래시 OFF'}</Text>
            </TouchableOpacity>
          </View>

          {/* Viewfinder Target Box */}
          <View style={styles.viewfinderFrame}>
            <View style={styles.viewfinderGuideBox}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <Text style={styles.guideText}>📄 교과서 지문을 사각형 안에 맞춰주세요</Text>
            </View>
          </View>

          {/* Bottom Shutter Toolbar */}
          <View style={styles.cameraBottomBar}>
            <Text style={styles.shutterHint}>촬영 버튼을 누르면 AI가 글자를 읽고 번역합니다</Text>
            <TouchableOpacity
              style={styles.shutterBtn}
              onPress={handleTakePhotoAndTranslate}
              activeOpacity={0.7}
            >
              <View style={styles.shutterInnerRing} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.primaryDark,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
  },
  cameraBtn: {
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    ...theme.shadows.medium,
  },
  cameraIcon: {
    fontSize: 22,
  },
  cameraBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 20,
    ...theme.shadows.soft,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0D9488',
  },
  comparisonContainer: {
    marginTop: theme.spacing.md,
  },
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadows.soft,
  },
  photoHeader: {
    marginBottom: 10,
  },
  photoTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#14B8A6',
    marginBottom: 2,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  translatedCard: {
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.secondary,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.xs,
  },
  bodyText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  finishLearningBtn: {
    backgroundColor: '#EC4899',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  finishLearningTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  finishLearningSub: {
    color: '#FCE7F3',
    fontSize: 11,
    marginTop: 2,
  },

  /* Camera Viewfinder Modal Styles */
  cameraViewfinderContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
  },
  cameraTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cameraTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cameraTopBtn: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  viewfinderFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  viewfinderGuideBox: {
    width: '100%',
    height: 320,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#38BDF8',
  },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4 },
  guideText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cameraBottomBar: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  shutterHint: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 16,
  },
  shutterBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterInnerRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
});

