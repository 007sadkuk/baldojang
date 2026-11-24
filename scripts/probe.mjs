// API 응답 구조 확인용: 인증키는 절대 출력하지 않음
import { writeFileSync } from 'node:fs';
const KEY = process.env.ANIMAL_API_KEY || '';
const cands = [
  'https://apis.data.go.kr/1543061/abandonmentPublicService_v2/abandonmentPublic_v2',
  'https://apis.data.go.kr/1543061/abandonmentPublicSrvc/abandonmentPublic',
];
const out = { at: new Date().toISOString(), keyPresent: KEY.length > 0, keyLooksEncoded: /%/.test(KEY), results: [] };
for (const base of cands) {
  for (const enc of [false, true]) {
    const k = enc ? encodeURIComponent(KEY) : KEY;
    const url = `${base}?serviceKey=${k}&upkind=417000&pageNo=1&numOfRows=3&_type=json`;
    const r = { endpoint: base, reencoded: enc };
    try {
      const res = await fetch(url); r.status = res.status;
      const txt = await res.text();
      r.snippet = txt.replaceAll(KEY, '***').replaceAll(encodeURIComponent(KEY), '***').slice(0, 1500);
      try { const j = JSON.parse(txt); const items = j?.response?.body?.items?.item; const arr = Array.isArray(items) ? items : items ? [items] : [];
        r.totalCount = j?.response?.body?.totalCount; r.header = j?.response?.header; r.fields = arr[0] ? Object.keys(arr[0]) : []; r.sample = arr[0] || null; } catch (e) { r.json = false; }
    } catch (e) { r.error = String(e).replaceAll(KEY, '***'); }
    out.results.push(r);
  }
}
writeFileSync('data/probe.json', JSON.stringify(out, null, 2));
console.log(out.results.map(r => `${r.endpoint.split('/').slice(-2).join('/')} reenc=${r.reencoded} status=${r.status} fields=${(r.fields||[]).length} total=${r.totalCount ?? '-'}`).join('\n'));
