// 국가동물보호정보시스템 분실동물 조회 → data/lost.json
// 신고자 이름·연락처(callName, callTel)와 상세주소(happenAddrDtl)는 개인정보라 저장하지 않음
import { writeFileSync, mkdirSync } from 'node:fs';
mkdirSync('data', { recursive: true });
const KEY = (process.env.ANIMAL_API_KEY || '').trim();
if (!KEY) { console.error('ANIMAL_API_KEY 없음'); process.exit(1); }
const BASE = 'https://apis.data.go.kr/1543061/lossInfoService/lossInfo';
const now = new Date(Date.now() + 9 * 3600e3), cut = new Date(now - 30 * 86400e3).toISOString().slice(0, 10).replace(/-/g, '');
const rows = [];
for (let page = 1; page <= 5; page++) {
  const res = await fetch(`${BASE}?serviceKey=${KEY}&pageNo=${page}&numOfRows=200&_type=json`); if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json(); const it = j?.response?.body?.items?.item; const a = Array.isArray(it) ? it : it ? [it] : [];
  rows.push(...a); if (a.length < 200) break;
}
const CAT = /고양이|페르시안|러시안|숏헤어|스코티시|샴|먼치킨|브리티시|노르웨이|랙돌|앙고라|아비시니안|벵갈|뱅갈|메인쿤|코숏|터키시|스핑크스|엑조틱|히말라얀|봄베이|데본|셀커크|아메리칸 컬|사바나|통키니즈|버만|버미즈|싱가푸라|오리엔탈|소말리|발리니즈|이집션|하바나/;
const items = rows.map(a => {
  const kind = String(a.kindCd || '').replace(/^\[[^\]]*\]\s*/, ''), addr = String(a.happenAddr || '').trim().split(/\s+/);
  return { sp: CAT.test(kind) ? 'cat' : 'dog', kind, color: a.colorCd || '', sex: a.sexCd || '',
    age: a.age || '', mark: String(a.specialMark || '').slice(0, 80), photo: String(a.popfile || '').replace(/^http:/, 'https:'),
    date: String(a.happenDt || '').replace(/[^0-9]/g, '').slice(0, 8), area: addr.slice(0, 3).join(' '), region: addr[0] || (a.orgNm || '').split(' ')[0] || '', org: a.orgNm || '' };
}).filter(a => a.photo && a.date >= cut).sort((x, y) => y.date.localeCompare(x.date));
mkdirSync('data', { recursive: true });
writeFileSync('data/lost.json', JSON.stringify({ updated: now.toISOString().slice(0, 16).replace('T', ' '), count: items.length, items }));
console.log(`lost saved ${items.length} of ${rows.length}`);
