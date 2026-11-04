export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonConfig {
  id: SeasonType;
  name: string; // '봄' | '여름' | '가을' | '겨울'
  icon: string; // '🌸' | '🌊' | '🍁' | '❄️'
  dateRange: string; // '3/1 ~ 5/31' | '6/1 ~ 8/31' | '9/1 ~ 11/30' | '12/1 ~ 2/28(2/29)'
  desktopBg: string; // '/backgrounds/desktop_spring.jpg'
  mobileBg: string; // '/backgrounds/mobile_spring.jpg'
}

export const SEASONS: Record<SeasonType, SeasonConfig> = {
  spring: {
    id: 'spring',
    name: '봄',
    icon: '🌸',
    dateRange: '3/1 ~ 5/31',
    desktopBg: '/backgrounds/desktop_spring.jpg',
    mobileBg: '/backgrounds/mobile_spring.jpg',
  },
  summer: {
    id: 'summer',
    name: '여름',
    icon: '🌊',
    dateRange: '6/1 ~ 8/31',
    desktopBg: '/backgrounds/desktop_summer.jpg',
    mobileBg: '/backgrounds/mobile_summer.jpg',
  },
  autumn: {
    id: 'autumn',
    name: '가을',
    icon: '🍁',
    dateRange: '9/1 ~ 11/30',
    desktopBg: '/backgrounds/desktop_autumn.jpg',
    mobileBg: '/backgrounds/mobile_autumn.jpg',
  },
  winter: {
    id: 'winter',
    name: '겨울',
    icon: '❄️',
    dateRange: '12/1 ~ 2/28(2/29)',
    desktopBg: '/backgrounds/desktop_winter.jpg',
    mobileBg: '/backgrounds/mobile_winter.jpg',
  },
};

/**
 * Returns current season based on calendar date:
 * 봄: 3/1 ~ 5/31 (3, 4, 5월)
 * 여름: 6/1 ~ 8/31 (6, 7, 8월)
 * 가을: 9/1 ~ 11/30 (9, 10, 11월)
 * 겨울: 12/1 ~ 2/28(2/29) (12, 1, 2월)
 */
export function getCurrentSeason(date: Date = new Date()): SeasonType {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) {
    return 'spring';
  }
  if (month >= 6 && month <= 8) {
    return 'summer';
  }
  if (month >= 9 && month <= 11) {
    return 'autumn';
  }
  return 'winter';
}

export function getCurrentSeasonConfig(date: Date = new Date()): SeasonConfig {
  return SEASONS[getCurrentSeason(date)];
}
