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

export const PersonaAdminScreen = () => {
  const [characterName, setCharacterName] = useState('흥부');
  const [systemPrompt, setSystemPrompt] = useState(
    '너는 교과서 속 인물 흥부야. 착하고 따뜻한 성격이며, 초등학생 어린이에게 1인칭으로 친절하게 대답해줘. 교과서 밖 내용은 반드시 "이건 제 상상이에요"라고 말해야 해.'
  );

  const handleSavePersona = () => {
    Alert.alert('저장 완료', `'${characterName}' 인물 페르소나가 성공적으로 등록되었습니다.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>👨‍🏫 교사 전용 관리자 화면</Text>
        </View>
        <Text style={styles.title}>🎭 페르소나 설정 (A12)</Text>
        <Text style={styles.subtitle}>교과서 속 인물의 프롬프트 엔지니어링 지침(System Prompt)을 작성해 등록하세요.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>인물 이름 (Character Name)</Text>
          <TextInput style={styles.input} value={characterName} onChangeText={setCharacterName} />

          <Text style={styles.label}>프롬프트 엔지니어링 지침 (System Prompt)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            multiline
            value={systemPrompt}
            onChangeText={setSystemPrompt}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSavePersona}>
            <Text style={styles.submitBtnText}>💾 페르소나 등록 및 업데이트</Text>
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  badgeText: {
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '700',
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
  form: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.soft,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 4,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
  },
  multilineInput: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#6D28D9',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
