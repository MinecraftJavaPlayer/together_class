'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getShuffledEvaluationQuiz,
  QuizQuestion,
  getUserRank,
  calculateQuizPoints,
  getCurrentUser,
  addPointsToCurrentUser,
  applyPlacementResult,
  isAllLearningCompleted,
  markModuleCompleted,
  UserProfile,
  RankTier,
  RANK_TIERS,
  UNRANKED_TIER,
  getRankByPoints,
  playCorrectSound,
  playWrongSound,
} from '@dahamkke/shared';
import { SidebarNav } from '../components/SidebarNav';
import { RankSVGIcon } from '../components/RankSVGIcon';
import { RankResultOverlay } from '../components/RankResultOverlay';

export default function WebEvaluationQuizPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile>(getCurrentUser());
  const [forceUnlock, setForceUnlock] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isPlacementMatch, setIsPlacementMatch] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    // Session check: if no active user session, redirect to login page
    const savedSession = localStorage.getItem('dahamkke_current_user');
    if (!savedSession) {
      router.push('/login');
      return;
    }

    setIsDarkMode(localStorage.getItem('dahamkke_dark_mode') === 'true');
    const u = getCurrentUser();
    setCurrentUser(u);
    setIsPlacementMatch(!u.isPlacementCompleted);
    setQuizQuestions(getShuffledEvaluationQuiz());

    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      }
    };
    window.addEventListener('dahamkke_user_updated', handleUserUpdate);
    return () => window.removeEventListener('dahamkke_user_updated', handleUserUpdate);
  }, []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [prevMatchRank, setPrevMatchRank] = useState<RankTier>(UNRANKED_TIER);
  const [isLastMatchPlacement, setIsLastMatchPlacement] = useState<boolean>(false);

  // Animation states for result modal
  const [animValue, setAnimValue] = useState(0);

  const isUnlocked = forceUnlock || isAllLearningCompleted(currentUser);
  const currentQ: QuizQuestion = quizQuestions[currentIdx] || {
    id: 0,
    question: '로딩 중...',
    type: 'multiple-choice',
    difficulty: '중',
    options: [],
    answerIndex: 0,
    explanation: '',
  };
  const currentRank = getUserRank(currentUser);

  // Find next rank tier for progress bar
  const currentRankIndex = RANK_TIERS.findIndex((r) => r.id === currentRank.id);
  const nextRank = RANK_TIERS[currentRankIndex + 1] || currentRank;

  const handleCheck = () => {
    if (currentQ.type === 'short-answer') {
      if (!shortAnswerInput.trim()) {
        alert('정답을 입력해 주세요.');
        return;
      }
      const normInput = shortAnswerInput.trim().toLowerCase().replace(/\s+/g, '');
      const isCorrect = currentQ.acceptableAnswers?.some(
        (ans) => ans.trim().toLowerCase().replace(/\s+/g, '') === normInput
      );
      setIsSubmitted(true);
      setIsLastAnswerCorrect(!!isCorrect);
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
        playCorrectSound();
      } else {
        playWrongSound();
      }
    } else {
      if (selectedOption === null) {
        alert('답안을 선택해 주세요.');
        return;
      }
      const isCorrect = selectedOption === currentQ.answerIndex;
      setIsSubmitted(true);
      setIsLastAnswerCorrect(isCorrect);
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
        playCorrectSound();
      } else {
        playWrongSound();
      }
    }
  };

  const handleNext = () => {
    setIsSubmitted(false);
    setSelectedOption(null);
    setShortAnswerInput('');
    setIsLastAnswerCorrect(false);

    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      const isPlacement = !currentUser.isPlacementCompleted || isPlacementMatch;
      setPrevMatchRank(currentRank);
      setIsLastMatchPlacement(isPlacement);
      let pts = 0;
      let updatedUser: UserProfile;

      if (isPlacement) {
        // Placement Match: 10 correct = 1700 pt (플레티넘 1)
        const res = applyPlacementResult(correctCount);
        pts = res.startingPoints;
        updatedUser = res.updatedUser;
      } else {
        // Regular Evaluation Quiz: -20 to +20 pt
        pts = calculateQuizPoints(correctCount);
        const res = addPointsToCurrentUser(pts);
        updatedUser = res.updatedUser;
      }

      setEarnedPoints(pts);
      setCurrentUser(updatedUser);
      setQuizFinished(true);

      // Start Number Counting Animation
      setAnimValue(0);

      const target = pts;
      const duration = 2600; // 2.6s (slower count-up)
      const steps = 30;
      const stepTime = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentVal = Math.round(target * progress);
        setAnimValue(currentVal);

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimValue(target);
        }
      }, stepTime);
    }
  };

  const handleForceUnlockQuiz = () => {
    markModuleCompleted('translate');
    setForceUnlock(true);
    alert('🔓 단원 학습 완료가 적용되어 10문항 성취도 평가가 즉시 해제되었습니다!');
  };

  const handleRestartQuiz = () => {
    setQuizQuestions(getShuffledEvaluationQuiz());
    setCurrentIdx(0);
    setSelectedOption(null);
    setShortAnswerInput('');
    setIsSubmitted(false);
    setIsLastAnswerCorrect(false);
    setQuizFinished(false);
    setCorrectCount(0);
    setEarnedPoints(0);
    setAnimValue(0);
  };

  // Progress percentage calculation
  const totalRange = nextRank.id === currentRank.id ? 1 : nextRank.minPoints - currentRank.minPoints;
  const currentProgressPoints = currentUser.points - currentRank.minPoints;
  const progressPercent = nextRank.id === currentRank.id ? 100 : Math.min(100, Math.max(0, (currentProgressPoints / totalRange) * 100));

  // Point text color and formatting
  let ptColor = '#FBBF24'; // Dark Yellow (+0)
  let ptFormatted = '+0 pt';

  if (earnedPoints > 0) {
    ptColor = '#4ADE80'; // Lime Green (+)
    ptFormatted = `+${animValue} pt`;
  } else if (earnedPoints < 0) {
    ptColor = '#F87171'; // Vibrant Red (-)
    ptFormatted = `${animValue} pt`;
  } else {
    ptColor = '#FBBF24'; // Dark Yellow (0)
    ptFormatted = `+0 pt`;
  }

  return (
    <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
      <SidebarNav />

      <main className="main-content" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 28px', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.2s ease' }}>
        {/* Top Rank Status Banner */}
        <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-color)', padding: '18px 24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0, flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <RankSVGIcon tierGroup={currentRank.tierGroup as any} subTier={currentRank.subTier || '1'} size={60} />
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '900', color: currentRank.color || 'var(--text-main)', margin: 0 }}>현재 티어: {currentRank.name}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0', fontWeight: '800' }}>
                학생: {currentUser.name} | 누적 포인트: {currentUser.points} pt
                {isPlacementMatch && <span style={{ color: '#10B981', marginLeft: '8px', fontWeight: '900' }}>[🎯 10문항 배치 모드 작동 중]</span>}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setIsPlacementMatch(true)}
              style={{
                backgroundColor: isPlacementMatch ? '#10B981' : 'var(--input-bg)',
                color: isPlacementMatch ? '#FFFFFF' : 'var(--text-muted)',
                border: isPlacementMatch ? '2px solid #059669' : '1.5px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              🎯 배치고사 모드 (10개=플레티넘 1)
            </button>
            <button
              onClick={() => setIsPlacementMatch(false)}
              style={{
                backgroundColor: !isPlacementMatch ? '#3B82F6' : 'var(--input-bg)',
                color: !isPlacementMatch ? '#FFFFFF' : 'var(--text-muted)',
                border: !isPlacementMatch ? '2px solid #2563EB' : '1.5px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              📝 일반 평가 모드 (±20pt)
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          {!isUnlocked ? (
            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-color)', padding: '48px', borderRadius: '16px', maxWidth: '600px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-soft)' }}>
              <span style={{ fontSize: '64px' }}>🔒</span>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', marginTop: '16px' }}>학습 미완료 상태입니다</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px', fontWeight: '600' }}>
                교과서 번역, 통역, AI 토론, 인물 인터뷰 등 단원 학습을 먼저 완료해야 10문항 성취도 평가에 응시할 수 있습니다.
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/translate" style={{ backgroundColor: '#14B8A6', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: '800', textDecoration: 'none' }}>
                  📷 교과서 단원 학습 시작하기 ➔
                </Link>
                <button
                  onClick={handleForceUnlockQuiz}
                  style={{ backgroundColor: '#EC4899', color: 'white', padding: '14px 24px', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                >
                  🔓 학습 완료 상태로 즉시 해제하기
                </button>
              </div>
            </div>
          ) : !quizFinished ? (
            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-color)', padding: '32px', borderRadius: '16px', maxWidth: '700px', width: '100%', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    backgroundColor: currentQ.difficulty === '하' ? 'var(--highlight-foreign-bg)' : currentQ.difficulty === '중' ? 'var(--highlight-warning-bg)' : 'var(--highlight-danger-bg)',
                    color: currentQ.difficulty === '하' ? 'var(--highlight-foreign-text)' : currentQ.difficulty === '중' ? 'var(--highlight-warning-text)' : 'var(--highlight-danger-text)',
                    border: '1px solid var(--border-color)',
                  }}>
                    난이도: {currentQ.difficulty || '중'}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--highlight-dialog-bg)',
                    color: 'var(--highlight-dialog-text)',
                    border: '1.5px solid var(--highlight-dialog-border)',
                  }}>
                    {currentQ.type === 'short-answer' ? '✍️ 주관식' : '🔘 객관식'}
                  </span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-muted)' }}>
                  문제 {currentIdx + 1} / {quizQuestions.length}
                </div>
              </div>

              <h2 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '24px', lineHeight: '1.4', flexShrink: 0 }}>
                Q{currentIdx + 1}. {currentQ.question}
              </h2>

              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }} className="inner-scroll">
                {currentQ.type === 'short-answer' ? (
                  <div style={{ marginBottom: '24px' }}>
                    <input
                      type="text"
                      placeholder="정답을 직접 입력하세요 (예: 제비, 학익진)"
                      value={shortAnswerInput}
                      onChange={(e) => !isSubmitted && setShortAnswerInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !isSubmitted) handleCheck(); }}
                      disabled={isSubmitted}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderRadius: '14px',
                        border: `2.5px solid ${isSubmitted ? (isLastAnswerCorrect ? 'var(--highlight-foreign-border)' : 'var(--highlight-danger-border)') : 'var(--border-color)'}`,
                        backgroundColor: isSubmitted ? (isLastAnswerCorrect ? 'var(--highlight-foreign-bg)' : 'var(--highlight-danger-bg)') : 'var(--input-bg)',
                        fontSize: '17px',
                        fontWeight: '800',
                        color: isSubmitted ? (isLastAnswerCorrect ? 'var(--highlight-foreign-text)' : 'var(--highlight-danger-text)') : 'var(--text-main)',
                        outline: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', marginBottom: '24px' }}>
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      let bg = 'var(--input-bg)';
                      let border = '2px solid var(--border-color)';
                      let textCol = 'var(--text-main)';
                      
                      if (isSelected) {
                        bg = 'var(--highlight-dialog-bg)';
                        border = '2px solid var(--highlight-dialog-border)';
                        textCol = 'var(--highlight-dialog-text)';
                      }
                      if (isSubmitted) {
                        if (idx === currentQ.answerIndex) {
                          bg = 'var(--highlight-foreign-bg)';
                          border = '2px solid var(--highlight-foreign-border)';
                          textCol = 'var(--highlight-foreign-text)';
                        } else if (isSelected) {
                          bg = 'var(--highlight-danger-bg)';
                          border = '2px solid var(--highlight-danger-border)';
                          textCol = 'var(--highlight-danger-text)';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => !isSubmitted && setSelectedOption(idx)}
                          style={{
                            textAlign: 'left',
                            padding: '16px',
                            borderRadius: '12px',
                            border: border,
                            backgroundColor: bg,
                            fontSize: '16px',
                            fontWeight: '800',
                            color: textCol,
                            cursor: 'pointer',
                          }}
                        >
                          {idx + 1}. {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {isSubmitted && (
                  <div style={{ background: 'var(--bg-main)', border: '1.5px solid var(--border-color)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                      {isLastAnswerCorrect ? '✅ 정답입니다!' : '❌ 아쉽습니다!'}
                      {currentQ.type === 'short-answer' && !isLastAnswerCorrect && (
                        <span style={{ color: 'var(--highlight-foreign-text)', marginLeft: '8px' }}>
                          (정답 예시: {currentQ.acceptableAnswers?.[0]})
                        </span>
                      )}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5', fontWeight: '600' }}>{currentQ.explanation}</p>
                  </div>
                )}
              </div>

              {!isSubmitted ? (
                <button
                  onClick={handleCheck}
                  style={{ width: '100%', backgroundColor: '#14B8A6', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', border: 'none', flexShrink: 0 }}
                >
                  정답 제출
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  style={{ width: '100%', backgroundColor: '#3B82F6', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', border: 'none', flexShrink: 0 }}
                >
                  {currentIdx + 1 < quizQuestions.length ? '다음 문제 ➔' : '최종 평가 결과 보기 🏆'}
                </button>
              )}
            </div>
          ) : (
            <RankResultOverlay
              isPlacement={isLastMatchPlacement}
              prevRank={prevMatchRank}
              newRank={getRankByPoints(currentUser.points)}
              pointsDelta={earnedPoints}
              totalPoints={currentUser.points}
              matchTitle={
                isLastMatchPlacement
                  ? '🎯 10문항 진단 평가 (배치고사)'
                  : '📝 10문항 성취도 평가'
              }
              matchDetails={
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    fontSize: '15px',
                    fontWeight: '800',
                    color: '#FFFFFF',
                  }}
                >
                  <span>정답 문항: <b>10개 중 {correctCount}개</b> 맞힘</span>
                </div>
              }
              onContinue={() => {
                setQuizFinished(false);
                router.push('/');
              }}
              continueText="홈으로 나가기"
              onRetry={() => {
                setQuizFinished(false);
                handleRestartQuiz();
              }}
              retryText="다시 풀기"
            />
          )}
        </div>
      </main>
    </div>
  );
}
