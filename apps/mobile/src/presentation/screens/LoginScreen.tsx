import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { DamiMascot } from '../components/DamiMascot';
import { LanguageSelector } from '../components/LanguageSelector';
import { LanguageCode } from '@dahamkke/shared';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('ko');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    // Navigate to Main Screen
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        </View>

        <View style={styles.header}>
          <DamiMascot message="다함께교실에 오신 것을 환영해요!" size={64} />
          <Text style={styles.title}>다함께교실</Text>
          <Text style={styles.subtitle}>학습장벽 없는 다국어 교실 에이전트</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>이메일 (Email)</Text>
          <TextInput
            style={styles.input}
            placeholder="student@school.es.kr"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>비밀번호 (Password)</Text>
          <TextInput
            style={styles.input}
            placeholder="8자 이상 입력"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginBtnText}>로그인 (Log in)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpBtn}
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.7}
          >
            <Text style={styles.signUpBtnText}>회원가입 (Sign up)</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
  },
  topSection: {
    marginBottom: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    marginTop: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  form: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.soft,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontSize: 15,
    backgroundColor: '#F9FAFB',
  },
  loginBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signUpBtn: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  signUpBtnText: {
    color: theme.colors.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
