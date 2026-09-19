import { UserProfile } from '../constants/userStore';
import { getAllUsers, getUserRank } from './userPointsManager';
import { RankTier } from '../constants/rankSystem';

export interface MatchmakingPlayer {
  id: string;
  name: string;
  email: string;
  points: number;
  isRanked: boolean;
  joinedAt: number;
  rankTier: RankTier;
  avatarEmoji: string;
}

const QUEUE_STORAGE_KEY = 'dahamkke_online_matchmaking_queue_v2';
const BATTLE_CHANNEL_NAME = 'dahamkke_1v1_battle_sync';

// Default emojis assigned based on user ID / name
const AVATAR_EMOJIS = ['👦', '👧', '👨', '👩', '🧒', '🧑', '🦁', '🦊', '🐻', '🐼'];

function getAvatarEmoji(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
  }
  return AVATAR_EMOJIS[Math.abs(hash) % AVATAR_EMOJIS.length];
}

/**
 * Join the real-time online 1v1 matchmaking queue
 */
export function joinMatchmakingQueue(user: UserProfile, isRanked: boolean): MatchmakingPlayer {
  const player: MatchmakingPlayer = {
    id: user.id || `user_${Date.now()}`,
    name: user.name ? user.name.replace(/[()]/g, '') : '학생',
    email: user.email || '',
    points: user.points || 0,
    isRanked,
    joinedAt: Date.now(),
    rankTier: getUserRank(user),
    avatarEmoji: getAvatarEmoji(user.id || user.name),
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const rawQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
      let queue: MatchmakingPlayer[] = rawQueue ? JSON.parse(rawQueue) : [];
      if (!Array.isArray(queue)) queue = [];

      // Remove existing entry for this user
      queue = queue.filter((p) => p.id !== player.id);
      
      // Remove stale entries older than 30 seconds
      const now = Date.now();
      queue = queue.filter((p) => now - p.joinedAt < 30000);

      queue.push(player);
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));

      // Broadcast to other tabs/windows
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(BATTLE_CHANNEL_NAME);
        bc.postMessage({ type: 'PLAYER_JOINED', player });
        bc.close();
      }
    } catch (e) {}
  }

  return player;
}

/**
 * Leave the online matchmaking queue
 */
export function leaveMatchmakingQueue(userId: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const rawQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (rawQueue) {
        let queue: MatchmakingPlayer[] = JSON.parse(rawQueue);
        if (Array.isArray(queue)) {
          queue = queue.filter((p) => p.id !== userId);
          localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        }
      }
    } catch (e) {}
  }
}

/**
 * Search and find real 1v1 online opponent matching the user
 */
export function findOnlineOpponent(
  user: UserProfile,
  isRanked: boolean
): MatchmakingPlayer | null {
  const currentUserId = user.id;

  // 1. Check active real-time matchmaking queue first
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const rawQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (rawQueue) {
        const queue: MatchmakingPlayer[] = JSON.parse(rawQueue);
        const now = Date.now();
        
        // Find waiting real players (other than current user) matching mode
        const realWaitingPlayers = queue.filter(
          (p) => p.id !== currentUserId && p.isRanked === isRanked && now - p.joinedAt < 30000
        );

        if (realWaitingPlayers.length > 0) {
          // Sort by tier/points proximity if ranked
          if (isRanked) {
            realWaitingPlayers.sort(
              (a, b) => Math.abs(a.points - user.points) - Math.abs(b.points - user.points)
            );
          }
          const matched = realWaitingPlayers[0];
          // Remove matched player from queue
          leaveMatchmakingQueue(matched.id);
          return matched;
        }
      }
    } catch (e) {}
  }

  // 2. If no active player in queue at that second, pick real registered user from user database!
  const allRealUsers = getAllUsers().filter(
    (u) =>
      u.id !== currentUserId &&
      u.email !== user.email &&
      !u.id.startsWith('guest') &&
      u.id !== 'guest' &&
      !u.name.includes('게스트')
  );

  if (allRealUsers.length > 0) {
    // Sort real registered users by closeness of points/tier
    const sorted = [...allRealUsers].sort(
      (a, b) => Math.abs((a.points || 0) - user.points) - Math.abs((b.points || 0) - user.points)
    );
    
    // Pick from top 3 closest real registered students
    const targetUser = sorted[Math.floor(Math.random() * Math.min(3, sorted.length))];
    const rankTier = getUserRank(targetUser);

    return {
      id: targetUser.id,
      name: targetUser.name ? targetUser.name.replace(/[()]/g, '') : '동료 학생',
      email: targetUser.email,
      points: targetUser.points || 0,
      isRanked,
      joinedAt: Date.now(),
      rankTier,
      avatarEmoji: getAvatarEmoji(targetUser.id),
    };
  }

  return null;
}
