import { UserProfile, INITIAL_USERS } from '../constants/userStore';
import { getRankByPoints, RankTier } from '../constants/rankSystem';

const STORAGE_KEY = 'dahamkke_current_user';
const ALL_USERS_DB_KEY = 'dahamkke_all_users_v2';

export function getAllUsers(): UserProfile[] {
  let list: UserProfile[] = [];
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedList = localStorage.getItem(ALL_USERS_DB_KEY);
    if (savedList) {
      try {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch (e) {}
    }
  }

  if (list.length === 0) {
    list = [...INITIAL_USERS];
  } else {
    // Ensure all INITIAL_USERS exist in DB
    for (const initUser of INITIAL_USERS) {
      if (!list.some((u) => u.id === initUser.id || (u.email && initUser.email && u.email.toLowerCase() === initUser.email.toLowerCase()))) {
        list.push(initUser);
      }
    }
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
        if (user && typeof user.points === 'number') {
          user.points = Math.max(0, user.points);
        }
        return user;
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
