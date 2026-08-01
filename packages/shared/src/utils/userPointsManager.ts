import { UserProfile, INITIAL_USERS } from '../constants/userStore';
import { getRankByPoints, RankTier } from '../constants/rankSystem';

const STORAGE_KEY = 'dahamkke_current_user';
const ALL_USERS_DB_KEY = 'dahamkke_all_users_v2';

export function getAllUsers(): UserProfile[] {
  // Load persisted list
  let list: UserProfile[] = [];
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedList = localStorage.getItem(ALL_USERS_DB_KEY);
    if (savedList) {
      try {
        let parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Version migration: clear old temp users to apply new weights/names and size
          const tempVersion = localStorage.getItem('dahamkke_temp_version');
          if (tempVersion !== 'v5') {
            parsed = parsed.filter(u => !u.id.startsWith('temp_'));
            localStorage.setItem('dahamkke_temp_version', 'v5');
          }
          list = parsed;
        }
      } catch (e) {}
    }
  }

  // If no persisted users, start with the preset INITIAL_USERS
  if (list.length === 0) {
    list = [...INITIAL_USERS];
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('dahamkke_temp_version', 'v5');
    }
  }

  // If we don't have enough users, generate temporary characters
  const MIN_TEMP_USERS = 100;
  if (list.length < MIN_TEMP_USERS) {
    const generated: UserProfile[] = [];
    const existingIds = new Set(list.map(u => u.id));
    const existingEmails = new Set(list.map(u => u.email));
    const usedNames = new Set(list.map(u => u.name));
    
    const KOREAN_LAST_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍'];
    const KOREAN_FIRST_NAMES = [
      '민준', '서준', '예준', '도윤', '시우', '주원', '하준', '지호', '지후', '준우', '서윤', '서연', 
      '지우', '하윤', '민서', '하은', '지민', '윤서', '지원', '채원', '하람', '태우', '지선', '유진', 
      '혜원', '소율', '아인', '수아', '서현', '지안', '서우', '유주', '하민', '지유', '재원'
    ];
    const FOREIGN_FIRST_NAMES = [
      '존', '에밀리', '마이클', '사라', '데이비드', '올리비아', '제임스', '엠마', '윌리엄', '소피아',
      '카를로스', '마리아', '호세', '루시아', '미구엘', '소피아', '페드로', '이사벨라', '안토니오', '카밀라',
      '히로시', '사쿠라', '타로', '미유키', '켄지', '유키', '하루카', '유우키', '아야', '유이',
      '알렉스', '다니엘', '루카스', '레오', '마크', '폴', '톰', '피터', '한스', '프리츠',
      '엘리자베스', '샬롯', '아멜리아', '줄리아', '클로이', '조이', '나탈리', '레이첼', '빅토리아', '안나'
    ];
    const FOREIGN_LAST_NAMES = ['스미스', '존슨', '윌리엄스', '브라운', '존스', '밀러', '데이비스', '가르시아', '로드리게스', '마르티네스'];

    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    for (let i = 0; generated.length < MIN_TEMP_USERS - list.length; i++) {
      const id = `temp_${i}_${Date.now()}`;
      if (existingIds.has(id)) continue;
      const email = `temp${i}@example.com`;
      if (existingEmails.has(email)) continue;
      
      // Weighted points generation to shift ~70% of users to Bronze/Silver/Gold
      const getWeightedPoints = () => {
        const rand = Math.random();
        if (rand < 0.25) return randomInt(10, 99);       // 25% Bronze
        if (rand < 0.50) return randomInt(100, 549);     // 25% Silver
        if (rand < 0.70) return randomInt(550, 1699);    // 20% Gold
        if (rand < 0.85) return randomInt(1700, 4999);   // 15% Diamond
        return randomInt(5000, 9999);                    // 15% Master
      };
      const points = getWeightedPoints();
      
      // Generate a unique Korean or Foreign name
      let name = '';
      let attempts = 0;
      while (attempts < 100) {
        attempts++;
        const isKorean = Math.random() < 0.5;
        if (isKorean) {
          const lastName = KOREAN_LAST_NAMES[Math.floor(Math.random() * KOREAN_LAST_NAMES.length)];
          const firstName = KOREAN_FIRST_NAMES[Math.floor(Math.random() * KOREAN_FIRST_NAMES.length)];
          const candidate = lastName + firstName;
          if (!usedNames.has(candidate)) {
            name = candidate;
            break;
          }
        } else {
          const first = FOREIGN_FIRST_NAMES[Math.floor(Math.random() * FOREIGN_FIRST_NAMES.length)];
          if (!usedNames.has(first)) {
            name = first;
            break;
          }
          const last = FOREIGN_LAST_NAMES[Math.floor(Math.random() * FOREIGN_LAST_NAMES.length)];
          const candidateWithLast = `${first} ${last}`;
          if (!usedNames.has(candidateWithLast)) {
            name = candidateWithLast;
            break;
          }
        }
      }
      
      if (!name) {
        name = `학생_${Date.now()}_${i}`;
      }
      usedNames.add(name);

      generated.push({
        id,
        email,
        name,
        role: 'student',
        nativeLang: 'ko',
        points,
        completedModules: {
          translate: false,
          interpret: false,
          debate: false,
          persona: false,
          dictation: false,
          writing: false,
        },
        seasonHistory: [],
      } as any);
    }
    list = list.concat(generated);
  }


  // ALWAYS merge/sync the currently active logged-in user so they ALWAYS appear on the leaderboard!
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedCurrent = localStorage.getItem(STORAGE_KEY);
    if (savedCurrent) {
      try {
        const current: UserProfile = JSON.parse(savedCurrent);
        if (current && current.id) {
          const idx = list.findIndex(
            (u) => u.id === current.id || (u.email && current.email && u.email.toLowerCase() === current.email.toLowerCase())
          );
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...current, points: Math.max(0, current.points || 0) };
          } else {
            list.push({ ...current, points: Math.max(0, current.points || 0) });
          }
        }
      } catch (e) {}
    }
  }

  // Ensure points are non-negative
  list = list.map(u => ({ ...u, points: Math.max(0, u.points || 0) }));

  // Save merged list back to DB
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(ALL_USERS_DB_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  // Sort descending by points!
  return list.sort((a, b) => b.points - a.points);
}

export function getCurrentUser(): UserProfile {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && typeof user.id === 'string' && user.id) {
          return {
            ...user,
            points: typeof user.points === 'number' ? Math.max(0, user.points) : 0,
          };
        }
      } catch (e) {}
    }
  }
  const all = getAllUsers();
  return all[0] || INITIAL_USERS[0];
}

export function saveCurrentUser(user: UserProfile): void {
  const sanitizedUser: UserProfile = {
    ...user,
    points: Math.max(0, user.points || 0),
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    // 1. Save active session user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedUser));

    // 2. Permanently sync into the all users database so progress persists across logout/login!
    let allUsers: UserProfile[] = [];
    const savedList = localStorage.getItem(ALL_USERS_DB_KEY);
    if (savedList) {
      try {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed)) allUsers = parsed;
      } catch (e) {}
    }
    if (allUsers.length === 0) {
      allUsers = [...INITIAL_USERS];
    }

    const index = allUsers.findIndex(
      (u: UserProfile) => u.id === sanitizedUser.id || u.email.toLowerCase() === sanitizedUser.email.toLowerCase()
    );
    if (index !== -1) {
      allUsers[index] = sanitizedUser;
    } else {
      allUsers.push(sanitizedUser);
    }

    localStorage.setItem(ALL_USERS_DB_KEY, JSON.stringify(allUsers));

    // 3. Dispatch user update event
    window.dispatchEvent(new CustomEvent('dahamkke_user_updated', { detail: sanitizedUser }));
  }
}

export function registerNewUser(newUser: UserProfile): void {
  const sanitized: UserProfile = {
    ...newUser,
    points: Math.max(0, newUser.points || 0),
  };
  saveCurrentUser(sanitized);
}

export function addPointsToCurrentUser(pointsGained: number): { updatedUser: UserProfile; oldRank: RankTier; newRank: RankTier } {
  const user = getCurrentUser();
  const oldRank = getRankByPoints(user.points);
  const newPoints = Math.max(0, user.points + pointsGained);
  const newRank = getRankByPoints(newPoints);

  const updatedUser: UserProfile = {
    ...user,
    points: newPoints,
  };

  saveCurrentUser(updatedUser);

  return { updatedUser, oldRank, newRank };
}

export function markModuleCompleted(moduleName: keyof UserProfile['completedModules']): UserProfile {
  const user = getCurrentUser();
  const updatedUser: UserProfile = {
    ...user,
    completedModules: {
      ...user.completedModules,
      [moduleName]: true,
    },
  };

  saveCurrentUser(updatedUser);
  return updatedUser;
}
