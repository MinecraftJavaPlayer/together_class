const DICTIONARY: Record<string, Record<string, string>> = {
  // Heungbu & Nolbu
  '옛날 옛적': { ru: 'Давным-давно', vi: 'Ngày xửa ngày xưa', zh: '很久以前', mn: 'Эрт урьд цагт', en: 'Once upon a time', ja: '昔々', ko: '옛날 옛적' },
  '어느 마을에': { ru: 'в одной деревне', vi: 'tại một ngôi làng', zh: '在一个村庄里', mn: 'нэгэн тосгонд', en: 'in a village', ja: 'ある村に', ko: '어느 마을에' },
  '형 놀부와': { ru: 'старший брат Нолбу и', vi: 'anh trai Nolbu và', zh: '哥哥甭夫和', mn: 'ах Нолбү болон', en: 'older brother Nolbu and', ja: '兄のノルブと', ko: '형 놀부와' },
  '동생 흥부가': { ru: 'младший брат Хынбу', vi: 'em trai Heungbu', zh: '弟弟兴夫', mn: 'дүү Хынбү', en: 'younger brother Heungbu', ja: '동생 흥부가', ko: '동생 흥부가' },
  '형 놀부': { ru: 'старший брат Нолбу', vi: 'anh trai Nolbu', zh: '哥哥甭夫', mn: 'ах Нолбү', en: 'older brother Nolbu', ja: '兄의ノルブ', ko: '형 놀부' },
  '동생 흥부': { ru: 'младший брат Хынбу', vi: 'em trai Heungbu', zh: '弟弟兴夫', mn: 'дүү Хынбү', en: 'younger brother Heungbu', ja: '동생 흥부', ko: '동생 흥부' },
  '놀부와': { ru: 'Нолбу и', vi: 'Nolbu và', zh: '甭夫和', mn: 'Нолбү болон', en: 'Nolbu and', ja: 'ノルブと', ko: '놀부와' },
  '흥부와': { ru: 'Хынбу и', vi: 'Heungbu và', zh: '兴夫和', mn: 'Хынбү болон', en: 'Heungbu and', ja: 'フンブと', ko: '흥부와' },
  '놀부가': { ru: 'Нолбу', vi: 'Nolbu', zh: '甭夫', mn: 'Нолбү', en: 'Nolbu', ja: 'ノルブ가', ko: '놀부가' },
  '흥부가': { ru: 'Хынбу', vi: 'Heungbu', zh: '兴夫', mn: 'Хынбү', en: 'Heungbu', ja: '흥부가', ko: '흥부가' },
  '놀부는': { ru: 'Нолбу', vi: 'Nolbu', zh: '甭夫', mn: 'Нолбү', en: 'Nolbu', ja: 'ノルブは', ko: '놀부는' },
  '흥부는': { ru: 'Хынбу', vi: 'Heungbu', zh: '兴夫', mn: 'Хынбү', en: 'Heungbu', ja: '흥부는', ko: '흥부는' },
  '놀부': { ru: 'Нолбу', vi: 'Nolbu', zh: '甭夫', mn: 'Нолбү', en: 'Nolbu', ja: 'ノルブ', ko: '놀부' },
  '흥부': { ru: 'Хынбу', vi: 'Heungbu', zh: '兴夫', mn: 'Хынбү', en: 'Heungbu', ja: '흥부', ko: '흥부' },
  '형제': { ru: 'братья', vi: 'anh em', zh: '兄弟', mn: 'ах дүү', en: 'brothers', ja: '兄弟', ko: '형제' },
  '형제가': { ru: 'братья', vi: 'anh em', zh: '兄弟들', mn: 'ах дүү хоёр', en: 'brothers', ja: '형제가', ko: '형제가' },
  '형제는': { ru: 'братья', vi: 'anh em', zh: '兄弟들', mn: 'ах дүү хоёр', en: 'brothers', ja: '형제는', ko: '형제는' },
  '살고 있었습니다': { ru: 'жили', vi: 'đã sống', zh: '生活着', mn: 'амьдардаг байжээ', en: 'lived', ja: '住んでいました', ko: '살고 있었습니다' },
  '살았습니다': { ru: 'жили', vi: 'đã sống', zh: '生活着', mn: 'амьдарч байв', en: 'lived', ja: '暮らしていました', ko: '살았습니다' },
  '가난했지만': { ru: 'был беден, но', vi: 'tuy nghèo nhưng', zh: 'although poor,', mn: 'ядуу байсан ч', en: 'was poor, but', ja: '貧しかったですが', ko: '가난했지만' },
  '온 가족이': { ru: 'вся семья', vi: 'cả gia đình', zh: '全家人', mn: 'гэр бүлээрээ', en: 'the whole family', ja: '家族みんなで', ko: '온 가족이' },
  '서로': { ru: 'друг друга', vi: 'nhau', zh: '互相', mn: 'бие биеэ', en: 'each other', ja: 'お互いを', ko: '서로' },
  '아끼며': { ru: 'дорожили', vi: 'trân trọng', zh: '珍惜', mn: 'хайрлан', en: 'cherished', ja: '大切に', ko: '아끼며' },
  '따뜻하게': { ru: 'тепло', vi: 'ấm áp', zh: '温馨地', mn: 'дулаан', en: 'warmly', ja: '温かく', ko: '따뜻하게' },
  
  // Yi Sun-sin
  '조선': { ru: 'Чосон', vi: 'Joseon', zh: '朝鲜', mn: 'Жосон', en: 'Joseon', ja: '朝鮮', ko: '조선' },
  '선조 때': { ru: 'в эпоху короля Сонджо', vi: 'thời vua Seonjo', zh: '宣祖时期', mn: 'Сонжо хааны үед', en: 'during King Seonjo’s reign', ja: '宣祖の時代', ko: '선조 때' },
  '왜군이': { ru: 'японская армия', vi: 'quân Nhật', zh: '倭军', mn: 'Японы цэрэг', en: 'the Japanese army', ja: '倭軍가', ko: '왜군이' },
  '수많은': { ru: 'многочисленные', vi: 'vô số', zh: '无数的', mn: 'олон тооны', en: 'numerous', ja: '数많은', ko: '수많은' },
  '군함을': { ru: 'военные корабли', vi: 'chiến hạm', zh: '军舰', mn: 'байлдааны хөлөг онгоцыг', en: 'warships', ja: '군함을', ko: '군함을' },
  '침략해 왔습니다': { ru: 'вторглась', vi: 'đã xâm lược', zh: '侵略了', mn: 'халдан довтолж ирэв', en: 'invaded', ja: '침략해왔습니다', ko: '침략해 왔습니다' },
  '이순신': { ru: 'Ли Сун Син', vi: 'Yi Sun-shin', zh: '李舜臣', mn: 'Ли Сүн Шин', en: 'Yi Sun-sin', ja: '李舜臣', ko: '이순신' },
  '장군은': { ru: 'генерал', vi: 'tướng quân', zh: '将军', mn: 'жанжин', en: 'general', ja: '장군은', ko: '장군은' },
  '학익진': { ru: 'Хакикджин (крыло журавля)', vi: 'Hạc Dực Trận', zh: '鹤翼阵', mn: 'Тогорууны далавчит 전법', en: 'Hakikjin (Crane Wing formation)', ja: '鶴翼の陣', ko: '학익진' },
  '거북선을': { ru: 'корабль-черепаху', vi: 'tàu rùa', zh: '龟船', mn: 'яст мэлхийн хөлөг онгоцыг', en: 'Turtle Ship', ja: '거북선을', ko: '거북선을' },
  '한산도 대첩에서': { ru: 'в битве при Хансандо', vi: 'trong trận Hansando', zh: '在闲山岛大捷中', mn: 'Хансандогийн тулалдаанд', en: 'in the Battle of Hansando', ja: '한산도 대첩에서', ko: '한산도 대첩에서' },
  '큰 승리를': { ru: 'великую победу', vi: 'chiến thắng lớn', zh: '巨大的胜利', mn: 'их ялалт', en: 'a great victory', ja: '큰 승리를', ko: '큰 승리를' },
  '거두었습니다': { ru: 'одержал', vi: 'đã giành được', zh: '取得了', mn: 'байгуулав', en: 'achieved', ja: '거두었습니다', ko: '거두었습니다' },

  // Notice elements
  '현장체험학습': { ru: 'экскурсию', vi: 'dã ngoại', zh: '研学旅行', mn: 'хээрийн дадлага', en: 'field trip', ja: '校外学習', ko: '현장체험학습' },
  '안내장': { ru: 'Объявление', vi: 'Thông báo', zh: '通知', mn: 'Удирдамж', en: 'Notice', ja: '案内', ko: '안내장' },
  '실시됩니다': { ru: 'состоится', vi: 'sẽ được tổ chức', zh: '将举行', mn: 'явагдана', en: 'will take place', ja: '実施されます', ko: '실시됩니다' },
  '실내화': { ru: 'сменную обувь', vi: 'giày đi trong nhà', zh: '室内鞋', mn: 'дотор өмсөх гутал', en: 'indoor shoes', ja: '上履き', ko: '실내화' },
  '개인 텀블러': { ru: 'личный термос', vi: 'bình nước cá nhân', zh: '个人保温杯', mn: 'хувийн термос', en: 'personal tumbler', ja: '水筒', ko: '개인 텀블러' },
  '도시락을': { ru: 'обед', vi: 'hộp cơm trưa', zh: '午餐', mn: 'өдрийн хоол', en: 'lunch box', ja: 'お弁当を', ko: '도시락을' },
  '지참하여': { ru: 'принести с собой', vi: 'mang theo', zh: '携带', mn: 'бэлдэж', en: 'bring', ja: '持参して', ko: '지참하여' },
  '오전 9시까지': { ru: 'к 9 часам утра', vi: 'trước 9 giờ sáng', zh: 'утра 9 giờ sáng', mn: 'өглөөний 09:00 цаг гэхэд', en: 'by 9:00 AM', ja: '午前9時まで', ko: '오전 9시까지' },
  '등교해 주시기 바랍니다': { ru: 'прийти в школу', vi: 'đến trường', zh: '请到校', mn: 'сургуульдаа ирнэ үү', en: 'please come to school', ja: '登校してください', ko: '등교해 주시기 바랍니다' },
  '제출 기한은': { ru: 'срок сдачи', vi: 'hạn nộp là', zh: '截止时间为', mn: 'хугацаа нь', en: 'deadline is', ja: '提出期限は', ko: '제출 기한은' },
  '제출기한은': { ru: 'срок сдачи', vi: 'hạn nộp là', zh: '截止时间为', mn: 'хугацаа нь', en: 'deadline is', ja: '提出期限는', ko: '제출기한은' },
  '도서': { ru: 'книги', vi: 'sách', zh: '图书', mn: 'ном', en: 'books', ja: '図書', ko: '도서' },
  '반납': { ru: 'возврат', vi: 'trả sách', zh: '归还', mn: 'буцааж өгөх', en: 'return', ja: '返却', ko: '반납' },
  '대출': { ru: 'выдача', vi: 'mượn sách', zh: '借阅', mn: 'зээлэх', en: 'borrow', ja: '貸出', ko: '대출' },
  '기한은': { ru: 'срок', vi: 'hạn', zh: '截止日期为', mn: 'хугацаа нь', en: 'deadline is', ja: '期限は', ko: '기한은' },
  '연체': { ru: 'просрочка', vi: 'quá hạn', zh: 'удирдлага', mn: 'хугацаа хэтэрсэн', en: 'overdue', ja: '延滞', ko: '연체' },
  '제한': { ru: 'ограничение', vi: 'giới hạn', zh: '限制', mn: 'хязгаарлах', en: 'restrict', ja: '制限', ko: '제한' }
};

export async function translateSourceText(text: string, target: string): Promise<string> {
  if (target === 'ko') {
    return text;
  }

  // 1. Try real translation using MyMemory API
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ko|${target}`);
    const data = await res.json();
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (err) {
    console.error('MyMemory Translation failed, using local dictionary:', err);
  }

  // 2. Fallback: Dictionary-based token translation
  let result = text;
  const placeholders: Record<string, string> = {};
  let placeholderCounter = 0;

  const keys = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);

  for (const key of keys) {
    let index = result.indexOf(key);
    while (index !== -1) {
      const placeholder = `__TOKEN_${placeholderCounter}__`;
      placeholders[placeholder] = DICTIONARY[key][target] || DICTIONARY[key].ko;
      placeholderCounter++;
      
      result = result.substring(0, index) + placeholder + result.substring(index + key.length);
      index = result.indexOf(key);
    }
  }

  for (const placeholder in placeholders) {
    result = result.replaceAll(placeholder, placeholders[placeholder]);
  }

  return result;
}
