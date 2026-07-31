import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { theme } from '../theme';
import { LanguageSelector } from '../components/LanguageSelector';
import { LanguageCode } from '@dahamkke/shared';
import { edgeApiClient } from '../../infrastructure/edgeApiClient';

export const NoticeScreen = () => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('ru');
  const [loading, setLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [resultData, setResultData] = useState<any>({
    summary: {
      dates: ['2026년 7월 30일(목) 09:00'],
      items: ['실내화', '도시락', '개인 텀블러'],
      deadlines: ['2026년 7월 28일(화) 17:00까지 제출'],
    },
    translationText:
      'Уважаемые родители! Приглашаем на экскурсию 30 июля. Пожалуйста, подготовьте обед и термос.',
  });

  const handleTranslateNotice = async () => {
    setLoading(true);
    try {
      const res = await edgeApiClient.translateNotice({
        imageBase64: 'demo-notice-img',
        targetLangs: [selectedLang],
      });
      setResultData({
        summary: res.summary,
        translationText: res.translations[selectedLang] || '번역 결과를 불러왔습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📄 가정통신문 번역 & 핵심요약 (F7)</Text>
        <Text style={styles.subtitle}>학교 가정통신문 사진을 찍으면 다국어 번역과 주요 일정을 요약합니다</Text>

        <LanguageSelector selectedLanguage={selectedLang} onSelectLanguage={setSelectedLang} />

        {/* Action Button */}
        <TouchableOpacity
          style={styles.noticeUploadBtn}
          onPress={handleTranslateNotice}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.noticeUploadBtnText}>📸 가정통신문 촬영 & 번역하기</Text>
          )}
        </TouchableOpacity>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeaderTitle}>📌 핵심 요약 (Key Summary)</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>📅</Text>
            <View>
              <Text style={styles.summaryLabel}>행사 일시</Text>
              {resultData.summary.dates.map((d: string, i: number) => (
                <Text key={i} style={styles.summaryVal}>{d}</Text>
              ))}
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>🎒</Text>
            <View>
              <Text style={styles.summaryLabel}>준비물</Text>
              <Text style={styles.summaryVal}>{resultData.summary.items.join(', ')}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryIcon}>⏰</Text>
            <View>
              <Text style={styles.summaryLabel}>제출 기한</Text>
              {resultData.summary.deadlines.map((dl: string, i: number) => (
                <Text key={i} style={styles.summaryVal}>{dl}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Translation Content */}
        <View style={styles.transCard}>
          <Text style={styles.cardHeaderTitle}>🌐 다국어 번역본 ({selectedLang.toUpperCase()})</Text>
          <Text style={styles.transText}>{resultData.translationText}</Text>
        </View>

        {/* Share QR Button */}
        <TouchableOpacity style={styles.qrBtn} onPress={() => setShowQrModal(true)}>
          <Text style={styles.qrBtnText}>📲 학부모 휴대폰 열람용 QR코드 생성</Text>
        </TouchableOpacity>

        {/* QR Modal */}
        <Modal visible={showQrModal} transparent animationType="fade">
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>📱 학부모 공유 QR 코드</Text>
              <Text style={styles.modalSub}>카메라로 스캔하면 번역본을 확인할 수 있습니다.</Text>
              <View style={styles.qrPlaceholder}>
                <Text style={{ fontSize: 72 }}>🏁</Text>
                <Text style={{ fontSize: 12, color: theme.colors.textMuted }}>[QR Code Demo Image]</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowQrModal(false)}>
                <Text style={styles.closeBtnText}>닫기</Text>
              </TouchableOpacity>
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
  noticeUploadBtn: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  noticeUploadBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    ...theme.shadows.soft,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs + 4,
  },
  summaryIcon: {
    fontSize: 22,
    marginRight: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78350F',
  },
  transCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  transText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  qrBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  qrBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  modalSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginVertical: theme.spacing.xs,
  },
  qrPlaceholder: {
    marginVertical: theme.spacing.md,
    alignItems: 'center',
  },
  closeBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  closeBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
