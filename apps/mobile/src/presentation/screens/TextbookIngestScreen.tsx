import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { edgeApiClient } from '../../infrastructure/edgeApiClient';

export const TextbookIngestScreen = () => {
  const [subject, setSubject] = useState('국어');
  const [grade, setGrade] = useState('5학년 1학기');
  const [unitTitle, setUnitTitle] = useState('2단원. 작품 속 인물과 나');
  const [rawText, setRawText] = useState(
    `옛날 옛적 어느 마을에 흥부와 놀부 형제가 살고 있었습니다.\n\n놀부는 재산을 독차지하고 착한 동생 흥부를 집에서 쫓아냈습니다.\n\n어느 날 흥부는 제비 다리가 부러진 것을 보고 헝겊으로 정성껏 매어 주었습니다.`
  );
  const [loading, setLoading] = useState(false);

  const handleIngest = async () => {
    if (!rawText) return;
    setLoading(true);
    try {
      const res = await edgeApiClient.ingestTextbook({
        textbookId: 'tb-5-1-unit2',
        rawText,
      });
      Alert.alert(
        '색인 완료',
        `성공적으로 ${res.chunksCount}개 문단이 임베딩 분할 색인되어 DB(pgvector)에 저장되었습니다!`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>👨‍🏫 교사 전용 관리자 화면</Text>
        </View>
        <Text style={styles.title}>📖 교과서 지문 RAG 등록 (A11)</Text>
        <Text style={styles.subtitle}>교과서 지문을 단원별로 입력하면 서버에서 문단 분할 및 vector 임베딩 색인을 수행합니다.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>과목 (Subject)</Text>
          <TextInput style={styles.input} value={subject} onChangeText={setSubject} />

          <Text style={styles.label}>학년/학기 (Grade)</Text>
          <TextInput style={styles.input} value={grade} onChangeText={setGrade} />

          <Text style={styles.label}>단원명 (Unit Title)</Text>
          <TextInput style={styles.input} value={unitTitle} onChangeText={setUnitTitle} />

          <Text style={styles.label}>교과서 원문 지문 (Passage Raw Text)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            multiline
            value={rawText}
            onChangeText={setRawText}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleIngest} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>⚡ RAG 벡터 색인 및 DB 저장</Text>
            )}
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
    backgroundColor: '#EEF2FF',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  badgeText: {
    color: '#4338CA',
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#4338CA',
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
