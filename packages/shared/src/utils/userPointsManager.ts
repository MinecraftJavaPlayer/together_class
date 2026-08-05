import { UserProfile, INITIAL_USERS } from '../constants/userStore';
import { getRankByPoints, RankTier } from '../constants/rankSystem';

const STORAGE_KEY = 'dahamkke_current_user';
const ALL_USERS_DB_KEY = 'dahamkke_all_users_v2';

const FALLBACK_USER: UserProfile = {
  id: 'guest',
  email: 'guest@dahamkke.kr',
  name: '게스트',
  role: 'student',
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

const SHARED_CLOUD_DB_URL = 'https://jsonblob.com/api/jsonBlob/019fd017-cc94-758f-9e70-e00d93ddf029';
let lastCloudSyncTime = 0;

// Asynchronously sync cloud DB with local storage DB across PC & Mobile devices
export async function syncCloudDatabase(): Promise<UserProfile[]> {
  if (typeof window === 'undefined' || !navigator.onLine) return [];
  try {
    const res = await fetch(SHARED_CLOUD_DB_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const cloudUsers: UserProfile[] = await res.json();
      if (Array.isArray(cloudUsers)) {
        const localListStr = localStorage.getItem(ALL_USERS_DB_KEY);
        let localList: UserProfile[] = localListStr ? JSON.parse(localListStr) : [];
        if (!Array.isArray(localList)) localList = [];

        const userMap = new Map<string, UserProfile>();
        
        // Add cloud users
        cloudUsers.forEach((u) => {
          if (u && u.email && u.id && u.id !== 'guest' && !u.name.includes('게스트')) {
            userMap.set(u.email.toLowerCase(), u);
          }
        });

        // Add local users (merge points if higher)
        localList.forEach((u) => {
          if (u && u.email && u.id && u.id !== 'guest' && !u.name.includes('게스트')) {
            const existing = userMap.get(u.email.toLowerCase());
            if (!existing || (u.points || 0) >= (existing.points || 0)) {
              userMap.set(u.email.toLowerCase(), u);
            }
          }
        });

        const merged = Array.from(userMap.values());
        localStorage.setItem(ALL_USERS_DB_KEY, JSON.stringify(merged));
        lastCloudSyncTime = Date.now();

        // Push back merged state
        pushCloudDatabase(merged);

        window.dispatchEvent(new CustomEvent('dahamkke_user_updated'));
        return merged;
      }
    }
  } catch (e) {}
  return [];
}

// Push local user list updates to shared cloud DB for Mobile & PC sync
export function pushCloudDatabase(users: UserProfile[]): void {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  const filteredUsers = users.filter(
    (u) => u.id !== 'guest' && !u.id.startsWith('guest') && u.email !== 'guest@dahamkke.kr' && !u.name.includes('게스트')
  );
  fetch(SHARED_CLOUD_DB_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(filteredUsers),
  }).catch(() => {});
}

export function getAllUsers(): UserProfile[] {
  // Trigger background cloud sync if more than 5 seconds since last check
  if (typeof window !== 'undefined' && Date.now() - lastCloudSyncTime > 5000) {
    lastCloudSyncTime = Date.now();
    syncCloudDatabase().catch(() => {});
  }

  // Load persisted list
  let list: UserProfile[] = [];
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedList = localStorage.getItem(ALL_USERS_DB_KEY);
    if (savedList) {
      try {
        let parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Version migration: clear all temp users, guest users and mock initial users
          const tempVersion = localStorage.getItem('dahamkke_temp_version');
          if (tempVersion !== 'v8') {
            parsed = parsed.filter(u => 
              !u.id.startsWith('temp_') && 
              !u.id.startsWith('guest') &&
              u.id !== 'guest' &&
              u.email !== 'guest@dahamkke.kr' &&
              !u.name.includes('게스트') &&
              !['student-seojun', 'student-minjun', 'student-anna', 'teacher-jungwoong'].includes(u.id)
            );
            localStorage.setItem('dahamkke_temp_version', 'v8');
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
      localStorage.setItem('dahamkke_temp_version', 'v8');
    }
  }

  // Ensure any lingering temp users, guest users and mock initial users are filtered out
  list = list.filter(u => 
    !u.id.startsWith('temp_') && 
    !u.id.startsWith('guest') &&
    u.id !== 'guest' &&
    u.email !== 'guest@dahamkke.kr' &&
    !u.name.includes('게스트') &&
    !['student-seojun', 'student-minjun', 'student-anna', 'teacher-jungwoong'].includes(u.id)
  );


  // ALWAYS merge/sync the currently active logged-in user (excluding guest accounts) so real students appear on the leaderboard!
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedCurrent = localStorage.getItem(STORAGE_KEY);
    if (savedCurrent) {
      try {
        const current: UserProfile = JSON.parse(savedCurrent);
        if (
          current && 
          current.id && 
          current.id !== 'guest' && 
          !current.id.startsWith('guest') && 
          current.email !== 'guest@dahamkke.kr' &&
          !current.name.includes('게스트')
        ) {
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
  return all[0] || FALLBACK_USER;
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
    pushCloudDatabase(allUsers);

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

export function getUserRank(user: UserProfile): RankTier {
  if (!user) return getRankByPoints(0);

  // Guest accounts get rank strictly based on points without leaderboard Grandmaster status
  if (
    user.id === 'guest' ||
    user.id.startsWith('guest') ||
    user.email === 'guest@dahamkke.kr' ||
    (user.name && user.name.includes('게스트'))
  ) {
    return getRankByPoints(user.points || 0);
  }

  const allUsers = getAllUsers();
  const index = allUsers.findIndex(
    (u) => u.id === user.id || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
  );

  // If user is in the TOP 5 on the leaderboard, they achieve Grandmaster tier!
  if (index !== -1 && index < 5) {
    return getRankByPoints(10000);
  }

  return getRankByPoints(user.points || 0);
}

export function deleteUserByEmail(email: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  const savedList = localStorage.getItem(ALL_USERS_DB_KEY);
  if (savedList) {
    try {
      let list: UserProfile[] = JSON.parse(savedList);
      const initialLength = list.length;
      list = list.filter((u) => u.email.toLowerCase() !== email.trim().toLowerCase());
      localStorage.setItem(ALL_USERS_DB_KEY, JSON.stringify(list));
      pushCloudDatabase(list);

      // If currently logged-in user is deleted, remove active session
      const savedCurrent = localStorage.getItem(STORAGE_KEY);
      if (savedCurrent) {
        const current: UserProfile = JSON.parse(savedCurrent);
        if (current && current.email && current.email.toLowerCase() === email.trim().toLowerCase()) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      window.dispatchEvent(new CustomEvent('dahamkke_user_updated'));
      return list.length < initialLength;
    } catch (e) {}
  }
  return false;
}
