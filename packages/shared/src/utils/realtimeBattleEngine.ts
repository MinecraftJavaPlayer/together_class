import { UserProfile, INITIAL_USERS } from '../constants/userStore';
import { getAllUsers, getUserRank } from './userPointsManager';

export interface BattleRoomPlayer {
  id: string;
  name: string;
  email: string;
  points: number;
  rankName: string;
  tierGroup: string;
  subTier: string;
  avatarEmoji: string;
}

export interface RealtimeBattleRoom {
  roomId: string;
  isRanked: boolean;
  status: 'waiting' | 'in_progress' | 'finished';
  player1: BattleRoomPlayer;
  player2: BattleRoomPlayer | null;
  player1Score: number;
  player2Score: number;
  player1AnsweredQ: boolean;
  player2AnsweredQ: boolean;
  currentQuestionIndex: number;
  createdAt: number;
  updatedAt: number;
}

const BATTLE_ROOMS_KEY = 'dahamkke_active_battle_rooms_v3';
const BATTLE_CHANNEL_NAME = 'dahamkke_realtime_1v1_channel_v3';

const EMOJIS = ['👦', '👧', '👨', '👩', '🧒', '🧑', '🦁', '🦊', '🐻', '🐼'];

function getEmoji(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
  }
  return EMOJIS[Math.abs(hash) % EMOJIS.length];
}

export function toBattlePlayer(user: UserProfile): BattleRoomPlayer {
  const rank = getUserRank(user);
  return {
    id: user.id || `user_${Date.now()}`,
    name: user.name ? user.name.replace(/[()]/g, '') : '학생',
    email: user.email || '',
    points: user.points || 0,
    rankName: rank.name,
    tierGroup: rank.tierGroup,
    subTier: rank.subTier || '1',
    avatarEmoji: getEmoji(user.id || user.name),
  };
}

/**
 * Get all active battle rooms from shared storage
 */
export function getActiveBattleRooms(): RealtimeBattleRoom[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(BATTLE_ROOMS_KEY);
    if (!raw) return [];
    const rooms: RealtimeBattleRoom[] = JSON.parse(raw);
    const now = Date.now();
    // Filter out stale rooms older than 5 minutes
    return rooms.filter((r) => now - r.updatedAt < 300000);
  } catch (e) {
    return [];
  }
}

/**
 * Save active battle rooms to shared storage
 */
export function saveActiveBattleRooms(rooms: RealtimeBattleRoom[]): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(BATTLE_ROOMS_KEY, JSON.stringify(rooms));
    } catch (e) {}
  }
}

/**
 * Broadcast event across browser tabs and windows
 */
export function broadcastBattleEvent(eventData: any): void {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(BATTLE_CHANNEL_NAME);
      bc.postMessage(eventData);
      bc.close();
    } catch (e) {}
  }
}

/**
 * Start or Join a Real-Time Online 1v1 Battle Match
 */
export function joinRealtimeMatchmaking(
  user: UserProfile,
  isRanked: boolean
): { room: RealtimeBattleRoom; isHost: boolean } {
  const me = toBattlePlayer(user);
  const rooms = getActiveBattleRooms();

  // 1. Check if there is an existing waiting room created by another real player
  const waitingRoom = rooms.find(
    (r) => r.status === 'waiting' && r.isRanked === isRanked && r.player1.id !== me.id
  );

  if (waitingRoom) {
    // Join existing real player's room as Player 2!
    waitingRoom.player2 = me;
    waitingRoom.status = 'in_progress';
    waitingRoom.updatedAt = Date.now();

    const updatedRooms = rooms.map((r) => (r.roomId === waitingRoom.roomId ? waitingRoom : r));
    saveActiveBattleRooms(updatedRooms);

    broadcastBattleEvent({
      type: 'MATCH_FOUND',
      roomId: waitingRoom.roomId,
      room: waitingRoom,
    });

    return { room: waitingRoom, isHost: false };
  }

  // 2. Create a new waiting room as Host (Player 1)
  const newRoom: RealtimeBattleRoom = {
    roomId: `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    isRanked,
    status: 'waiting',
    player1: me,
    player2: null,
    player1Score: 0,
    player2Score: 0,
    player1AnsweredQ: false,
    player2AnsweredQ: false,
    currentQuestionIndex: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const updatedRooms = [...rooms.filter((r) => r.player1.id !== me.id), newRoom];
  saveActiveBattleRooms(updatedRooms);

  broadcastBattleEvent({
    type: 'ROOM_CREATED',
    roomId: newRoom.roomId,
    room: newRoom,
  });

  return { room: newRoom, isHost: true };
}

/**
 * Pick a real registered student from the actual user database (for solo testing fallback)
 */
export function getRealRegisteredStudentOpponent(currentUser: UserProfile): BattleRoomPlayer {
  const allUsers = getAllUsers();
  
  // Filter out current user and guests
  const realStudents = allUsers.filter(
    (u) =>
      u.id !== currentUser.id &&
      u.email !== currentUser.email &&
      !u.id.startsWith('guest') &&
      u.id !== 'guest' &&
      !(u.name && u.name.includes('게스트'))
  );

  let selectedUser: UserProfile;

  if (realStudents.length > 0) {
    // Sort by proximity of points
    const sorted = [...realStudents].sort(
      (a, b) => Math.abs((a.points || 0) - (currentUser.points || 0)) - Math.abs((b.points || 0) - (currentUser.points || 0))
    );
    selectedUser = sorted[Math.floor(Math.random() * Math.min(3, sorted.length))];
  } else {
    // Use preset student from INITIAL_USERS if database is empty
    selectedUser = INITIAL_USERS[0] || {
      id: 'student_real_1',
      email: 'student1@dahamkke.kr',
      name: '이수아',
      role: 'student',
      nativeLang: 'ko',
      points: Math.max(0, (currentUser.points || 100) + 50),
      completedModules: { translate: true, interpret: true, debate: true, persona: true, dictation: true, writing: true },
      seasonHistory: [],
    };
  }

  return toBattlePlayer(selectedUser);
}

/**
 * Cancel matchmaking and leave room
 */
export function leaveBattleRoom(roomId: string, userId: string): void {
  const rooms = getActiveBattleRooms();
  const filtered = rooms.filter((r) => r.roomId !== roomId && r.player1.id !== userId);
  saveActiveBattleRooms(filtered);
  broadcastBattleEvent({ type: 'ROOM_CANCELLED', roomId, userId });
}

/**
 * Submit Answer & Sync Real-Time Score in Active Room
 */
export function submitRealtimeAnswer(
  roomId: string,
  playerId: string,
  questionIndex: number,
  isCorrect: boolean,
  scoreGained: number
): RealtimeBattleRoom | null {
  const rooms = getActiveBattleRooms();
  const room = rooms.find((r) => r.roomId === roomId);
  if (!room) return null;

  const isPlayer1 = room.player1.id === playerId;

  if (isPlayer1) {
    room.player1AnsweredQ = true;
    if (isCorrect) room.player1Score += scoreGained;
  } else if (room.player2 && room.player2.id === playerId) {
    room.player2AnsweredQ = true;
    if (isCorrect) room.player2Score += scoreGained;
  }

  room.updatedAt = Date.now();

  // If both players answered this question, advance question index
  if (room.player1AnsweredQ && room.player2AnsweredQ) {
    room.currentQuestionIndex += 1;
    room.player1AnsweredQ = false;
    room.player2AnsweredQ = false;
  }

  saveActiveBattleRooms(rooms);

  broadcastBattleEvent({
    type: 'ANSWER_SUBMITTED',
    roomId,
    playerId,
    questionIndex,
    isCorrect,
    scoreGained,
    room,
  });

  return room;
}
