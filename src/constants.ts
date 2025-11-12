/**
 * 事前登録する参加者リスト
 */

// ★ 1. 男性の名簿
export const PRE_REGISTERED_MALES = [
  '手嶋　悠太',
  '辻　誠也',
  '鈴木　康祐',
  '濱村　一輝',
  '西川　祐輔',
  '森田　和哉',
  '吉井　隆二',
　'川渕　ひかる',
　'大橋　世季',
　'小野　晃',
　'水野　啓一郎',
　'山田　大地',
　'三鬼　拓耶',
　'前川　響',
　'中尾　健聖',
　'佐久間　卓',
　'北山　智貴',
　'加藤　雅崇',
　'廣瀬　完治',


  // (ここに男性ゲストを追加)
];

// ★ 2. 女性の名簿
export const PRE_REGISTERED_FEMALES = [
  '福本　沙耶香',
  '中村　莉奈',
  '稲垣　菜子',
  '星夢　花',
  '永井　杏奈',
  '谷口　葵',
  '谷口　輝',
  '福森　穂果',
  '牛場　貴子',
  '深堀　京香',
  '日高　秋代',
  '町谷　真未',
  '家崎　実紗',
  '家崎　悠人',
  '田中　莉沙',
  '松井　真由',
  // (ここに女性ゲストを追加)
];

// それぞれソートしておく（任意）
PRE_REGISTERED_MALES.sort((a, b) => a.localeCompare(b, 'ja'));
PRE_REGISTERED_FEMALES.sort((a, b) => a.localeCompare(b, 'ja'));


// ★ 3. 総合リスト (ParticipantListView.tsx や ParticipantView.tsx のログインチェック用)
export const PRE_REGISTERED_LIST = [
  ...PRE_REGISTERED_MALES,
  ...PRE_REGISTERED_FEMALES
].sort((a, b) => a.localeCompare(b, 'ja'));