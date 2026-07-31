import React, { useState } from 'react';
import {
  View,
  Text,
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

interface LogMessage {
  id: string;
  speaker: 'ko' | 'user';
  sourceText: string;
  translatedText: string;
  lang: string;
  time: string;
}

export const InterpretScreen = () => {
  const [userLang, setUserLang] = useState<LanguageCode>('ru');
  const [recording, setRecording] = useState<null | 'ko' | 'user'>(null);
  const [messages, setMessages] = useState<LogMessage[]>([
    {
      id: '1',
      speaker: 'ko',
      sourceText: '오늘 수업 때 모르는 단어가 있나요?',
      translatedText: 'Есть ли сегодня на уроке незнакомые слова?',
      lang: 'ru',
      time: '11:00',
    },
    {
      id: '2',
      speaker: 'user',
      sourceText: 'Да, слово "토의" непонятно.',
      translatedText: '네, "토의"라는 단어가 이해되지 않아요.',
      lang: 'ru',
      time: '11:01',
    },
  ]);

  const handleSpeak = async (speaker: 'ko' | 'user') => {
    setRecording(speaker);
    setTimeout(async () => {
      try {
        const res = await edgeApiClient.interpret({
          audioBase64: 'demo-audio',
          fromLang: speaker === 'ko' ? 'ko' : userLang,
          toLang: speaker === 'ko' ? userLang : 'ko',
        });

        const newMsg: LogMessage = {
          id: Date.now().toString(),
          speaker,
          sourceText: res.sourceText,
          translatedText: res.resultText,
          lang: userLang,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, newMsg]);
      } finally {
        setRecording(null);
      }
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>🎙️ 실시간 통역 (F2)</Text>
        <Text style={styles.subtitle}>한국어 짝꿍과 번갈아 말하며 양방향 통역하세요</Text>

        <LanguageSelector selectedLanguage={userLang} onSelectLanguage={setUserLang} />

        {/* Conversation Logs */}
        <ScrollView style={styles.chatThread} contentContainerStyle={{ paddingVertical: 10 }}>
          {messages.map((item) => {
            const isKorean = item.speaker === 'ko';
            return (
              <View
                key={item.id}
                style={[
                  styles.bubbleContainer,
                  isKorean ? styles.leftAlign : styles.rightAlign,
                ]}
              >
                <View style={[styles.bubble, isKorean ? styles.koBubble : styles.userBubble]}>
                  <Text style={styles.speakerTag}>
                    {isKorean ? '🇰🇷 한국어 학생' : `🌐 내 언어 (${userLang.toUpperCase()})`}
                  </Text>
                  <Text style={styles.sourceText}>{item.sourceText}</Text>
                  <Text style={styles.translatedText}>↪ {item.translatedText}</Text>
                  <TouchableOpacity style={styles.playBtn}>
                    <Text style={styles.playText}>🔊 다시 듣기 (TTS)</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.timestamp}>{item.time}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Dual Mic Control Bar */}
        <View style={styles.controlBar}>
          <TouchableOpacity
            style={[styles.micBtn, styles.koMicBtn]}
            onPress={() => handleSpeak('ko')}
            disabled={recording !== null}
          >
            {recording === 'ko' ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.micIcon}>🎙️</Text>
                <Text style={styles.micLabel}>한국어 말하기</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.micBtn, styles.userMicBtn]}
            onPress={() => handleSpeak('user')}
            disabled={recording !== null}
          >
            {recording === 'user' ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.micIcon}>🗣️</Text>
                <Text style={styles.micLabel}>내 언어 말하기</Text>
              </>
            )}
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
  chatThread: {
    flex: 1,
    marginVertical: theme.spacing.sm,
  },
  bubbleContainer: {
    marginBottom: theme.spacing.md,
    maxWidth: '85%',
  },
  leftAlign: {
    alignSelf: 'flex-start',
  },
  rightAlign: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.soft,
  },
  koBubble: {
    backgroundColor: '#E0F2FE',
    borderColor: '#7DD3FC',
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: '#CCFBF1',
    borderColor: '#5EEAD4',
    borderWidth: 1,
  },
  speakerTag: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  translatedText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
  },
  playBtn: {
    marginTop: theme.spacing.xs,
    alignSelf: 'flex-end',
  },
  playText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  timestamp: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
  },
  micBtn: {
    width: '48%',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  koMicBtn: {
    backgroundColor: '#2563EB',
  },
  userMicBtn: {
    backgroundColor: theme.colors.primary,
  },
  micIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  micLabel: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
