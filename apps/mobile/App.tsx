import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from './src/presentation/screens/LoginScreen';
import { SignUpScreen } from './src/presentation/screens/SignUpScreen';
import { MainScreen } from './src/presentation/screens/MainScreen';
import { TranslateScreen } from './src/presentation/screens/TranslateScreen';
import { InterpretScreen } from './src/presentation/screens/InterpretScreen';
import { DebateScreen } from './src/presentation/screens/DebateScreen';
import { PersonaScreen } from './src/presentation/screens/PersonaScreen';
import { NoticeScreen } from './src/presentation/screens/NoticeScreen';
import { RecordsScreen } from './src/presentation/screens/RecordsScreen';
import { DictationScreen } from './src/presentation/screens/DictationScreen';
import { WritingScreen } from './src/presentation/screens/WritingScreen';
import { EvaluationQuizScreen } from './src/presentation/screens/EvaluationQuizScreen';
import { RankScreen } from './src/presentation/screens/RankScreen';
import { TextbookIngestScreen } from './src/presentation/screens/TextbookIngestScreen';
import { PersonaAdminScreen } from './src/presentation/screens/PersonaAdminScreen';
import { SettingsScreen } from './src/presentation/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#14B8A6',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: '회원가입' }} />
        <Stack.Screen name="Main" component={MainScreen} options={{ title: '다함께교실 홈', headerBackVisible: false }} />
        <Stack.Screen name="Rank" component={RankScreen} options={{ title: '🏆 랭크 & 월간 시즌' }} />
        <Stack.Screen name="Translate" component={TranslateScreen} options={{ title: '교과서 OCR 번역' }} />
        <Stack.Screen name="Interpret" component={InterpretScreen} options={{ title: '실시간 통역' }} />
        <Stack.Screen name="Debate" component={DebateScreen} options={{ title: 'AI 토론 친구' }} />
        <Stack.Screen name="Persona" component={PersonaScreen} options={{ title: '교과서 인물 인터뷰' }} />
        <Stack.Screen name="Notice" component={NoticeScreen} options={{ title: '가정통신문 번역' }} />
        <Stack.Screen name="Records" component={RecordsScreen} options={{ title: '학습 기록' }} />
        <Stack.Screen name="Dictation" component={DictationScreen} options={{ title: '받아쓰기 연습' }} />
        <Stack.Screen name="Writing" component={WritingScreen} options={{ title: '글자 따라쓰기' }} />
        <Stack.Screen name="EvaluationQuiz" component={EvaluationQuizScreen} options={{ title: '학습 성취도 평가' }} />
        <Stack.Screen name="TextbookIngest" component={TextbookIngestScreen} options={{ title: '교과서 RAG 등록 (교사)' }} />
        <Stack.Screen name="PersonaAdmin" component={PersonaAdminScreen} options={{ title: '페르소나 설정 (교사)' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '설정 및 프로필' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
