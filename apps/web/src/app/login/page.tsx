'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllUsers, saveCurrentUser, deleteUserByEmail, syncCloudDatabase } from '@dahamkke/shared';

export default function WebLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Account deletion states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [delEmail, setDelEmail] = useState('');
  const [delPassword, setDelPassword] = useState('');
  const [delErrorMsg, setDelErrorMsg] = useState('');

  useEffect(() => {
    // Instantly sync user accounts from cloud DB when landing on login page
    syncCloudDatabase().catch(() => {});
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    const allUsers = getAllUsers();
    const user = allUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (user) {
      saveCurrentUser(user);
      alert(`👋 환영합니다, ${user.name}님! 로그인되었습니다.`);
      router.push('/');
    } else {
      setErrorMsg('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest',
      email: 'guest@dahamkke.kr',
      name: '게스트 학생',
      role: 'student' as const,
      nativeLang: 'ko',
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
    saveCurrentUser(guestUser);
    alert('👋 게스트로 로그인되었습니다.');
    router.push('/');
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setDelErrorMsg('');

    if (!delEmail || !delPassword) {
      setDelErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    const allUsers = getAllUsers();
    const user = allUsers.find(
      (u) => u.email.toLowerCase() === delEmail.trim().toLowerCase() && u.password === delPassword
    );

    if (!user) {
      setDelErrorMsg('입력하신 이메일 또는 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (confirm(`⚠️ 정말로 '${user.name}' 계정의 모든 회원가입 정보를 영구 삭제하시겠습니까?`)) {
      deleteUserByEmail(delEmail.trim());
      alert('✅ 회원가입 정보가 성공적으로 삭제되었습니다.');
      setIsDeleteModalOpen(false);
      setDelEmail('');
      setDelPassword('');
      setDelErrorMsg('');
    }
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
              placeholder="이메일 주소를 입력하세요"
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
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '15px', backgroundColor: '#F8FAFC' }}
              required
            />
          </div>

          <button
            type="submit"
            style={{ width: '100%', backgroundColor: '#14B8A6', color: 'white', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
          >
            이메일 로그인
          </button>
        </form>

        <button
          type="button"
          onClick={handleGuestLogin}
          style={{ width: '100%', backgroundColor: '#64748B', color: 'white', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', border: 'none', cursor: 'pointer', marginBottom: '20px' }}
        >
          👤 게스트로 로그인하기 (체험하기)
        </button>

        <div style={{ textAlign: 'center', fontSize: '14px', color: '#64748B' }}>
          계정이 없으신가요? <Link href="/signup" style={{ color: '#3B82F6', fontWeight: '700', textDecoration: 'none' }}>신규 회원가입</Link>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '13px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
          >
            🗑️ 회원 정보 삭제 (계정 탈퇴)
          </button>
        </div>

        {/* Account Deletion Modal */}
        {isDeleteModalOpen ? (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#DC2626', marginBottom: '8px', textAlign: 'center' }}>
                🗑️ 회원 정보 삭제 (계정 탈퇴)
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px', textAlign: 'center' }}>
                삭제할 계정의 이메일과 비밀번호를 입력하세요.
              </p>

              {delErrorMsg ? (
                <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', marginBottom: '16px', textAlign: 'center' }}>
                  ⚠️ {delErrorMsg}
                </div>
              ) : null}

              <form onSubmit={handleDeleteAccount}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    placeholder="삭제할 이메일 입력"
                    value={delEmail}
                    onChange={(e) => setDelEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    비밀번호
                  </label>
                  <input
                    type="password"
                    placeholder="삭제할 비밀번호 입력"
                    value={delPassword}
                    onChange={(e) => setDelPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { setIsDeleteModalOpen(false); setDelErrorMsg(''); }}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#F1F5F9', border: 'none', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#DC2626', border: 'none', fontWeight: '800', color: 'white', cursor: 'pointer' }}
                  >
                    영구 삭제하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
