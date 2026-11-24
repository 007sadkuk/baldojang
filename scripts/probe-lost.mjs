const KEY = (process.env.ANIMAL_API_KEY || '').trim();
const hide = t => KEY ? String(t).split(KEY).join('***') : String(t);
const B = 'https://apis.data.go.kr/1543061/';
const names = ['lossInfoService/lossInfo','lossInfoService_v2/lossInfo_v2','lossInfoSrvc/lossInfo','lossInfoSrvc_v2/lossInfo_v2',
 'lostAnimalService/lostAnimal','lostAnimalSrvc/lostAnimal','lossAnimalService/lossAnimal','lossAnimalSrvc/lossAnimal',
 'lostInfoService/lostInfo','lostInfoSrvc/lostInfo','animalLossService/animalLoss','lossAnimalInfoService/lossAnimalInfo'];
const out = [];
for (const n of names) {
  try { const r = await fetch(`${B}${n}?serviceKey=${KEY}&pageNo=1&numOfRows=2&_type=json`); const t = await r.text();
    let fields = []; try { const j = JSON.parse(t); const it = j?.response?.body?.items?.item; const a = Array.isArray(it) ? it : it ? [it] : []; fields = a[0] ? Object.keys(a[0]) : []; } catch {}
    out.push({ n, status: r.status, fields, snip: hide(t).slice(0, 260).replace(/\s+/g, ' ') });
  } catch (e) { out.push({ n, err: hide(String(e)) }); }
}
console.log(JSON.stringify(out, null, 1));
