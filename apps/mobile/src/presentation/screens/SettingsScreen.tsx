import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { LanguageSelector } from '../components/LanguageSelector';
import { LanguageCode } from '@dahamkke/shared';

export const SettingsScreen = ({ navigation }: any) => {
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>('ru');
  const [privacyConsent, setPrivacyConsent] = useState(true);

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', onPress: () => navigation.replace('Login') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>⚙️ 설정 및 프로필 (A13)</Text>
        <Text style={styles.subtitle}>계정 프로필과 모국어, 개인정보 보호 설정을 관리하세요</Text>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>👤 사용자 프로필</Text>
          <View style={styles.profileRow}>
            <Text style={styles.profileName}>이서준 학생 (이주배경)</Text>
            <Text style={styles.profileEmail}>seojun@school.es.kr</Text>
          </View>

          <Text style={[styles.sectionHeader, { marginTop: theme.spacing.md }]}>🌐 모국어 설정</Text>
          <LanguageSelector
            selectedLanguage={nativeLanguage}
            onSelectLanguage={setNativeLanguage}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>🔒 디지털 시민성 & 개인정보 동의</Text>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>학습 데이터 비식별화 동의</Text>
              <Text style={styles.toggleDesc}>개인정보 보호 규칙에 따라 본인만 접근 가능한 RLS 정책이 적용됩니다.</Text>
            </View>
            <Switch value={privacyConsent} onValueChange={setPrivacyConsent} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>🚪 로그아웃 (Log Out)</Text>
        </TouchableOpacity>
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
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileRow: {
    paddingVertical: theme.spacing.xs,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  profileEmail: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  toggleDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },
});
