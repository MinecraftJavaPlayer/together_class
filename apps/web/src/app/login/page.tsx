'use client';

import React, { useState } from 'react';
// @ts-ignore
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllUsers, saveCurrentUser } from '@dahamkke/shared';

export default function WebLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('seojun@dahamkke.kr');
  const [password, setPassword] = useState('1234');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    const allUsers = getAllUsers();
    const user = allUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && (u.password === password || password === '1234')
    );

    if (user) {
      saveCurrentUser(user);
      alert(`👋 환영합니다, ${user.name}님! 로그인되었습니다.`);
      router.push('/');
    } else {
      setErrorMsg('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const fillQuickAccount = (emailVal: string) => {
    setEmail(emailVal);
    setPassword('1234');
    setErrorMsg('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '56px' }}>🤖</span>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#14B8A6', marginTop: '12px' }}>다함께교실 로그인</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>이메일과 비밀번호를 입력하여 로그인하세요</p>
        </div>

        {errorMsg ? (
          <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>
            ⚠️ {errorMsg}
          </div>
        ) : null}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              ✉️ 이메일 주소 (Email)
            </label>
            <input
              type="email"
              placeholder="예: seojun@dahamkke.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '15px', backgroundColor: '#F8FAFC' }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              🔒 비밀번호 (Password)
            </label>
            <input
              type="password"
              placeholder="비밀번호 입력 (기본: 1234)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '15px', backgroundColor: '#F8FAFC' }}
              required
            />
          </div>

          <button
            type="submit"
            style={{ width: '100%', backgroundColor: '#14B8A6', color: 'white', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer', marginBottom: '20px' }}
          >
            이메일 로그인
          </button>
        </form>

        {/* Quick Fill Test Buttons */}
        <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#F1F5F9', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '8px' }}>⚡ 체험용 빠른 계정 자동 채우기</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => fillQuickAccount('seojun@dahamkke.kr')} style={{ background: '#FFF', border: '1px solid #CBD5E1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
              이서준 (학생)
            </button>
            <button onClick={() => fillQuickAccount('minjun@dahamkke.kr')} style={{ background: '#FFF', border: '1px solid #CBD5E1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
              김민준 (짝꿍)
            </button>
            <button onClick={() => fillQuickAccount('teacher@dahamkke.kr')} style={{ background: '#FFF', border: '1px solid #CBD5E1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
              정웅 (교사)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '14px', color: '#64748B' }}>
          계정이 없으신가요? <Link href="/signup" style={{ color: '#3B82F6', fontWeight: '700', textDecoration: 'none' }}>신규 회원가입</Link>
        </div>
      </div>
    </div>
  );
}
