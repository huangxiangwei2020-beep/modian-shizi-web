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
             days: [], ach: {}, set: { sound: true, pinyin: true, rate: 0.85 }, daily: { date: '', n: 0, done: false } };
  }
  function today() {
    var d = new Date();
    var m = d.getMonth() + 1, dd = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
  }
  MZ.today = today;
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

  /* ---------- 吉祥物“墨墨”（原创） ---------- */
  var gid = 0;
  MZ.mascot = function (mood, size) {
    mood = mood || 'happy';
    var id = 'mg' + (++gid);
    var mouth = {
      happy: '<path d="M49 107 Q60 120 71 107" stroke="#fff" stroke-width="3.4" stroke-linecap="round" fill="none"/>',
      cheer: '<path d="M47 104 Q60 128 73 104 Z" fill="#fff"/><path d="M53 114 Q60 120 67 114 Q60 110 53 114Z" fill="#FF7A59"/>',
      think: '<ellipse cx="60" cy="112" rx="5" ry="6" fill="#fff"/>',
      oops: '<path d="M51 115 Q60 106 69 115" stroke="#fff" stroke-width="3.4" stroke-linecap="round" fill="none"/>',
    }[mood] || '';
    var brow = mood === 'oops' ? '<path d="M35 77 L52 82 M85 77 L68 82" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' : '';
    var sparkle = mood === 'cheer' ? '<g fill="#FFC83D"><path d="M100 22 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M18 36 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/></g>' : '';
    var pupil = mood === 'think' ? ['50', '86', '82', '86'] : ['46', '93', '78', '93'];
    var s = size || 120;
    return h('span', { class: 'mascot m-' + mood, style: { width: (s / 17).toFixed(2) + 'rem', height: (s * 1.17 / 17).toFixed(2) + 'rem' }, html:
      '<svg viewBox="0 0 120 140" width="100%" height="100%" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A66B8"/><stop offset="1" stop-color="#2F2C5C"/></linearGradient></defs>' +
      '<ellipse cx="60" cy="136" rx="30" ry="4" fill="#000" opacity=".1"/>' +
      '<path d="M60 6 C60 6 14 62 14 92 C14 118 34 134 60 134 C86 134 106 118 106 92 C106 62 60 6 60 6Z" fill="url(#' + id + ')"/>' +
      '<path d="M60 6 C60 6 48 20 40 36 C54 24 60 6 60 6Z" fill="#fff" opacity=".22"/>' +
      '<ellipse cx="36" cy="82" rx="7" ry="14" fill="#fff" opacity=".18" transform="rotate(18 36 82)"/>' +
      '<g class="eyes"><circle cx="44" cy="92" r="10" fill="#fff"/><circle cx="76" cy="92" r="10" fill="#fff"/>' +
      '<circle cx="' + pupil[0] + '" cy="' + pupil[1] + '" r="5" fill="#1d1b3a"/><circle cx="' + pupil[2] + '" cy="' + pupil[3] + '" r="5" fill="#1d1b3a"/>' +
      '<circle cx="' + (+pupil[0] + 1.8) + '" cy="' + (+pupil[1] - 2) + '" r="1.6" fill="#fff"/><circle cx="' + (+pupil[2] + 1.8) + '" cy="' + (+pupil[3] - 2) + '" r="1.6" fill="#fff"/></g>' +
      brow +
      '<ellipse cx="29" cy="106" rx="7" ry="4.5" fill="#FF8F7A" opacity=".75"/><ellipse cx="91" cy="106" rx="7" ry="4.5" fill="#FF8F7A" opacity=".75"/>' +
      mouth + sparkle + '</svg>' });
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
  function nPass(s) { return Object.keys(s.levels).filter(function (k) { return s.levels[k].stars >= 1; }).length; }
  function n3(s) { return Object.keys(s.levels).filter(function (k) { return s.levels[k].stars >= 3; }).length; }
  MZ.ACH = [
    { id: 'c1', name: '初识汉字', desc: '学会 1 个字', glyph: '字', color: '#FF7A59', test: function (s) { return S.count(s.learned) >= 1; }, prog: function (s) { return [S.count(s.learned), 1]; } },
    { id: 'c10', name: '十字小达人', desc: '学会 10 个字', glyph: '十', color: '#FF7A59', test: function (s) { return S.count(s.learned) >= 10; }, prog: function (s) { return [S.count(s.learned), 10]; } },
    { id: 'c50', name: '五十字小能手', desc: '学会 50 个字', glyph: '五', color: '#FF7A59', test: function (s) { return S.count(s.learned) >= 50; }, prog: function (s) { return [S.count(s.learned), 50]; } },
    { id: 'c100', name: '百字小博士', desc: '学会 100 个字', glyph: '百', color: '#E85F3E', test: function (s) { return S.count(s.learned) >= 100; }, prog: function (s) { return [S.count(s.learned), 100]; } },
    { id: 'call', name: '识字大王', desc: '学会全部 ' + ALL + ' 个字', glyph: '王', color: '#E85F3E', test: function (s) { return S.count(s.learned) >= ALL; }, prog: function (s) { return [S.count(s.learned), ALL]; } },
    { id: 'w20', name: '小小书法家', desc: '完成 20 次描红', glyph: '笔', color: '#9A7BEF', test: function (s) { return s.wrote >= 20; }, prog: function (s) { return [s.wrote, 20]; } },
    { id: 'lv1', name: '初次闯关', desc: '通过任意 1 个关卡', glyph: '闯', color: '#2FB9A5', test: function (s) { return nPass(s) >= 1; }, prog: function (s) { return [nPass(s), 1]; } },
    { id: 'lv5', name: '闯关能手', desc: '通过 5 个关卡', glyph: '关', color: '#2FB9A5', test: function (s) { return nPass(s) >= 5; }, prog: function (s) { return [nPass(s), 5]; } },
    { id: 'lvall', name: '闯关大师', desc: '通过全部 15 个关卡', glyph: '师', color: '#1F9A88', test: function (s) { return nPass(s) >= 15; }, prog: function (s) { return [nPass(s), 15]; } },
    { id: 's3', name: '三星高手', desc: '5 个关卡拿到三颗星', glyph: '星', color: '#FFC83D', test: function (s) { return n3(s) >= 5; }, prog: function (s) { return [n3(s), 5]; } },
    { id: 'py', name: '拼音小达人', desc: '通过“拼音岛”', glyph: '拼', color: '#5DA9FF', test: function (s) { return s.levels[13] && s.levels[13].stars >= 1; }, prog: function (s) { return [(s.levels[13] && s.levels[13].stars >= 1) ? 1 : 0, 1]; } },
    { id: 'rad', name: '偏旁小侦探', desc: '通过“偏旁岛”', glyph: '旁', color: '#5DA9FF', test: function (s) { return s.levels[14] && s.levels[14].stars >= 1; }, prog: function (s) { return [(s.levels[14] && s.levels[14].stars >= 1) ? 1 : 0, 1]; } },
    { id: 'id10', name: '成语小达人', desc: '读了 10 个成语故事', glyph: '成', color: '#9A7BEF', test: function (s) { return S.count(s.idioms) >= 10; }, prog: function (s) { return [S.count(s.idioms), 10]; } },
    { id: 'idall', name: '成语小博士', desc: '读完全部 ' + D.idioms.length + ' 个成语故事', glyph: '博', color: '#7B5CD6', test: function (s) { return S.count(s.idioms) >= D.idioms.length; }, prog: function (s) { return [S.count(s.idioms), D.idioms.length]; } },
    { id: 'rd3', name: '阅读小书虫', desc: '读完 3 篇短文并答题', glyph: '读', color: '#9A7BEF', test: function (s) { return S.count(s.reads) >= 3; }, prog: function (s) { return [S.count(s.reads), 3]; } },
    { id: 'rdall', name: '阅读大王', desc: '读完全部 ' + D.passages.length + ' 篇', glyph: '书', color: '#7B5CD6', test: function (s) { return S.count(s.reads) >= D.passages.length; }, prog: function (s) { return [S.count(s.reads), D.passages.length]; } },
    { id: 'st50', name: '星星收集者', desc: '收集 50 颗星星', glyph: '★', color: '#FFC83D', test: function (s) { return s.stars >= 50; }, prog: function (s) { return [s.stars, 50]; } },
    { id: 'st150', name: '星星大富翁', desc: '收集 150 颗星星', glyph: '★', color: '#E8A90C', test: function (s) { return s.stars >= 150; }, prog: function (s) { return [s.stars, 150]; } },
    { id: 'd3', name: '三天打卡', desc: '连续学习 3 天', glyph: '三', color: '#EF5B5B', test: function () { return S.streak() >= 3; }, prog: function () { return [S.streak(), 3]; } },
    { id: 'd7', name: '七天打卡', desc: '连续学习 7 天', glyph: '七', color: '#EF5B5B', test: function () { return S.streak() >= 7; }, prog: function () { return [S.streak(), 7]; } },
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
  MZ.afterActivity = function () { S.touchDay(); MZ.checkAch(); if (MZ.refreshChrome) MZ.refreshChrome(); };
})();
