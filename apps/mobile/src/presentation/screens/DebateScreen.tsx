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

interface DebateMsg {
  id: string;
  sender: 'ai' | 'user';
  textKo: string;
  textUser: string;
  sources?: string[];
}

export const DebateScreen = () => {
  const [userLang, setUserLang] = useState<LanguageCode>('ru');
  const [topic, setTopic] = useState('교실 내 스마트폰 사용 금지 논란');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<DebateMsg[]>([
    {
      id: '1',
      sender: 'ai',
      textKo: '안녕! 나는 국어 교과서로 열심히 공부한 민준이야. 오늘 주제인 "스마트폰 사용 금지"에 대해 넌 어떻게 생각하니?',
      textUser: 'Привет! Я Минжун. Что ты думаешь по поводу "запрета смартфонов" в классе?',
      sources: ['국어 5-2 4단원 (매체와 표현) 3문단'],
    },
  ]);

  const handleSend = async (contentToSend?: string) => {
    const message = contentToSend || inputText;
    if (!message) return;

    const userMsg: DebateMsg = {
      id: Date.now().toString(),
      sender: 'user',
      textKo: message,
      textUser: message,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await edgeApiClient.chatDebate({
        topic,
        message,
        userLang,
      });

      const aiMsg: DebateMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        textKo: res.replyKo,
        textUser: res.replyUser,
        sources: res.sources,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedReplies = [
    '수업 시간에 집중이 잘 안 돼서 찬성해!',
    '긴급 연락을 위해 반대하는 입장이야.',
    '쉬는 시간에만 허용하면 좋겠어.',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>💬 AI 토론 친구 민준이 (F3)</Text>
        <Text style={styles.subtitle}>교과서를 학습한 가상 한국인 친구 민준이와 근거 바탕 토론을 연습하세요</Text>

        <LanguageSelector selectedLanguage={userLang} onSelectLanguage={setUserLang} />

        {/* Topic Chip Banner */}
        <View style={styles.topicBanner}>
          <Text style={styles.topicTag}>오늘의 교과서 토론 주제</Text>
          <Text style={styles.topicText}>📌 {topic}</Text>
        </View>

        {/* Chat Thread */}
        <ScrollView style={styles.chatThread}>
          {messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageContainer,
                item.sender === 'user' ? styles.userAlign : styles.aiAlign,
              ]}
            >
              <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={styles.senderLabel}>
                  {item.sender === 'user' ? '나 (Student)' : '👦🏻 한국인 친구 민준 (교과서 학습 완료)'}
                </Text>
                <Text style={styles.textKo}>{item.textKo}</Text>
                {item.sender === 'ai' && userLang !== 'ko' && (
                  <Text style={styles.textUser}>↪ {item.textUser}</Text>
                )}

                {/* Grounded RAG Sources */}
                {item.sender === 'ai' && item.sources && item.sources.length > 0 && (
                  <View style={styles.sourcesRow}>
                    {item.sources.map((src, idx) => (
                      <View key={idx} style={styles.sourceTag}>
                        <Text style={styles.sourceTagText}>🏷️ 교과서 근거: {src}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
          {loading && <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 10 }} />}
        </ScrollView>

        {/* Suggested Replies Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {suggestedReplies.map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.chip}
              onPress={() => handleSend(chip)}
            >
              <Text style={styles.chipText}>💡 {chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="내 의견을 입력하세요 (내 언어 가능)"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()} activeOpacity={0.8}>
            <Text style={styles.sendBtnText}>전송</Text>
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
  topicBanner: {
    backgroundColor: '#EFF6FF',
    padding: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginVertical: theme.spacing.xs,
  },
  topicTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  topicText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginTop: 2,
  },
  chatThread: {
    flex: 1,
    marginVertical: theme.spacing.sm,
  },
  messageContainer: {
    marginBottom: theme.spacing.sm,
    maxWidth: '85%',
  },
  aiAlign: {
    alignSelf: 'flex-start',
  },
  userAlign: {
    alignSelf: 'flex-end',
  },
  bubble: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.soft,
  },
  aiBubble: {
    backgroundColor: '#FFF',
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  textKo: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 20,
    fontWeight: '600',
  },
  textUser: {
    fontSize: 13,
    color: theme.colors.primaryDark,
    marginTop: 4,
  },
  sourcesRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sourceTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 4,
  },
  sourceTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4338CA',
  },
  chipRow: {
    maxHeight: 40,
    marginBottom: theme.spacing.xs,
  },
  chip: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.xs,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  chipText: {
    fontSize: 12,
    color: '#92400E',
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
    backgroundColor: theme.colors.primary,
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
