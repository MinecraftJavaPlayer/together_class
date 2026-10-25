'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LANGUAGES, registerNewUser, getAllUsers, UserProfile, syncCloudDatabase } from '@dahamkke/shared';

export default function WebSignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nativeLang, setNativeLang] = useState('ko');
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Instantly sync user accounts from cloud DB when landing on signup page
    syncCloudDatabase().catch(() => {});
  }, []);

  const languagesList = Object.values(SUPPORTED_LANGUAGES);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('이름을 입력해 주세요.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('비밀번호는 최소 4자리 이상 입력해 주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (!agreedPrivacy) {
      setErrorMsg('개인정보 수집 및 이용에 동의해 주셔야 회원가입이 가능합니다.');
      return;
    }

    const existingUsers = getAllUsers();
    if (existingUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg('이미 등록된 이메일 주소입니다. 로그인해 주세요.');
      return;
    }

    const isTeacher = role === 'teacher';
    const newUser: UserProfile = {
      id: `${role}-${Date.now()}`,
      email: email.trim(),
      password,
      name: `${name.trim()} (${isTeacher ? '선생님' : '학생'})`,
      role,
      nativeLang,
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
    alert(`🎉 회원가입 성공! ${newUser.name}님 환영합니다.${isTeacher ? '\n👨‍🏫 교사 콘솔 접근 권한이 부여되었습니다.' : ''}`);
    router.push(isTeacher ? '/admin' : '/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: '32px 20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '52px' }}>📝</span>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#3B82F6', marginTop: '8px', marginBottom: '4px' }}>다함께교실 회원가입</h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>학생 또는 교사 계정을 생성하고 맞춤 학습을 시작하세요</p>
        </div>

        {errorMsg ? (
          <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>
            ⚠️ {errorMsg}
          </div>
        ) : null}

        <form onSubmit={handleSignUp}>
          {/* 계정 유형 (Role) 선택 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
              👤 계정 유형 선택 (필수)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('student')}
                style={{
                  padding: '14px 12px',
                  borderRadius: '14px',
                  border: role === 'student' ? '2.5px solid #3B82F6' : '1.5px solid #CBD5E1',
                  backgroundColor: role === 'student' ? '#EFF6FF' : '#FFFFFF',
                  color: role === 'student' ? '#1D4ED8' : '#64748B',
                  fontWeight: '900',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                🎒 학생 (Student)
              </button>

              <button
                type="button"
                onClick={() => setRole('teacher')}
                style={{
                  padding: '14px 12px',
                  borderRadius: '14px',
                  border: role === 'teacher' ? '2.5px solid #4F46E5' : '1.5px solid #CBD5E1',
                  backgroundColor: role === 'teacher' ? '#EEF2FF' : '#FFFFFF',
                  color: role === 'teacher' ? '#4338CA' : '#64748B',
                  fontWeight: '900',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                👨‍🏫 교사 (Teacher)
              </button>
            </div>
            <div style={{ fontSize: '12px', color: role === 'teacher' ? '#4338CA' : '#3B82F6', marginTop: '6px', fontWeight: '700', backgroundColor: role === 'teacher' ? '#EEF2FF' : '#EFF6FF', padding: '6px 12px', borderRadius: '8px' }}>
              {role === 'teacher'
                ? '💡 교사 계정은 교사 콘솔(RAG 교과서 등록, 벡터 색인 관리)에 즉시 접근할 수 있습니다.'
                : '💡 학생 계정은 10문항 평가, 번역, 통역, AI 토론 등 학생용 학습 기능을 이용합니다.'}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              {role === 'teacher' ? '👨‍🏫 선생님 이름' : '🎒 학생 이름'}
            </label>
            <input
              type="text"
              placeholder={role === 'teacher' ? '예: 김선생님, 박교사' : '예: 안나, 이서준'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '15px', outline: 'none' }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              ✉️ 이메일 주소 (아이디로 사용)
            </label>
            <input
              type="email"
              placeholder={role === 'teacher' ? 'teacher@school.es.kr' : 'student@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '15px', outline: 'none' }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              🔒 비밀번호 (최소 4자리 이상)
            </label>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '15px', outline: 'none' }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              🔒 비밀번호 확인
            </label>
            <input
              type="password"
              placeholder="비밀번호 재입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '15px', outline: 'none' }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              🌐 모국어 선택
            </label>
            <select
              value={nativeLang}
              onChange={(e) => setNativeLang(e.target.value)}
              style={{ width: '100%', padding: '13px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '15px', fontWeight: '600', outline: 'none' }}
            >
              {languagesList.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* 개인정보 수집 및 이용 동의 (필수) */}
          <div style={{ marginBottom: '24px', backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }} onClick={() => setAgreedPrivacy(!agreedPrivacy)}>
              <input
                type="checkbox"
                id="privacyCheck"
                checked={agreedPrivacy}
                onChange={(e) => setAgreedPrivacy(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3B82F6' }}
              />
              <label htmlFor="privacyCheck" style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', cursor: 'pointer' }}>
                [필수] 개인정보 수집 및 이용 동의
              </label>
            </div>

            <div
              style={{
                maxHeight: '90px',
                overflowY: 'auto',
                fontSize: '12px',
                color: '#64748B',
                lineHeight: '1.6',
                backgroundColor: '#FFFFFF',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
              }}
            >
              <p style={{ margin: '0 0 4px 0', fontWeight: '700', color: '#334155' }}>
                1. 수집 항목: 이름, 이메일 주소, 비밀번호, 모국어, 계정 유형(학생/교사)
              </p>
              <p style={{ margin: '0 0 4px 0' }}>
                2. 수집 목적: 다함께교실 다문화 맞춤형 교육 서비스 제공, 학습 기록 및 랭크 시스템 관리, 교사 콘솔 접근 권한 부여
              </p>
              <p style={{ margin: '0 0 4px 0' }}>
                3. 보유 및 이용 기간: 회원 탈퇴 시까지 (회원 탈퇴 즉시 영구 파기)
              </p>
              <p style={{ margin: 0 }}>
                4. 동의 거부 권리: 귀하는 개인정보 수집 및 이용 동의를 거부할 권리가 있으며, 동의를 거부할 경우 회원가입 및 서비스 이용이 제한됩니다.
              </p>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: role === 'teacher' ? '#4F46E5' : '#3B82F6',
              color: 'white',
              padding: '16px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '900',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '16px',
              boxShadow: role === 'teacher' ? '0 4px 14px rgba(79, 70, 229, 0.3)' : '0 4px 14px rgba(59, 130, 246, 0.3)',
            }}
          >
            {role === 'teacher' ? '👨‍🏫 교사 회원가입 완료' : '🎒 학생 회원가입 완료'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '14px', color: '#64748B' }}>
          이미 계정이 있으신가요?{' '}
          <Link href="/login" style={{ color: '#14B8A6', fontWeight: '800', textDecoration: 'none' }}>
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
