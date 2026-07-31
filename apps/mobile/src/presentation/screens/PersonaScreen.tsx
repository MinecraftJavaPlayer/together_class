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
} from 'react-native';
import { theme } from '../theme';
import { LanguageSelector } from '../components/LanguageSelector';
import { LanguageCode } from '@dahamkke/shared';
import { edgeApiClient } from '../../infrastructure/edgeApiClient';

export const PersonaScreen = () => {
  const [userLang, setUserLang] = useState<LanguageCode>('ru');
  const [selectedCharacter, setSelectedCharacter] = useState('흥부');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      character: '흥부',
      answer: '반갑다, 얘들아! 나는 교과서 속 흥부란다. 형 놀부에게 쫓겨났지만 마음을 따뜻하게 가지려 노력했지. 궁금한 게 있니?',
      sources: ['국어 5-1 나 2단원 1문단'],
    },
  ]);

  const characters = [
    { name: '흥부', icon: '🌾', book: '흥부전' },
    { name: '이순신', icon: '⚔️', book: '난중일기' },
    { name: '세종대왕', icon: '📜', book: '훈민정음' },
  ];

  const handleAsk = async (qText?: string) => {
    const askText = qText || question;
    if (!askText) return;

    setLoading(true);
    setQuestion('');

    try {
      const res = await edgeApiClient.askPersona({
        personaId: selectedCharacter,
        question: askText,
        userLang,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          character: selectedCharacter,
          answer: res.answer,
          sources: res.sources,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    '왜 놀부 형님을 원망하지 않았나요?',
    '제비 다리를 고쳐줄 때 어떤 마음이었나요?',
    '가장 힘들었던 순간은 언제였나요?',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>🎭 교과서 인물 인터뷰 (F4·F5)</Text>
        <Text style={styles.subtitle}>교과서 인물과 1인칭으로 대화하며 근거를 확인해보세요</Text>

        <LanguageSelector selectedLanguage={userLang} onSelectLanguage={setUserLang} />

        {/* Character Pickers */}
        <View style={styles.characterRow}>
          {characters.map((c) => {
            const isSelected = selectedCharacter === c.name;
            return (
              <TouchableOpacity
                key={c.name}
                style={[styles.charCard, isSelected && styles.selectedCharCard]}
                onPress={() => setSelectedCharacter(c.name)}
              >
                <Text style={{ fontSize: 24 }}>{c.icon}</Text>
                <Text style={[styles.charName, isSelected && styles.selectedCharName]}>{c.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Chat Log */}
        <ScrollView style={styles.chatThread}>
          {messages.map((item) => (
            <View key={item.id} style={styles.messageBox}>
              <Text style={styles.characterTag}>🎭 인물 답변 ({item.character})</Text>
              <Text style={styles.answerText}>{item.answer}</Text>

              {/* RAG Sources Tag */}
              <View style={styles.sourceTagRow}>
                {item.sources.map((src, idx) => (
                  <View key={idx} style={styles.sourceChip}>
                    <Text style={styles.sourceChipText}>🏷️ 근거: {src}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          {loading && <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 10 }} />}
        </ScrollView>

        {/* Suggested Questions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {suggestedQuestions.map((sq, idx) => (
            <TouchableOpacity key={idx} style={styles.sqChip} onPress={() => handleAsk(sq)}>
              <Text style={styles.sqChipText}>❓ {sq}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={`${selectedCharacter}에게 궁금한 점을 질문해보세요`}
            value={question}
            onChangeText={setQuestion}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleAsk()} activeOpacity={0.8}>
            <Text style={styles.sendBtnText}>질문</Text>
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
  characterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.xs,
  },
  charCard: {
    width: '31%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedCharCard: {
    backgroundColor: '#F3E8FF',
    borderColor: '#9333EA',
  },
  charName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 2,
  },
  selectedCharName: {
    color: '#7E22CE',
  },
  chatThread: {
    flex: 1,
    marginVertical: theme.spacing.sm,
  },
  messageBox: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  characterTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7E22CE',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  sourceTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  sourceChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  sourceChipText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  chipRow: {
    maxHeight: 40,
    marginBottom: theme.spacing.xs,
  },
  sqChip: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.xs,
  },
  sqChipText: {
    fontSize: 12,
    color: '#5B21B6',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontSize: 14,
    marginRight: theme.spacing.xs,
  },
  sendBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    borderRadius: theme.borderRadius.lg,
  },
  sendBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
