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
import { LanguageSelector } from '../components/LanguageSelector';
import { LanguageCode } from '@dahamkke/shared';

export const SignUpScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>('ru');

  const handleSignUp = () => {
    if (!name || !email || !password) {
      Alert.alert('알림', '모든 항목을 작성해 주세요.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('알림', '비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    Alert.alert('회원가입 완료', '성공적으로 가입되었습니다!', [
      { text: '확인', onPress: () => navigation.replace('Main') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>회원가입 (Sign Up)</Text>
        <Text style={styles.subtitle}>다함께교실과 함께 언어장벽 없이 배워보세요</Text>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>이름 (Name)</Text>
          <TextInput
            style={styles.input}
            placeholder="홍길동 / Alex"
            value={name}
            onChangeText={setName}
          />

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

          <Text style={[styles.inputLabel, { marginTop: theme.spacing.md }]}>
            모국어 선택 (Native Language)
          </Text>
          <LanguageSelector
            selectedLanguage={nativeLanguage}
            onSelectLanguage={setNativeLanguage}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSignUp} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>가입하기 (Create Account)</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
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
  submitBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
