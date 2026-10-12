/* 墨点识字 · 核心库：DOM 小工具、存档、朗读、音效、吉祥物、成就、撒花 */
(function () {
  'use strict';
  var D = window.DATA;
  var MZ = window.MZ = { D: D };

  /* ---------- DOM ---------- */
  MZ.h = function h(tag, attrs) {
    var el = document.createElement(tag);
    var kids = Array.prototype.slice.call(arguments, 2);
    if (attrs) {
      for (var k in attrs) {
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') {
          for (var sk in v) { if (sk.slice(0, 2) === '--') el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; }
        }
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'data') { for (var dk in v) el.dataset[dk] = v[dk]; }
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    (function add(list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c == null || c === false) continue;
        if (Array.isArray(c)) add(c);
        else el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
      }
    })(kids);
    return el;
  };
  var h = MZ.h;
  MZ.$ = function (s, el) { return (el || document).querySelector(s); };
  MZ.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); return el; };
  MZ.shuffle = function (a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  MZ.pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  MZ.isCJK = function (c) { return c >= '一' && c <= '鿿'; };

  /* ---------- 存档（localStorage，读写都包 try/catch） ---------- */
  var KEY = 'modian.v1';
  var mem = null;
  function fresh() {
    return { v: 1, learned: {}, starred: {}, wrote: 0, stars: 0, levels: {}, idioms: {}, idiomOk: {}, reads: {},
             days: [], ach: {}, set: { sound: true, pinyin: true, rate: 0.85 }, daily: { date: '', n: 0, done: false },
             // 以下是第二版新增的：复习、小游戏、装扮、小冒险（老存档里没有，读取时自动补上）
             spent: 0, rev: {}, cured: 0, wakeRounds: 0, wakeCards: 0, own: {}, wear: { hat: '', face: '', neck: '', bg: '' },
             adv: { date: '', wake: 0, game: 0, chest: 0 }, chests: 0, rec: {}, gt: {}, plays: {}, combo: 0, recs: 0, dict: 0, book: 0 };
  }
  function today() {
    var d = new Date();
    var m = d.getMonth() + 1, dd = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
  }
  MZ.today = today;
  // 日期加减：'2026-10-12' 加 n 天 -> 字符串
  MZ.addDays = function (str, n) {
    var p = str.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] + n);
    var m = d.getMonth() + 1, dd = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
  };
  var S = MZ.S = {
    get: function () {
      if (mem) return mem;
      try { var s = localStorage.getItem(KEY); mem = s ? JSON.parse(s) : null; } catch (e) { mem = null; }
      // iPad 应用里，学习记录还会在原生那边多存一份；网页存储万一被系统清掉，用它找回
      if (!mem && typeof window.__mzNativeSave === 'string') { try { mem = JSON.parse(window.__mzNativeSave); } catch (e2) { mem = null; } }
      var f = fresh();
      if (!mem || typeof mem !== 'object') mem = f;
      for (var k in f) if (!(k in mem)) mem[k] = f[k];
      for (var k2 in f.set) if (!(k2 in mem.set)) mem.set[k2] = f.set[k2];
      return mem;
    },
    save: function () {
      var json = '';
      try { json = JSON.stringify(mem); } catch (e0) { return; }
      try { localStorage.setItem(KEY, json); } catch (e) { /* 存不了就只在内存里 */ }
      try { var nb = nativeBridge(); if (nb) nb.postMessage({ cmd: 'save', data: json }); } catch (e1) { /* ignore */ }
    },
    reset: function () { mem = fresh(); S.save(); },
    count: function (o) { return Object.keys(o).length; },
    touchDay: function () {
      var s = S.get(), t = today();
      if (s.days.indexOf(t) < 0) { s.days.push(t); s.days.sort(); }
      if (s.daily.date !== t) s.daily = { date: t, n: 0, done: false };
      S.save();
    },
    streak: function () {
      var s = S.get(), set = {}, i;
      s.days.forEach(function (d) { set[d] = 1; });
      var d = new Date(), n = 0;
      function fmt(x) { var m = x.getMonth() + 1, dd = x.getDate(); return x.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd; }
      if (!set[fmt(d)]) d.setDate(d.getDate() - 1);          // 今天还没学，从昨天开始算
      while (set[fmt(d)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },
    addStars: function (n) { if (n > 0) { S.get().stars += n; S.save(); } },
    wallet: function () { var s = S.get(); return Math.max(0, s.stars - (s.spent || 0)); },
    learnedCount: function () { return S.count(S.get().learned); },
    dailyN: function () { var s = S.get(); return s.daily.date === today() ? s.daily.n : 0; },
  };
  MZ.DAILY_GOAL = 3;

  /* ---------- 声音：系统朗读 + 合成音效 ---------- */
  var voice = null, noVoiceWarned = false;
  function pickVoice() {
    try {
      var vs = window.speechSynthesis.getVoices() || [];
      var zh = vs.filter(function (v) { return /^zh([-_]|$)/i.test(v.lang) || /chinese|中文|普通话/i.test(v.name); });
      var cn = zh.filter(function (v) { return /CN|Hans/i.test(v.lang); });
      voice = (cn[0] || zh[0] || null);
    } catch (e) { voice = null; }
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    try { window.speechSynthesis.onvoiceschanged = pickVoice; } catch (e) { /* ignore */ }
  }
  /* 朗读有两条路：iPad 应用里优先走原生语音（更稳），在浏览器里走系统自带的 speechSynthesis */
  function nativeBridge() {
    try { return (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.mozhi) || null; } catch (e) { return null; }
  }
  var speakSeq = 0, pending = {};
  window.__mzSpeakDone = function (id, ok) { var r = pending[id]; if (r) { delete pending[id]; r(ok !== false); } };
  MZ.hasTTS = function () { return !!nativeBridge() || ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'); };
  MZ.speak = function (text, opt) {
    opt = opt || {};
    return new Promise(function (res) {
      var st = S.get();
      if (!st.set.sound || !MZ.hasTTS()) { res(false); return; }
      var rate = opt.rate || st.set.rate || 0.85;
      var finished = false;
      function done(ok) { if (!finished) { finished = true; res(ok); } }
      // 万一系统没有回报“读完了”，按字数估一个时间，免得“朗读全文”卡住
      var guard = setTimeout(function () { done(true); }, 2500 + text.length * 600 / rate);
      var nb = nativeBridge();
      if (nb) {
        var id = ++speakSeq;
        pending[id] = function (ok) { clearTimeout(guard); done(ok); };
        try { nb.postMessage({ cmd: 'speak', id: id, text: text, rate: rate, queue: !!opt.queue }); } catch (e) { clearTimeout(guard); done(false); }
        return;
      }
      try {
        var synth = window.speechSynthesis;
        if (!voice) pickVoice();
        if (!voice && !noVoiceWarned && synth.getVoices && synth.getVoices().length === 0) {
          noVoiceWarned = true;
          MZ.toast('没有听到声音？请检查音量，或到 设置 → 辅助功能 → 朗读内容 → 声音 里下载中文语音。', { long: true });
        }
        if (!opt.queue) synth.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        if (voice) u.voice = voice;
        u.rate = rate;
        u.pitch = 1.05;
        u.onend = function () { clearTimeout(guard); done(true); };
        u.onerror = function () { clearTimeout(guard); done(false); };
        setTimeout(function () { try { synth.speak(u); } catch (e) { clearTimeout(guard); done(false); } }, opt.queue ? 0 : 40);
      } catch (e) { clearTimeout(guard); done(false); }
    });
  };
  MZ.stopSpeak = function () {
    try {
      var nb = nativeBridge();
      if (nb) nb.postMessage({ cmd: 'stop' });
      else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch (e) { /* ignore */ }
  };
  MZ.say = function (c) { var ch = D.chars[c]; return (ch && ch.say) ? ch.say : c; };
  MZ.speakChar = function (c) { return MZ.speak(MZ.say(c)); };

  var ac = null;
  function actx() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') { try { ac.resume(); } catch (e) { /* ignore */ } }
    return ac;
  }
  function tone(freq, dur, type, when, vol) {
    var c = actx(); if (!c || !S.get().set.sound) return;
    try {
      var o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + (when || 0);
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.16, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) { /* ignore */ }
  }
  MZ.sfx = {
    tap: function () { tone(520, 0.05, 'sine', 0, 0.08); },
    ok: function () { tone(660, 0.1, 'sine', 0, 0.16); tone(880, 0.16, 'sine', 0.09, 0.16); },
    bad: function () { tone(240, 0.2, 'triangle', 0, 0.14); tone(200, 0.2, 'triangle', 0.12, 0.12); },
    star: function () { [784, 988, 1175, 1568].forEach(function (f, i) { tone(f, 0.18, 'sine', i * 0.08, 0.15); }); },
    win: function () { [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { tone(f, 0.2, 'triangle', i * 0.11, 0.14); }); },
    stroke: function () { tone(740, 0.07, 'sine', 0, 0.1); },
    pop: function () { tone(420, 0.05, 'sine', 0, 0.12); tone(900, 0.09, 'sine', 0.04, 0.14); },
    flip: function () { tone(360, 0.05, 'triangle', 0, 0.09); },
    splash: function () { tone(300, 0.14, 'sawtooth', 0, 0.05); tone(180, 0.2, 'triangle', 0.05, 0.1); },
    coin: function () { tone(988, 0.07, 'square', 0, 0.06); tone(1319, 0.2, 'square', 0.07, 0.06); },
    combo: function (n) { var base = 523 * Math.pow(1.0595, Math.min(12, n) ); tone(base, 0.09, 'sine', 0, 0.15); tone(base * 1.5, 0.16, 'sine', 0.07, 0.13); },
    chest: function () { [392, 523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, 0.22, 'triangle', i * 0.09, 0.15); }); },
    tick: function () { tone(1000, 0.03, 'square', 0, 0.03); },
  };

  /* ---------- 提示条 / 对话框 ---------- */
  var toastTimer = null;
  MZ.toast = function (msg, opt) {
    opt = opt || {};
    var host = document.getElementById('toast');
    if (!host) return;
    MZ.clear(host);
    host.appendChild(h('div', { class: 'toast-in' + (opt.ach ? ' toast-ach' : '') },
      opt.ach ? opt.ach : null,
      h('span', null, msg)));
    host.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { host.classList.remove('on'); }, opt.long ? 5200 : 2400);
  };
  MZ.modal = function (o) {
    var host = document.getElementById('modal');
    MZ.clear(host);
    var box = h('div', { class: 'modal-box' + (o.wide ? ' wide' : '') });
    function close() { host.classList.remove('on'); MZ.clear(host); }
    if (o.title) box.appendChild(h('h2', null, o.title));
    var body = h('div', { class: 'modal-body' });
    if (typeof o.body === 'string') body.textContent = o.body; else if (o.body) body.appendChild(o.body);
    box.appendChild(body);
    var bar = h('div', { class: 'modal-bar' });
    (o.buttons || [{ label: '好的', kind: 'primary' }]).forEach(function (b) {
      bar.appendChild(h('button', { class: 'btn ' + (b.kind || 'ghost'), onclick: function () { MZ.sfx.tap(); close(); if (b.onClick) b.onClick(); } }, b.label));
    });
    box.appendChild(bar);
    host.appendChild(box);
    host.classList.add('on');
    return close;
  };

  /* ---------- 吉祥物“墨墨”（原创） + 装扮 ---------- */
  // 装扮全部是自己画的小图形。画布 120×140，墨墨的头尖在 (60,6)。slot：hat 帽子 / face 脸上 / neck 脖子 / bg 背景
  MZ.ITEMS = [
    { id: 'bow', slot: 'hat', name: '粉红蝴蝶结', price: 6, emoji: '🎀', svg:
      '<g transform="translate(76 27) rotate(18)"><path d="M0 0 L-17 -10 L-17 10 Z M0 0 L17 -10 L17 10 Z" fill="#FF6FA5" stroke="#E04D86" stroke-width="2" stroke-linejoin="round"/><circle r="4.6" fill="#FF9CC4" stroke="#E04D86" stroke-width="2"/></g>' },
    { id: 'flower', slot: 'hat', name: '小红花', price: 8, emoji: '🌺', svg:
      '<g transform="translate(77 27)"><g fill="#FF5C7A"><circle cx="0" cy="-8" r="6.4"/><circle cx="7.6" cy="-2.5" r="6.4"/><circle cx="4.7" cy="6.5" r="6.4"/><circle cx="-4.7" cy="6.5" r="6.4"/><circle cx="-7.6" cy="-2.5" r="6.4"/></g><circle r="5" fill="#FFC83D"/></g>' },
    { id: 'cap', slot: 'hat', name: '蓝色小帽', price: 10, emoji: '🧢', svg:
      '<path d="M43 36 C42 8 78 8 77 36 Z" fill="#4E9BF5" stroke="#2F78CE" stroke-width="2.4" stroke-linejoin="round"/><circle cx="60" cy="10" r="3.4" fill="#2F78CE"/><path d="M68 31 Q95 28 98 37 L68 38 Z" fill="#2F78CE"/>' },
    { id: 'party', slot: 'hat', name: '派对帽', price: 10, emoji: '🎉', svg:
      '<path d="M44 38 L60 -14 L76 38 Z" fill="#FF7A59" stroke="#D8553A" stroke-width="2.4" stroke-linejoin="round"/><path d="M52 18 L68 24 M49 28 L71 34" stroke="#FFE08A" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="-14" r="5.4" fill="#FFC83D"/>' },
    { id: 'straw', slot: 'hat', name: '小草帽', price: 12, emoji: '👒', svg:
      '<ellipse cx="60" cy="34" rx="37" ry="9" fill="#F2C46B" stroke="#D6A23F" stroke-width="2.2"/><path d="M41 33 C40 6 80 6 79 33 Z" fill="#F7D78A" stroke="#D6A23F" stroke-width="2.2" stroke-linejoin="round"/><path d="M41 29 C48 33 72 33 79 29 L79 25 C72 29 48 29 41 25 Z" fill="#E85F3E"/>' },
    { id: 'chef', slot: 'hat', name: '小厨师帽', price: 14, emoji: '👨‍🍳', svg:
      '<g fill="#fff" stroke="#D9D3E8" stroke-width="2.2"><circle cx="47" cy="19" r="11"/><circle cx="73" cy="19" r="11"/><circle cx="60" cy="9" r="12"/><rect x="45" y="22" width="30" height="16" rx="3"/></g><rect x="45" y="22" width="30" height="16" rx="3" fill="#fff"/>' },
    { id: 'phones', slot: 'hat', name: '大耳机', price: 16, emoji: '🎧', svg:
      '<path d="M26 78 C20 -22 100 -22 94 78" fill="none" stroke="#3B3670" stroke-width="6" stroke-linecap="round"/><rect x="12" y="68" width="17" height="30" rx="8" fill="#FF7A59" stroke="#D8553A" stroke-width="2.4"/><rect x="91" y="68" width="17" height="30" rx="8" fill="#FF7A59" stroke="#D8553A" stroke-width="2.4"/>' },
    { id: 'wizard', slot: 'hat', name: '魔法帽', price: 24, emoji: '🧙', svg:
      '<path d="M42 38 C48 20 54 4 66 -22 C68 6 74 24 78 38 Z" fill="#6A56D8" stroke="#4A3CAE" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="60" cy="38" rx="33" ry="8" fill="#5846C2" stroke="#4A3CAE" stroke-width="2.4"/><path d="M60 14 l2 5 5 .6 -3.8 3.4 1 5 -4.2 -2.6 -4.2 2.6 1 -5 -3.8 -3.4 5 -.6z" fill="#FFC83D"/>' },
    { id: 'crown', slot: 'hat', name: '小皇冠', price: 30, emoji: '👑', svg:
      '<path d="M41 36 L38 8 L51 21 L60 2 L69 21 L82 8 L79 36 Z" fill="#FFC83D" stroke="#E8A90C" stroke-width="2.6" stroke-linejoin="round"/><circle cx="60" cy="27" r="4" fill="#EF5B5B"/><circle cx="47" cy="29" r="2.8" fill="#5DA9FF"/><circle cx="73" cy="29" r="2.8" fill="#2FB9A5"/>' },
    { id: 'glasses', slot: 'face', name: '圆眼镜', price: 12, emoji: '👓', svg:
      '<g fill="rgba(255,255,255,.18)" stroke="#2A2748" stroke-width="3"><circle cx="44" cy="92" r="14"/><circle cx="76" cy="92" r="14"/></g><path d="M58 92 Q60 88 62 92 M30 90 L20 86 M90 90 L100 86" stroke="#2A2748" stroke-width="3" fill="none" stroke-linecap="round"/>' },
    { id: 'shades', slot: 'face', name: '酷酷墨镜', price: 16, emoji: '🕶️', svg:
      '<rect x="27" y="81" width="32" height="22" rx="9" fill="#1d1b3a"/><rect x="61" y="81" width="32" height="22" rx="9" fill="#1d1b3a"/><path d="M59 88 L61 88" stroke="#1d1b3a" stroke-width="4"/><path d="M33 86 L41 86 M67 86 L75 86" stroke="#7B77B5" stroke-width="3" stroke-linecap="round"/>' },
    { id: 'stache', slot: 'face', name: '小胡子', price: 14, emoji: '👨', svg:
      '<path d="M42 105 Q50 97 60 103 Q70 97 78 105 Q70 110 60 106.5 Q50 110 42 105Z" fill="#4A3828" stroke="#2f2418" stroke-width="1.4"/>' },
    { id: 'bell', slot: 'neck', name: '小铃铛', price: 8, emoji: '🔔', svg:
      '<path d="M22 118 Q60 134 98 118" fill="none" stroke="#EF5B5B" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="129" r="6.6" fill="#FFC83D" stroke="#E8A90C" stroke-width="2"/><path d="M57 130 h6" stroke="#E8A90C" stroke-width="2"/>' },
    { id: 'bowtie', slot: 'neck', name: '蓝领结', price: 10, emoji: '🤵', svg:
      '<g transform="translate(60 124)"><path d="M0 0 L-17 -9 L-17 9 Z M0 0 L17 -9 L17 9 Z" fill="#5DA9FF" stroke="#3A86E0" stroke-width="2.2" stroke-linejoin="round"/><rect x="-4.6" y="-5.6" width="9.2" height="11.2" rx="3" fill="#7FBBFF" stroke="#3A86E0" stroke-width="2"/></g>' },
    { id: 'scarf', slot: 'neck', name: '红围巾', price: 12, emoji: '🧣', svg:
      '<path d="M20 116 Q60 134 100 116 L103 128 Q60 146 17 128 Z" fill="#EF5B5B" stroke="#C94444" stroke-width="2.2" stroke-linejoin="round"/><path d="M84 128 L92 148 L102 143 L98 126 Z" fill="#EF5B5B" stroke="#C94444" stroke-width="2.2" stroke-linejoin="round"/><path d="M30 124 Q60 138 90 124" fill="none" stroke="#FFD0C9" stroke-width="2.6" stroke-dasharray="5 6"/>' },
    { id: 'meadow', slot: 'bg', name: '绿草地', price: 10, emoji: '🌳' },
    { id: 'sea', slot: 'bg', name: '蓝色海边', price: 16, emoji: '🏖️' },
    { id: 'night', slot: 'bg', name: '星星夜空', price: 16, emoji: '🌙' },
    { id: 'candy', slot: 'bg', name: '糖果乐园', price: 20, emoji: '🍭' },
    { id: 'snow', slot: 'bg', name: '雪山小屋', price: 20, emoji: '⛄' },
  ];
  MZ.ITEM = {};
  MZ.ITEMS.forEach(function (it) { MZ.ITEM[it.id] = it; });
  MZ.SLOTS = [{ k: 'hat', label: '帽子' }, { k: 'face', label: '脸上' }, { k: 'neck', label: '脖子' }, { k: 'bg', label: '背景' }];

  var gid = 0;
  // opt：{ bare: true } 不戴任何装扮；{ hat, face, neck } 试穿（商店预览用）
  MZ.mascot = function (mood, size, opt) {
    mood = mood || 'happy';
    opt = opt || {};
    var id = 'mg' + (++gid);
    var wear = opt.bare ? {} : (S.get().wear || {});
    function worn(slot) {
      var k = opt[slot] !== undefined ? opt[slot] : wear[slot];
      var it = k && MZ.ITEM[k];
      return it && it.slot === slot ? it.svg : '';
    }
    var mouth = {
      happy: '<path d="M49 107 Q60 120 71 107" stroke="#fff" stroke-width="3.4" stroke-linecap="round" fill="none"/>',
      cheer: '<path d="M47 104 Q60 128 73 104 Z" fill="#fff"/><path d="M53 114 Q60 120 67 114 Q60 110 53 114Z" fill="#FF7A59"/>',
      think: '<ellipse cx="60" cy="112" rx="5" ry="6" fill="#fff"/>',
      oops: '<path d="M51 115 Q60 106 69 115" stroke="#fff" stroke-width="3.4" stroke-linecap="round" fill="none"/>',
      sleep: '<path d="M52 112 Q60 117 68 112" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>',
    }[mood] || '';
    var brow = mood === 'oops' ? '<path d="M35 77 L52 82 M85 77 L68 82" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' : '';
    var sparkle = mood === 'cheer' ? '<g fill="#FFC83D"><path d="M100 22 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M18 36 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/></g>' : '';
    var zzz = mood === 'sleep' ? '<g fill="#8C7BEA" font-family="sans-serif" font-weight="900"><text x="86" y="40" font-size="20">z</text><text x="98" y="24" font-size="14">z</text></g>' : '';
    var pupil = mood === 'think' ? ['50', '86', '82', '86'] : ['46', '93', '78', '93'];
    var eyes;
    if (mood === 'sleep') {
      eyes = '<g class="eyes-shut"><path d="M35 94 Q44 101 53 94 M67 94 Q76 101 85 94" stroke="#fff" stroke-width="3.6" stroke-linecap="round" fill="none"/></g>';
    } else {
      eyes = '<g class="eyes"><circle cx="44" cy="92" r="10" fill="#fff"/><circle cx="76" cy="92" r="10" fill="#fff"/>' +
        '<circle cx="' + pupil[0] + '" cy="' + pupil[1] + '" r="5" fill="#1d1b3a"/><circle cx="' + pupil[2] + '" cy="' + pupil[3] + '" r="5" fill="#1d1b3a"/>' +
        '<circle cx="' + (+pupil[0] + 1.8) + '" cy="' + (+pupil[1] - 2) + '" r="1.6" fill="#fff"/><circle cx="' + (+pupil[2] + 1.8) + '" cy="' + (+pupil[3] - 2) + '" r="1.6" fill="#fff"/></g>';
    }
    var s = size || 120;
    return h('span', { class: 'mascot m-' + mood, style: { width: (s / 17).toFixed(2) + 'rem', height: (s * 1.17 / 17).toFixed(2) + 'rem' }, html:
      '<svg viewBox="0 0 120 140" width="100%" height="100%" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A66B8"/><stop offset="1" stop-color="#2F2C5C"/></linearGradient></defs>' +
      '<ellipse cx="60" cy="136" rx="30" ry="4" fill="#000" opacity=".1"/>' +
      '<path d="M60 6 C60 6 14 62 14 92 C14 118 34 134 60 134 C86 134 106 118 106 92 C106 62 60 6 60 6Z" fill="url(#' + id + ')"/>' +
      '<path d="M60 6 C60 6 48 20 40 36 C54 24 60 6 60 6Z" fill="#fff" opacity=".22"/>' +
      '<ellipse cx="36" cy="82" rx="7" ry="14" fill="#fff" opacity=".18" transform="rotate(18 36 82)"/>' +
      eyes + brow +
      '<ellipse cx="29" cy="106" rx="7" ry="4.5" fill="#FF8F7A" opacity=".75"/><ellipse cx="91" cy="106" rx="7" ry="4.5" fill="#FF8F7A" opacity=".75"/>' +
      mouth + worn('face') + worn('neck') + worn('hat') + sparkle + zzz + '</svg>' });
  };
  MZ.PRAISE = ['真棒！', '太厉害了！', '答对啦！', '你好聪明！', '继续加油！', '写得真好看！', '好样的！'];
  MZ.TRYAGAIN = ['再想想看～', '差一点点！', '没关系，再试试。', '看看正确答案吧。'];

  /* ---------- 带拼音的文字 ---------- */
  // 把一段文字渲染成 [拼音 / 汉字] 的小列；点汉字会朗读
  MZ.ruby = function (text, pys, opt) {
    opt = opt || {};
    var wrap = h('span', { class: 'rl' + (opt.cls ? ' ' + opt.cls : '') });
    var last = null, open = [];
    for (var i = 0; i < text.length; i++) {
      var c = text[i], p = pys ? pys[i] : '';
      if (MZ.isCJK(c)) {
        (function (c) {
          var blank = opt.blank && opt.blank(i, c);
          var el = h('span', { class: 'pc' + (blank ? ' blank' : ''), data: { c: c } },
            h('i', null, blank ? '' : (p || '')),
            h('b', null, blank ? '＿' : c));
          if (opt.tap !== false && !blank) {
            el.addEventListener('click', function (ev) {
              ev.stopPropagation();
              el.classList.add('hit'); setTimeout(function () { el.classList.remove('hit'); }, 400);
              MZ.speakChar(c);
            });
          }
          // 每个字（连同挨着它的标点）是一个不拆开的小单元：标点不会单独跑到行首
          last = h('span', { class: 'pu' }, open, el);
          open = [];
          wrap.appendChild(last);
        })(c);
      } else {
        var pp = h('span', { class: 'pp' }, c);
        if ('“‘（《〈【'.indexOf(c) >= 0) open.push(pp);
        else if (last) last.appendChild(pp);
        else wrap.appendChild(pp);
      }
    }
    open.forEach(function (x) { wrap.appendChild(x); });
    return wrap;
  };

  /* ---------- 拼音声调工具（出题用） ---------- */
  var TT = { a: 'āáǎà', o: 'ōóǒò', e: 'ēéěè', i: 'īíǐì', u: 'ūúǔù', 'ü': 'ǖǘǚǜ' };
  MZ.parsePy = function (py) {
    for (var i = 0; i < py.length; i++) {
      for (var v in TT) {
        var idx = TT[v].indexOf(py[i]);
        if (idx >= 0) return { plain: py.slice(0, i) + v + py.slice(i + 1), tone: idx + 1 };
      }
    }
    return { plain: py, tone: 0 };
  };
  MZ.setTone = function (plain, tone) {
    if (!tone) return plain;
    var pos = -1;
    if (plain.indexOf('a') >= 0) pos = plain.indexOf('a');
    else if (plain.indexOf('o') >= 0) pos = plain.indexOf('o');
    else if (plain.indexOf('e') >= 0) pos = plain.indexOf('e');
    else if (plain.indexOf('iu') >= 0) pos = plain.indexOf('iu') + 1;
    else if (plain.indexOf('ui') >= 0) pos = plain.indexOf('ui') + 1;
    else { for (var i = plain.length - 1; i >= 0; i--) { if ('iuü'.indexOf(plain[i]) >= 0) { pos = i; break; } } }
    if (pos < 0) return plain;
    var v = plain[pos];
    return plain.slice(0, pos) + TT[v][tone - 1] + plain.slice(pos + 1);
  };
  MZ.toneOf = function (py) { return MZ.parsePy(py).tone; };

  /* ---------- 撒花 ---------- */
  MZ.confetti = function (n) {
    var cv = document.getElementById('confetti');
    if (!cv) return;
    var w = cv.width = window.innerWidth, hh = cv.height = window.innerHeight;
    var ctx = cv.getContext('2d');
    var colors = ['#FF7A59', '#FFC83D', '#2FB9A5', '#5DA9FF', '#9A7BEF', '#EF5B5B'];
    var ps = [], N = n || 90;
    for (var i = 0; i < N; i++) ps.push({ x: w / 2 + (Math.random() - 0.5) * w * 0.3, y: hh * 0.55, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 6,
      r: 4 + Math.random() * 6, c: colors[i % colors.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, sq: Math.random() < 0.5 });
    var t0 = performance.now();
    (function frame(t) {
      var dt = t - t0;
      ctx.clearRect(0, 0, w, hh);
      ps.forEach(function (p) {
        p.vy += 0.42; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vx *= 0.995;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
        if (p.sq) ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); else { ctx.beginPath(); ctx.arc(0, 0, p.r / 1.6, 0, 6.3); ctx.fill(); }
        ctx.restore();
      });
      if (dt < 1900) requestAnimationFrame(frame); else ctx.clearRect(0, 0, w, hh);
    })(t0);
  };

  /* ---------- 成就 ---------- */
  var ALL = D.order.length;
  function nLearned(s) { return S.count(s.learned); }
  function nPass(s) { return Object.keys(s.levels).filter(function (k) { return s.levels[k].stars >= 1; }).length; }
  function n3(s) { return Object.keys(s.levels).filter(function (k) { return s.levels[k].stars >= 3; }).length; }
  function golds(s) { var n = 0; for (var c in s.rev) if (s.learned[c] && s.rev[c].b >= 4) n++; return n; }
  function poems(s) { return D.passages.filter(function (p) { return p.kind === '古诗' && s.reads[p.id]; }).length; }
  function bookDone(s) { return D.books.filter(function (b) { return b.groups.every(function (g) { return D.groups[g].chars.every(function (c) { return s.learned[c]; }); }); }).length; }
  function nPlays(s) { var n = 0; for (var k in s.plays) n += s.plays[k]; return n; }
  function nOwn(s) { return S.count(s.own); }
  function A(id, name, desc, glyph, color, val, goal) {
    return { id: id, name: name, desc: desc, glyph: glyph, color: color,
      test: function (s) { return val(s) >= goal; }, prog: function (s) { return [val(s), goal]; } };
  }
  var cLearn = function (s) { return nLearned(s); };
  MZ.ACH = [
    A('c1', '初识汉字', '学会 1 个字', '字', '#FF7A59', cLearn, 1),
    A('c10', '十字小达人', '学会 10 个字', '十', '#FF7A59', cLearn, 10),
    A('c50', '五十字小能手', '学会 50 个字', '五', '#FF7A59', cLearn, 50),
    A('c100', '百字小博士', '学会 100 个字', '百', '#E85F3E', cLearn, 100),
    A('c300', '三百字小学者', '学会 300 个字', '学', '#E85F3E', cLearn, 300),
    A('c500', '五百字小状元', '学会 500 个字', '元', '#D8553A', cLearn, 500),
    A('call', '识字大王', '学会全部 ' + ALL + ' 个字', '王', '#D8553A', cLearn, ALL),
    A('bk1', '集齐一册', '一册里的字全部学会', '册', '#E85F3E', bookDone, 1),
    A('w20', '小小书法家', '完成 20 次描红', '笔', '#9A7BEF', function (s) { return s.wrote; }, 20),
    A('w100', '描红高手', '完成 100 次描红', '墨', '#7B5CD6', function (s) { return s.wrote; }, 100),
    A('wk1', '叫醒第一个', '叫醒 1 个字宝宝', '醒', '#5DA9FF', function (s) { return s.wakeCards; }, 1),
    A('wk30', '早起小闹钟', '叫醒 30 个字宝宝', '钟', '#3A86E0', function (s) { return s.wakeCards; }, 30),
    A('wk150', '字宝宝守护者', '叫醒 150 个字宝宝', '护', '#2F78CE', function (s) { return s.wakeCards; }, 150),
    A('cure5', '迷糊终结者', '帮 5 个迷糊字宝恢复清醒', '清', '#2FB9A5', function (s) { return s.cured; }, 5),
    A('gold10', '金牌小记忆', '10 个字达到“牢记”', '金', '#E8A90C', golds, 10),
    A('gold100', '记忆大师', '100 个字达到“牢记”', '牌', '#E8A90C', golds, 100),
    A('g1', '第一局', '玩 1 局小游戏', '玩', '#FF7A59', nPlays, 1),
    A('g10', '游戏小能手', '玩 10 局小游戏', '乐', '#FF7A59', nPlays, 10),
    A('g50', '游戏大王', '玩 50 局小游戏', '游', '#E85F3E', nPlays, 50),
    A('cb10', '连击达人', '小游戏里连续答对 10 次', '连', '#EF5B5B', function (s) { return s.combo; }, 10),
    A('rec3', '破纪录', '刷新 3 次游戏纪录', '破', '#EF5B5B', function (s) { return s.recs; }, 3),
    A('dk1', '听写初体验', '完成 1 次听写', '听', '#9A7BEF', function (s) { return s.dict; }, 1),
    A('dk10', '听写小达人', '完成 10 次听写', '写', '#7B5CD6', function (s) { return s.dict; }, 10),
    A('lv1', '初次闯关', '通过任意 1 个关卡', '闯', '#2FB9A5', nPass, 1),
    A('lv5', '闯关能手', '通过 5 个关卡', '关', '#2FB9A5', nPass, 5),
    A('lvall', '闯关大师', '通过 15 个关卡', '师', '#1F9A88', nPass, 15),
    A('lv30', '闯关传奇', '通过 30 个关卡', '传', '#17887A', nPass, 30),
    A('s3', '三星高手', '5 个关卡拿到三颗星', '星', '#FFC83D', n3, 5),
    A('s3b', '三星大师', '15 个关卡拿到三颗星', '耀', '#E8A90C', n3, 15),
    A('py', '拼音小达人', '通过“拼音岛”', '拼', '#5DA9FF', function (s) { return s.levels[13] && s.levels[13].stars >= 1 ? 1 : 0; }, 1),
    A('rad', '偏旁小侦探', '通过“偏旁岛”', '旁', '#5DA9FF', function (s) { return s.levels[14] && s.levels[14].stars >= 1 ? 1 : 0; }, 1),
    A('id10', '成语小达人', '读了 10 个成语故事', '成', '#9A7BEF', function (s) { return S.count(s.idioms); }, 10),
    A('id50', '成语小行家', '读了 50 个成语故事', '语', '#7B5CD6', function (s) { return S.count(s.idioms); }, 50),
    A('idall', '成语小博士', '读完全部 ' + D.idioms.length + ' 个成语故事', '博', '#7B5CD6', function (s) { return S.count(s.idioms); }, D.idioms.length),
    A('rd3', '阅读小书虫', '读完 3 篇短文并答题', '读', '#9A7BEF', function (s) { return S.count(s.reads); }, 3),
    A('poem5', '小诗人', '读完 5 首古诗', '诗', '#9A7BEF', poems, 5),
    A('rdall', '阅读大王', '读完全部 ' + D.passages.length + ' 篇', '书', '#7B5CD6', function (s) { return S.count(s.reads); }, D.passages.length),
    A('ad1', '小冒险家', '打开 1 个冒险宝箱', '险', '#F5B81E', function (s) { return s.chests; }, 1),
    A('ad7', '宝箱收集家', '打开 7 个冒险宝箱', '宝', '#E8A90C', function (s) { return s.chests; }, 7),
    A('sh1', '换新装', '给墨墨买 1 件装扮', '帽', '#FF6FA5', nOwn, 1),
    A('sh6', '时尚达人', '给墨墨买 6 件装扮', '衣', '#E04D86', nOwn, 6),
    A('st50', '星星收集者', '收集 50 颗星星', '★', '#FFC83D', function (s) { return s.stars; }, 50),
    A('st150', '星星大富翁', '收集 150 颗星星', '★', '#E8A90C', function (s) { return s.stars; }, 150),
    A('st500', '星星银河', '收集 500 颗星星', '★', '#D68F00', function (s) { return s.stars; }, 500),
    A('d3', '三天打卡', '连续学习 3 天', '三', '#EF5B5B', function () { return S.streak(); }, 3),
    A('d7', '七天打卡', '连续学习 7 天', '七', '#EF5B5B', function () { return S.streak(); }, 7),
    A('d14', '两周打卡', '连续学习 14 天', '周', '#D94545', function () { return S.streak(); }, 14),
    A('d30', '三十天打卡', '连续学习 30 天', '月', '#C03030', function () { return S.streak(); }, 30),
  ];
  MZ.checkAch = function () {
    var s = S.get(), got = [];
    MZ.ACH.forEach(function (a) { if (!s.ach[a.id] && a.test(s)) { s.ach[a.id] = Date.now(); got.push(a); } });
    if (got.length) {
      S.save();
      var a = got[0];
      setTimeout(function () {
        MZ.sfx.star();
        MZ.toast('获得成就：' + a.name + (got.length > 1 ? '（还有 ' + (got.length - 1) + ' 个）' : ''), { ach: MZ.medal(a, true), long: true });
      }, 700);
    }
    return got;
  };
  MZ.medal = function (a, mini) {
    var s = S.get(), on = !!s.ach[a.id];
    return h('span', { class: 'medal' + (on ? ' on' : '') + (mini ? ' mini' : ''), style: on ? { '--mc': a.color } : null },
      h('span', { class: 'ring' }, h('b', null, a.glyph)));
  };

  /* ---------- 星星 / 打卡 的统一入口 ---------- */
  MZ.afterActivity = function () { S.touchDay(); if (MZ.adv) MZ.adv.check(); MZ.checkAch(); if (MZ.refreshChrome) MZ.refreshChrome(); };
})();
