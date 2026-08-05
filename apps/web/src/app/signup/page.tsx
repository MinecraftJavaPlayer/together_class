'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LANGUAGES, registerNewUser, getAllUsers, UserProfile, syncCloudDatabase } from '@dahamkke/shared';

export default function WebSignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nativeLang, setNativeLang] = useState('ru');
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

    const existingUsers = getAllUsers();
    if (existingUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg('이미 등록된 이메일 주소입니다. 로그인해 주세요.');
      return;
    }

    const newUser: UserProfile = {
      id: `student-${Date.now()}`,
      email: email.trim(),
      password,
      name: `${name.trim()} (학생)`,
      role: 'student',
      nativeLang,
      points: 0,
      completedModules: {
        translate: false,
        interpret: false,
        debate: false,
        persona: false,
        dictation: false,
        writing: false,
      },
      seasonHistory: [],
    };

    registerNewUser(newUser);
    alert(`🎉 회원가입 성공! ${newUser.name}님 환영합니다.`);
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '56px' }}>📝</span>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#3B82F6', marginTop: '12px' }}>다함께교실 회원가입</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>이메일과 비밀번호로 새로운 학생 계정을 생성하세요</p>
        </div>

        {errorMsg ? (
          <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>
            ⚠️ {errorMsg}
          </div>
        ) : null}

        <form onSubmit={handleSignUp}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              👤 학생 이름
            </label>
            <input
              type="text"
              placeholder="예: 안나, 이서준"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '15px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              ✉️ 이메일 주소 (Email)
            </label>
            <input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '15px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              🔒 비밀번호 (Password)
            </label>
            <input
              type="password"
              placeholder="최소 4자리 이상 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '15px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              🔒 비밀번호 확인 (Confirm Password)
            </label>
            <input
              type="password"
              placeholder="비밀번호 재입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '15px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              🌐 모국어 선택
            </label>
            <select
              value={nativeLang}
              onChange={(e) => setNativeLang(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '15px', fontWeight: '600' }}
            >
              {languagesList.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            style={{ width: '100%', backgroundColor: '#3B82F6', color: 'white', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer', marginBottom: '16px' }}
          >
            회원가입 완료
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '14px', color: '#64748B' }}>
          이미 계정이 있으신가요? <Link href="/login" style={{ color: '#14B8A6', fontWeight: '700', textDecoration: 'none' }}>로그인</Link>
        </div>
      </div>
    </div>
  );
}
