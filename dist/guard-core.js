/*! Franklin Guard Core v1.0.0
 *  Deteksi kata kasar / toxic multi-bahasa. Dipakai di browser (window.FranklinGuardCore)
 *  dan di server / Cloudflare Pages Functions (require / import).
 *
 *  Bahasa: en, id, es, pt, fr, de, ru, tr, vi, th, ar, ro
 *  Level hasil: 0 = bersih, 1 = kata kasar/hinaan, 2 = berat (slur, ancaman, suruh bunuh diri)
 *
 *  Catatan format daftar kata (mode "token"):
 *    "kata"    -> harus sama persis dengan satu kata utuh
 *    "kata*"   -> awalan (menangkap kata+imbuhan)
 *    "dua kata"-> frasa
 *  Mode "ru" -> pencocokan awal kata Cyrillic dengan awalan umum; akhiran "$" = kata utuh.
 *  Mode "substr" -> pencocokan potongan teks (untuk bahasa tanpa spasi: Thai, Arab).
 *  Tambahkan kata sendiri: FranklinGuardCore.addWords('id', 'p', ['kata1','kata2'])
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FranklinGuardCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '1.0.0';

  var LISTS = {
    en: {
      p: ['fuck*', 'fuk', 'fck', 'fuking', 'fcking', 'phuck', 'shit*', 'bullshit*', 'bitch*', 'bastard', 'bastards',
          'asshole', 'assholes', 'dumbass', 'dumbfuck', 'dipshit', 'dickhead', 'cunt*', 'slut*', 'whore*', 'pussy',
          'motherfuck*', 'wanker', 'twat', 'douche', 'douchebag', 'stfu', 'gtfo', 'cocksucker', 'scumbag',
          'idiot', 'idiots', 'moron', 'morons', 'imbecile', 'jackass', 'shut up', 'piss off', 'suck my', 'go to hell'],
      s: ['nigger', 'niggers', 'nigga', 'niggas', 'faggot*', 'fag', 'retard', 'retards', 'retarded', 'tranny', 'kike', 'chink',
          'kys', 'kill yourself', 'kill urself', 'go kill yourself', 'go die', 'hope you die', 'hope you get cancer',
          'neck yourself', 'end yourself', 'rape you', 'i will kill you', 'ill kill you', 'i will find you',
          'i will hack you', 'ddos you', 'dox you']
    },
    id: {
      p: ['anjing*', 'anjir', 'anjrit', 'anying', 'bangsat*', 'bajingan*', 'brengsek*', 'kampret*', 'kontol*', 'kntl',
          'memek', 'memeknya', 'ngentot*', 'entot*', 'jancok*', 'jancuk*', 'jembut', 'asu', 'tolol*', 'goblok*', 'gblk',
          'sialan*', 'keparat*', 'bedebah', 'kunyuk', 'taik', 'pantek*', 'kimak', 'pukimak*', 'cibai', 'lonte*',
          'jablay', 'sundal*', 'perek', 'bacot', 'dungu', 'mampus', 'ngewe*', 'bangke'],
      s: ['mati aja', 'mati sana', 'mati lu', 'mati kau', 'bunuh diri sana', 'bunuh diri aja', 'bunuh lu',
          'bunuh kamu', 'gue bunuh', 'gw bunuh', 'aku bunuh kamu', 'perkosa lu', 'gue perkosa']
    },
    es: {
      p: ['puta', 'putas', 'puto', 'putos', 'putamadre', 'mierda*', 'cabron*', 'cabrona', 'pendejo*', 'pendeja',
          'gilipollas', 'joder', 'jodete', 'carajo', 'chinga*', 'chingada', 'verga', 'vergas', 'pinche', 'culero',
          'hdp', 'hijo de puta', 'hijoputa', 'malparido', 'imbecil', 'idiota', 'estupido', 'estupida', 'zorra',
          'callate', 'lameculos'],
      s: ['maricon', 'maricones', 'marica', 'sudaca', 'matate', 'muerete', 'ojala te mueras', 'te voy a matar',
          'te voy a encontrar', 'suicidate']
    },
    pt: {
      p: ['caralho*', 'porra', 'merda', 'merdas', 'foda se', 'fodase', 'foder', 'vai se foder', 'vsf', 'filho da puta',
          'fdp', 'buceta', 'cuzao', 'babaca*', 'otario*', 'arrombado*', 'vadia', 'cala a boca', 'cale a boca'],
      s: ['viado*', 'se mata', 'vai se matar', 'vou te matar', 'vou te achar', 'vou te estuprar']
    },
    fr: {
      p: ['merde', 'merdes', 'putain*', 'pute', 'connard*', 'connasse', 'salope*', 'salopard', 'encule*', 'enculer',
          'ntm', 'fdp', 'nique*', 'niquer', 'batard*', 'ta gueule', 'ferme ta gueule', 'abruti*', 'cretin*',
          'trou du cul', 'va te faire foutre', 'fils de pute', 'enfoire*'],
      s: ['pede', 'bougnoule', 'youpin', 'suicide toi', 'va crever', 'je vais te tuer', 'je vais te retrouver']
    },
    de: {
      p: ['scheisse*', 'scheiss*', 'arschloch*', 'arsch', 'fotze', 'hurensohn*', 'wichser*', 'fick', 'ficken', 'ficker',
          'fickt', 'fick dich', 'miststuck', 'mistkerl', 'schlampe', 'trottel', 'vollidiot', 'halt die fresse',
          'verpiss dich', 'leck mich', 'scheisskerl'],
      s: ['spast', 'spasti', 'neger', 'schwuchtel', 'kanake', 'bring dich um', 'geh sterben', 'ich bring dich um',
          'ich werde dich toten']
    },
    tr: {
      p: ['orospu*', 'amk', 'aq', 'amina koyim', 'amina koyayim', 'siktir*', 'sikeyim', 'sikerim', 'sikik', 'yarrak*',
          'yarak', 'gotveren', 'pezevenk*', 'serefsiz*', 'yavsak*', 'gerizekali*', 'aptal*', 'kahpe', 'kaltak',
          'pic kurusu', 'pust', 'haysiyetsiz'],
      s: ['ibne', 'geber', 'geber git', 'oldururum', 'seni oldurecegim', 'intihar et']
    },
    vi: {
      p: ['dit me', 'dit con me', 'dit me may', 'du ma', 'dmm', 'dcm', 'dkm', 'vcl', 'cai lon', 'con cho', 'thang cho',
          'do cho', 'oc cho', 'thang ngu', 'con ngu', 'do ngu', 'mat day', 'cut di', 'me may', 'chet tiet', 'do chet tiet'],
      s: ['chet di', 'di chet di', 'tu tu di', 'giet may', 'tao giet may']
    },
    ro: {
      p: ['pizda*', 'muie*', 'fut', 'futut*', 'futui', 'futu', 'dracu', 'dracului', 'labagiu*', 'nesimtit*', 'proasta',
          'prostule', 'handicapat*', 'sugi pula', 'suge pula', 'pula mea', 'pula ta', 'du te dracu', 'la dracu',
          'pizda matii', 'mortii matii', 'mortii tai', 'taci din gura', 'ratat', 'jegos'],
      s: ['sinucide te', 'omoara te', 'te omor', 'o sa te omor', 'sa mori']
    },
    ru: {
      mode: 'ru',
      p: ['хуй', 'хуе', 'хуя', 'пизд', 'ебат', 'ебал', 'ебан', 'ебуч', 'ебну', 'уебан', 'уебок', 'сука', 'суки', 'сучк',
          'мудак', 'мудил', 'долбоеб', 'долбаеб', 'гандон', 'залуп', 'шлюх', 'блядь', 'блять', 'бляд', 'говно',
          'дерьм', 'ублюдок', 'ублюдк', 'мразь', 'мразот', 'дебил', 'идиот', 'придурок', 'заткнись', 'заткни',
          'тварь', 'чмо$'],
      s: ['пидор', 'пидар', 'пидрил', 'хач$', 'чурка', 'жид$', 'убью', 'убей себя', 'сдохни', 'иди умри']
    },
    th: {
      mode: 'substr', nospace: true,
      p: ['ควย', 'เหี้ย', 'เชี่ย', 'เย็ดแม่', 'ไอ้สัตว์', 'อีสัตว์', 'ไอ้เวร', 'อีเวร', 'ระยำ', 'ชาติหมา', 'แม่ง',
          'ส้นตีน', 'ดอกทอง', 'ไอ้โง่', 'ไอ้บ้า', 'ไอ้ควาย', 'ไอ้ห่า', 'อีห่า', 'ตอแหล', 'ไอ้หน้าหี'],
      s: ['ไปตาย', 'ฆ่ามึง', 'ฆ่าแก', 'กะหรี่']
    },
    ar: {
      mode: 'substr',
      p: ['يا كلب', 'ابن الكلب', 'ابن الحرام', 'شرموط', 'عاهره', 'قحبه', 'منيوك', 'كس امك', 'كسمك', 'كس اختك',
          'يا حمار', 'يا غبي', 'يا احمق', 'متخلف', 'اخرس', 'حقير'],
      s: ['ابن الشرموطه', 'اقتل نفسك', 'روح انتحر', 'سأقتلك', 'راح اقتلك', 'اللعنه عليك']
    }
  };

  var ALLOW = {};
  ['shitake', 'shiitake', 'scunthorpe', 'merdeka'].forEach(function (w) { ALLOW[w] = true; });
  var EXTRA = { 'ß': 'ss', 'đ': 'd', 'ł': 'l', 'ø': 'o', 'æ': 'ae', 'œ': 'oe', 'ı': 'i' };
  var LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '+': 't' };

  function baseNormalize(input) {
    var s = String(input == null ? '' : input);
    s = s.normalize('NFKC').toLowerCase();
    s = s.replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF\u00AD]/g, '');
    s = s.normalize('NFD').replace(/[\u0300-\u036F]/g, '').normalize('NFC');
    s = s.replace(/[ßđłøæœı]/g, function (c) { return EXTRA[c]; });
    s = s.replace(/[\u064B-\u065F\u0670\u0640]/g, '')
         .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
         .replace(/ک/g, 'ك').replace(/ی/g, 'ي');
    return s;
  }
  function applyLeet(s) { return s.replace(/[0134578@$+]/g, function (c) { return LEET[c]; }); }
  function collapse2(s) { return s.replace(/(.)\1+/gu, '$1'); }
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function splitTokens(s) {
    var toks = s.split(/\s+/).filter(Boolean), out = toks.slice(), run = [];
    function flush() { if (run.length >= 3) out.push(run.join('')); run = []; }
    toks.forEach(function (t) { if (Array.from(t).length === 1 && /\p{L}/u.test(t)) run.push(t); else flush(); });
    flush(); return out;
  }
  function maskedTokens(base) {
    var out = [];
    base.split(/\s+/).forEach(function (raw) {
      if (!/\p{L}[*#]+\p{L}/u.test(raw)) return;
      var t = raw.replace(/^[^\p{L}\p{N}*#]+|[^\p{L}\p{N}*#]+$/gu, '');
      'aeiou'.split('').forEach(function (v) { out.push(t.replace(/[*#]+/g, v)); });
    }); return out;
  }
  var DB = null;
  var RU_PREFIX = '(?:по|на|за|вы|у|с|об|от|до|при|раз|рас|под|пере|про|вз|из|о|а|не)';
  function setMax(map, key, meta) { var old = map.get(key); if (!old || old.lvl < meta.lvl) map.set(key, meta); }
  function compile() {
    var db = { exact: new Map(), cexact: new Map(), prefix: [], phrase: [], regex: [], substr: [] };
    Object.keys(LISTS).forEach(function (lang) {
      var L = LISTS[lang], mode = L.mode || 'token';
      ['p', 's'].forEach(function (lv) {
        (L[lv] || []).forEach(function (w0) {
          var meta = { lang: lang, lvl: lv === 's' ? 2 : 1, w: w0 };
          var w = baseNormalize(w0).trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
          if (!w) return;
          if (mode === 'token') {
            if (w.charAt(w.length - 1) === '*') { var stem = w.slice(0, -1); db.prefix.push({ stem: stem, c: collapse2(stem), meta: meta }); }
            else if (w.indexOf(' ') >= 0) db.phrase.push({ t: w, c: collapse2(w), meta: meta });
            else { setMax(db.exact, w, meta); if (w.length >= 5) setMax(db.cexact, collapse2(w), meta); }
          } else if (mode === 'ru') {
            var end = w.charAt(w.length - 1) === '$', st = end ? w.slice(0, -1) : w;
            db.regex.push({ re: new RegExp('(?:^|[^а-яa-z0-9])' + RU_PREFIX + '?' + esc(st) + (end ? '(?![а-яa-z0-9])' : ''), 'u'), meta: meta });
          } else db.substr.push({ t: w, nospace: !!L.nospace, meta: meta });
        });
      });
    }); DB = db;
  }
  function check(text) {
    if (!DB) compile();
    var raw = String(text == null ? '' : text), empty = { flagged: false, level: 0, hits: [] };
    if (!raw.trim()) return empty;
    var base = baseNormalize(raw), leet = applyLeet(base), sets = [];
    [base, leet].forEach(function (s) {
      sets.push(splitTokens(s.replace(/[^\p{L}\p{N}\p{M}\s]/gu, ' ')));
      sets.push(splitTokens(s.replace(/[^\p{L}\p{N}\p{M}\s]/gu, '')));
    });
    sets.push(maskedTokens(base));
    var hits = [], seenHit = {};
    function add(meta, w) { var k = meta.lang + '|' + meta.w; if (seenHit[k]) return; seenHit[k] = true; hits.push({ word: w, lang: meta.lang, level: meta.lvl }); }
    var seenTok = {};
    sets.forEach(function (toks) {
      toks.forEach(function (t) {
        if (t.length < 2 || seenTok[t] || ALLOW[t]) return;
        seenTok[t] = true;
        var c = collapse2(t), m = DB.exact.get(t) || DB.cexact.get(c);
        if (m) { add(m, t); return; }
        for (var i = 0; i < DB.prefix.length; i++) { var p = DB.prefix[i]; if (t.indexOf(p.stem) === 0 || c.indexOf(p.c) === 0) { add(p.meta, t); break; } }
      });
      var joined = ' ' + toks.join(' ') + ' ', cj = collapse2(joined);
      DB.phrase.forEach(function (ph) { if (joined.indexOf(' ' + ph.t + ' ') >= 0 || cj.indexOf(' ' + ph.c + ' ') >= 0) add(ph.meta, ph.t); });
    });
    var spaced = base.replace(/[^\p{L}\p{N}\p{M}\s]/gu, ' ').replace(/\s+/g, ' ').trim(), nospace = spaced.replace(/\s/g, ''), cspaced = collapse2(spaced);
    DB.regex.forEach(function (r) { if (r.re.test(spaced) || r.re.test(cspaced)) add(r.meta, r.meta.w); });
    DB.substr.forEach(function (s) { if (spaced.indexOf(s.t) >= 0 || (s.nospace && nospace.indexOf(s.t.replace(/ /g, '')) >= 0)) add(s.meta, s.meta.w); });
    var level = 0; hits.forEach(function (h) { if (h.level > level) level = h.level; });
    return { flagged: hits.length > 0, level: level, hits: hits };
  }
  function addWords(lang, level, words) { LISTS[lang] = LISTS[lang] || {}; var key = level === 's' || level === 2 ? 's' : 'p'; LISTS[lang][key] = (LISTS[lang][key] || []).concat(words); DB = null; }
  function addAllow(words) { words.forEach(function (w) { ALLOW[baseNormalize(w)] = true; }); }
  return { VERSION: VERSION, check: check, normalize: baseNormalize, addWords: addWords, addAllow: addAllow, LISTS: LISTS };
});