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
import { LanguageCode, registerNewUser, UserProfile } from '@dahamkke/shared';

export const SignUpScreen = ({ navigation }: any) => {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>('ko');
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  const handleSignUp = () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('알림', '모든 항목을 입력해 주세요.');
      return;
    }
    if (password.length < 4) {
      Alert.alert('알림', '비밀번호는 최소 4자리 이상이어야 합니다.');
      return;
    }
    if (!agreedPrivacy) {
      Alert.alert('동의 필요', '개인정보 수집 및 이용에 동의해 주셔야 가입이 가능합니다.');
      return;
    }

    const isTeacher = role === 'teacher';
    const newUser: UserProfile = {
      id: `${role}-${Date.now()}`,
      email: email.trim(),
      password,
      name: `${name.trim()} (${isTeacher ? '선생님' : '학생'})`,
      role,
      nativeLang: nativeLanguage,
      points: 0,
      completedModules: {
        translate: isTeacher,
        interpret: isTeacher,
        debate: isTeacher,
        persona: isTeacher,
        dictation: isTeacher,
        writing: isTeacher,
      },
      seasonHistory: [],
    };

    registerNewUser(newUser);

    Alert.alert(
      '회원가입 완료',
      `🎉 환영합니다, ${newUser.name}님!${isTeacher ? '\n👨‍🏫 교사 콘솔 권한이 부여되었습니다.' : ''}`,
      [{ text: '시작하기', onPress: () => navigation.replace('Main') }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>회원가입 (Sign Up)</Text>
        <Text style={styles.subtitle}>다함께교실과 함께 언어장벽 없이 배워보세요</Text>

        <View style={styles.form}>
          {/* 계정 유형 선택 */}
          <Text style={styles.inputLabel}>계정 유형 선택 (Role)</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === 'student' && styles.roleBtnActiveStudent,
              ]}
              onPress={() => setRole('student')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  role === 'student' && styles.roleBtnTextActiveStudent,
                ]}
              >
                🎒 학생 (Student)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === 'teacher' && styles.roleBtnActiveTeacher,
              ]}
              onPress={() => setRole('teacher')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  role === 'teacher' && styles.roleBtnTextActiveTeacher,
                ]}
              >
                👨‍🏫 교사 (Teacher)
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>
            {role === 'teacher' ? '선생님 성함' : '학생 이름 (Name)'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={role === 'teacher' ? '김선생님' : '홍길동 / Alex'}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.inputLabel}>이메일 주소 (Email)</Text>
          <TextInput
            style={styles.input}
            placeholder={role === 'teacher' ? 'teacher@school.es.kr' : 'student@school.es.kr'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>비밀번호 (Password)</Text>
          <TextInput
            style={styles.input}
            placeholder="4자 이상 입력"
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

          {/* 개인정보 수집 및 이용 동의 */}
          <View style={styles.privacyBox}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
              onPress={() => setAgreedPrivacy(!agreedPrivacy)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  agreedPrivacy && styles.checkboxActive,
                ]}
              >
                {agreedPrivacy && <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '900' }}>✓</Text>}
              </View>
              <Text style={styles.privacyCheckLabel}>
                [필수] 개인정보 수집 및 이용 동의
              </Text>
            </TouchableOpacity>

            <View style={styles.privacyTextBox}>
              <Text style={styles.privacyText}>
                1. 수집 항목: 이름, 이메일, 비밀번호, 모국어, 계정 유형(학생/교사){'\n'}
                2. 수집 목적: 다함께교실 다문화 맞춤형 교육 서비스 및 교사 콘솔 권한 부여{'\n'}
                3. 보유 및 이용 기간: 회원 탈퇴 시까지 (탈퇴 즉시 영구 파기)
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSignUp} activeOpacity={0.8}>
            <Text style={styles.submitBtnText}>
              {role === 'teacher' ? '👨‍🏫 교사 회원가입 완료' : '가입하기 (Create Account)'}
            </Text>
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
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBtnActiveStudent: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  roleBtnActiveTeacher: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  roleBtnTextActiveStudent: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  roleBtnTextActiveTeacher: {
    color: '#4338CA',
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
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
  privacyBox: {
    marginTop: theme.spacing.lg,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  privacyCheckLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  privacyTextBox: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  privacyText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
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
