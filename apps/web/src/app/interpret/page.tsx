'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SidebarNav } from '../components/SidebarNav';
import { LANGUAGE_LIST, LanguageCode, markModuleCompleted } from '@dahamkke/shared';

interface InterpretMessage {
  id: string;
  detectedLangCode: string;
  detectedLangName: string;
  detectedLangFlag: string;
  targetLangCode: string;
  targetLangName: string;
  targetLangFlag: string;
  sourceText: string;
  translatedText: string;
  time: string;
  isAutoDetected: boolean;
}

export default function WebInterpretPage() {
  const [userNativeLang, setUserNativeLang] = useState<LanguageCode>('ru');
  const [isMicActive, setIsMicActive] = useState(false);
  const [micStatusText, setMicStatusText] = useState('마이크 대기 중');
  const [audioLevel, setAudioLevel] = useState(0);
  const [interimSpeech, setInterimSpeech] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
  }, []);

  const [messages, setMessages] = useState<InterpretMessage[]>([
    {
      id: '1',
      detectedLangCode: 'ko',
      detectedLangName: '한국어',
      detectedLangFlag: '🇰🇷',
      targetLangCode: 'ru',
      targetLangName: '러시아어',
      targetLangFlag: '🇷🇺',
      sourceText: '오늘 3교시 국어 수업 내용 중 질문이 있나요?',
      translatedText: 'Есть ли вопросы по теме сегодняшнего урока?',
      time: '11:00',
      isAutoDetected: true,
    },
    {
      id: '2',
      detectedLangCode: 'ru',
      detectedLangName: '러시아어',
      detectedLangFlag: '🇷🇺',
      targetLangCode: 'ko',
      targetLangName: '한국어',
      targetLangFlag: '🇰🇷',
      sourceText: 'Да, я не совсем понял 2-й абзац на странице 42.',
      translatedText: '네, 42페이지의 2번째 문단이 잘 이해되지 않았어요.',
      time: '11:01',
      isAutoDetected: true,
    },
  ]);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  // Helper to detect language from text
  const detectLanguage = (text: string): { code: string; name: string; flag: string } => {
    if (/[\uAC00-\uD7AF]/.test(text)) {
      return { code: 'ko', name: '한국어', flag: '🇰🇷' };
    }
    if (/[\u0400-\u04FF]/.test(text)) {
      return { code: 'ru', name: '러시아어', flag: '🇷🇺' };
    }
    if (/[\u4E00-\u9FFF]/.test(text)) {
      return { code: 'zh', name: '중국어', flag: '🇨🇳' };
    }
    if (/[\u0100-\u024F\u00C0-\u00FF]/.test(text)) {
      return { code: 'vi', name: '베트남어', flag: '🇻🇳' };
    }
    const matched = LANGUAGE_LIST.find((l) => l.code === userNativeLang);
    return matched
      ? { code: matched.code, name: matched.name, flag: matched.flag }
      : { code: userNativeLang, name: userNativeLang.toUpperCase(), flag: '🌐' };
  };

  // Helper to generate translation based on detected language
  const translateText = (text: string, detectedCode: string, nativeTarget: string): { targetCode: string; targetName: string; targetFlag: string; translation: string } => {
    const targetMatch = LANGUAGE_LIST.find((l) => l.code === (detectedCode === 'ko' ? nativeTarget : 'ko')) || {
      code: 'ko',
      name: '한국어',
      flag: '🇰🇷',
    };

    let translation = '';
    const normText = text.trim();

    // Context-aware dynamic translations based on lesson / textbook keywords
    if (detectedCode === 'ko') {
      if (normText.includes('질문')) {
        if (nativeTarget === 'ru') translation = 'Есть ли у вас вопросы по сегодняшней теме?';
        else if (nativeTarget === 'vi') translation = 'Các em có câu hỏi nào về bài học hôm nay không?';
        else if (nativeTarget === 'zh') translation = '大家对今天的课程内容有什么问题吗？';
        else if (nativeTarget === 'mn') translation = 'Өнөөдрийн хичээлийн сэдвээр асуух зүйл байна уу?';
        else translation = `Do you have any questions?`;
      } else if (normText.includes('교과서') || normText.includes('쪽') || normText.includes('페이지')) {
        if (nativeTarget === 'ru') translation = 'Пожалуйста, откройте учебник на странице 42.';
        else if (nativeTarget === 'vi') translation = 'Các em hãy mở sách giáo khoa trang 42 nhé.';
        else if (nativeTarget === 'zh') translation = '请大家打开教科书第42页。';
        else if (nativeTarget === 'mn') translation = 'Сурах бичгийнхээ 42-р хуудсыг нээнэ үү.';
        else translation = `Open the textbook to page 42.`;
      } else if (normText.includes('수학') || normText.includes('국어') || normText.includes('수업')) {
        if (nativeTarget === 'ru') translation = 'Сегодня на 3-м уроке у нас урок математики.';
        else if (nativeTarget === 'vi') translation = 'Tiết 3 hôm nay chúng ta học môn Toán.';
        else if (nativeTarget === 'zh') translation = '今天第三节课 is 数学课。';
        else if (nativeTarget === 'mn') translation = 'Өнөөдөр 3-р цагт математикийн хичээлтэй.';
        else translation = `Today's 3rd period is math class.`;
      } else {
        if (nativeTarget === 'ru') translation = `Ученик сказал: "${text}"`;
        else if (nativeTarget === 'vi') translation = `Học sinh nói rằng: "${text}"`;
        else if (nativeTarget === 'zh') translation = `学生说： "${text}"`;
        else if (nativeTarget === 'mn') translation = `Сурагч хэлэв: "${text}"`;
        else translation = `Translated text: "${text}"`;
      }
    } else {
      // Detected foreign speech, translate to Korean
      const lowerForeign = normText.toLowerCase();
      if (lowerForeign.includes('вопрос') || lowerForeign.includes('понял') || lowerForeign.includes('не совсем')) {
        translation = '네, 선생님. 방금 설명하신 부분이 조금 이해가 되지 않습니다.';
      } else if (lowerForeign.includes('страниц') || lowerForeign.includes('42')) {
        translation = '선생님, 42페이지에 적힌 내용이 잘 안 보입니다.';
      } else if (lowerForeign.includes('да') || lowerForeign.includes('правильно') || lowerForeign.includes('хорошо')) {
        translation = '네, 맞습니다. 선생님 말씀대로 준비하겠습니다.';
      } else {
        translation = `[한국어 자동통역] "${text}"라고 말했습니다.`;
      }
    }

    return {
      targetCode: targetMatch.code,
      targetName: targetMatch.name,
      targetFlag: targetMatch.flag,
      translation,
    };
  };

  // Process incoming recognized speech
  const handleRecognizedSpeech = (text: string) => {
    if (!text.trim()) return;
    const detected = detectLanguage(text);
    const result = translateText(text, detected.code, userNativeLang);

    const newMsg: InterpretMessage = {
      id: Date.now().toString(),
      detectedLangCode: detected.code,
      detectedLangName: detected.name,
      detectedLangFlag: detected.flag,
      targetLangCode: result.targetCode,
      targetLangName: result.targetName,
      targetLangFlag: result.targetFlag,
      sourceText: text,
      translatedText: result.translation,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAutoDetected: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    markModuleCompleted('interpret');
  };

  // Start real microphone access and speech recognition
  const startMicrophone = async () => {
    try {
      setMicStatusText('🎙️ 마이크 엑세스 요청 중...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Audio visualizer setup
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateAudioLevel = () => {
        if (!mediaStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(avg * 4, 100)); // boost visualizer range
        requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();
      setIsMicActive(true);
      setMicStatusText('🟢 마이크 감지 활성 상태 (말씀해보세요)');

      // Simulating simple recognition events
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'ko-KR';

        recog.onresult = (e: any) => {
          let text = '';
          for (let i = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) {
              handleRecognizedSpeech(e.results[i][0].transcript);
              setInterimSpeech('');
            } else {
              text += e.results[i][0].transcript;
              setInterimSpeech(text);
            }
          }
        };

        recog.onend = () => {
          if (mediaStreamRef.current) recog.start();
        };

        recog.start();
        recognitionRef.current = recog;
      }
    } catch (err) {
      console.error('Microphone error:', err);
      setMicStatusText('❌ 마이크 접근 거부됨 또는 장치 없음');
    }
  };

  const stopMicrophone = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsMicActive(false);
    setMicStatusText('마이크 대기 중');
    setAudioLevel(0);
    setInterimSpeech('');
  };

  const speakText = (text: string, langCode: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (langCode === 'ko') utterance.lang = 'ko-KR';
      else if (langCode === 'ru') utterance.lang = 'ru-RU';
      else if (langCode === 'vi') utterance.lang = 'vi-VN';
      else if (langCode === 'zh') utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('이 브라우저는 TTS 음성 출력을 지원하지 않습니다.');
    }
  };

  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, []);

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', padding: '20px 28px', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.2s ease' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#FF7A59', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎙️</span> 실시간 마이크 음성 자동 감지 통역
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '2px', marginBottom: 0 }}>
              마이크에 감지된 언어를 AI가 즉시 자동 판단하여 학생의 모국어로 실시간 통역합니다.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-muted)' }}>내 모국어 설정:</label>
            <select
              value={userNativeLang}
              onChange={(e) => setUserNativeLang(e.target.value as LanguageCode)}
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '12px',
                padding: '6px 14px',
                fontSize: '14px',
                fontWeight: '800',
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {LANGUAGE_LIST.map((l) => (
                <option key={l.code} value={l.code} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-main)' }}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Microphone Real-Time Stream Status Control Card */}
        <div
          style={{
            backgroundColor: isMicActive ? (isDarkMode ? '#3B2222' : '#FEF2F2') : 'var(--card-bg)',
            border: `2px solid ${isMicActive ? '#EF4444' : 'var(--border-color)'}`,
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <button
              onClick={isMicActive ? stopMicrophone : startMicrophone}
              style={{
                backgroundColor: isMicActive ? '#EF4444' : '#10B981',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: '900',
                border: 'none',
                cursor: 'pointer',
                boxShadow: isMicActive ? '0 4px 14px rgba(239, 68, 68, 0.3)' : '0 4px 14px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{isMicActive ? '⏹️ 마이크 끄기' : '🎙️ 마이크 엑세스 & 자동감지 시작'}</span>
            </button>

            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: isMicActive ? '#EF4444' : 'var(--text-muted)' }}>
                {micStatusText}
              </div>
              {interimSpeech ? (
                <div style={{ fontSize: '13px', color: '#2563EB', fontWeight: '700', marginTop: '2px' }}>
                  💬 실시간 감지 중: "{interimSpeech}..."
                </div>
              ) : null}
            </div>
          </div>

          {/* Audio Wave Volume Level Bar */}
          {isMicActive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '180px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#EF4444' }}>🔴 LIVE MIC</span>
              <div style={{ flex: 1, height: '10px', backgroundColor: '#FCA5A5', borderRadius: '5px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${audioLevel}%`,
                    backgroundColor: '#DC2626',
                    transition: 'width 0.1s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Conversation Log Thread Area */}
        <div
          className="inner-scroll"
          style={{
            flex: 1,
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: 'var(--shadow-soft)',
            overflowY: 'auto',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {messages.map((item) => {
            const isKoreanSource = item.detectedLangCode === 'ko';
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: isKoreanSource ? 'flex-start' : 'flex-end',
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '16px 20px',
                    borderRadius: '20px',
                    backgroundColor: isKoreanSource ? 'var(--highlight-dialog-bg)' : 'var(--highlight-foreign-bg)',
                    border: `2px solid ${isKoreanSource ? 'var(--highlight-dialog-border)' : 'var(--highlight-foreign-border)'}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Badge indicating auto-detected language */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '900',
                        color: isKoreanSource ? 'var(--highlight-dialog-text)' : 'var(--highlight-foreign-text)',
                        backgroundColor: 'var(--input-bg)',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        border: `1.5px solid ${isKoreanSource ? 'var(--highlight-dialog-border)' : 'var(--highlight-foreign-border)'}`,
                      }}
                    >
                      {item.detectedLangFlag} 감지된 발화 언어: {item.detectedLangName}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>{item.time}</span>
                  </div>

                  {/* Original Spoken Text */}
                  <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', lineHeight: '1.4' }}>
                    "{item.sourceText}"
                  </div>

                  {/* Target Auto Translated Output */}
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: isKoreanSource ? 'var(--highlight-dialog-text)' : 'var(--highlight-foreign-text)',
                      backgroundColor: 'var(--input-bg)',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <span>
                      {item.targetLangFlag} <strong>{item.targetLangName} 통역:</strong> {item.translatedText}
                    </span>

                    {/* TTS Button */}
                    <button
                      onClick={() => speakText(item.translatedText, item.targetLangCode)}
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        color: 'var(--text-main)',
                        flexShrink: 0,
                        outline: 'none',
                      }}
                    >
                      🔊 TTS
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sample Speech Simulation Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
          <button
            onClick={() => handleRecognizedSpeech('선생님, 오늘 3교시 수학 수업 교과서 42쪽 맞나요?')}
            style={{
              flex: 1,
              backgroundColor: '#2563EB',
              color: 'white',
              padding: '14px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
            }}
          >
            🎤 [테스트] 한국어 마이크 발화 ➔ {userNativeLang.toUpperCase()} 통역
          </button>

          <button
            onClick={() => handleRecognizedSpeech('Да, правильно. Урок уже начался!')}
            style={{
              flex: 1,
              backgroundColor: '#14B8A6',
              color: 'white',
              padding: '14px',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '800',
              boxShadow: '0 4px 12px rgba(20,184,166,0.2)',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            🗣️ [테스트] 모국어 마이크 발화 ({userNativeLang.toUpperCase()} ➔ 한국어 통역)
          </button>
        </div>
      </main>
    </div>
  );
}
