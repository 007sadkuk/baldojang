// 국가동물보호정보시스템 구조동물 조회 → data/adopt.json (인증키는 출력하지 않음)
import { writeFileSync, mkdirSync } from 'node:fs';
const KEY = (process.env.ANIMAL_API_KEY || '').trim();
if (!KEY) { console.error('ANIMAL_API_KEY 없음'); process.exit(1); }
const BASE = 'https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2';
const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, '');
const now = new Date(Date.now() + 9 * 3600e3), from = new Date(now - 30 * 86400e3);
async function get(upkind) {
  const out = [];
  for (let page = 1; page <= 3; page++) {
    const url = `${BASE}?serviceKey=${KEY}&upkind=${upkind}&bgnde=${ymd(from)}&endde=${ymd(now)}&pageNo=${page}&numOfRows=200&_type=json`;
    const res = await fetch(url); if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json(); const it = j?.response?.body?.items?.item;
    const arr = Array.isArray(it) ? it : it ? [it] : []; out.push(...arr);
    if (arr.length < 200) break;
  }
  return out;
}
const pick = a => ({
  id: a.desertionNo, sp: a.upKindCd === '422400' ? 'cat' : 'dog', kind: a.kindNm || '', color: a.colorCd || '',
  age: a.age || '', weight: a.weight || '', sex: a.sexCd || '', neuter: a.neuterYn || '', mark: (a.specialMark || '').slice(0, 80),
  photo: (a.popfile1 || '').replace(/^http:/, 'https:'), state: a.processState || '', found: a.happenDt || '',
  ns: a.noticeSdt || '', ne: a.noticeEdt || '', care: a.careNm || '', tel: a.careTel || '', org: a.orgNm || '',
  region: (a.orgNm || '').split(' ')[0] || ''
});
const all = [...await get('417000'), ...await get('422400')].map(pick).filter(a => a.state === '보호중' && a.photo);
mkdirSync('data', { recursive: true });
writeFileSync('data/adopt.json', JSON.stringify({ updated: now.toISOString().slice(0, 16).replace('T', ' '), count: all.length, items: all }));
console.log(`saved ${all.length} (dogs ${all.filter(a => a.sp === 'dog').length}, cats ${all.filter(a => a.sp === 'cat').length})`);
