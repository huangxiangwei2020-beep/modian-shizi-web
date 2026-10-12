/* 墨点识字 · 闯关：关卡定义与出题 */
(function () {
  'use strict';
  var MZ = window.MZ, D = MZ.D, S = MZ.S;
  var shuffle = MZ.shuffle, pick = MZ.pick;

  /* ---------- 关卡 ---------- */
  var G = function (names) {
    return names.map(function (n) {
      for (var i = 0; i < D.groups.length; i++) if (D.groups[i].name === n) return i;
      throw new Error('找不到分组 ' + n);
    });
  };
  MZ.LEVELS = [
    { id: 1, name: '数字岛', kind: 'chars', groups: G(['数字']), color: 'coral' },
    { id: 2, name: '山水岛', kind: 'chars', groups: G(['自然']), color: 'teal' },
    { id: 3, name: '身体乐园', kind: 'chars', groups: G(['身体']), color: 'sky' },
    { id: 4, name: '一家人', kind: 'chars', groups: G(['家人']), color: 'sun' },
    { id: 5, name: '动物园', kind: 'chars', groups: G(['动物']), color: 'grape' },
    { id: 6, name: '花果园', kind: 'chars', groups: G(['植物']), color: 'teal' },
    { id: 7, name: '彩虹桥', kind: 'chars', groups: G(['颜色', '方位', '方向']), color: 'coral' },
    { id: 8, name: '四季谷', kind: 'chars', groups: G(['时间', '天气']), color: 'sky' },
    { id: 9, name: '动作村', kind: 'chars', groups: G(['动作']), color: 'sun' },
    { id: 10, name: '小学堂', kind: 'chars', groups: G(['学校']), color: 'grape' },
    { id: 11, name: '反义屋', kind: 'chars', groups: G(['形容', '物品']), color: 'teal' },
    { id: 12, name: '常用字塔', kind: 'chars', groups: G(['我你他', '常用字']), color: 'coral' },
    { id: 13, name: '拼音岛', kind: 'pinyin', color: 'sky', special: true },
    { id: 14, name: '偏旁岛', kind: 'radical', color: 'sun', special: true },
    { id: 15, name: '成语山', kind: 'idiom', color: 'grape', special: true },
  ];
  MZ.levelUnlocked = function (L) {
    var s = S.get();
    function passed(id) { return s.levels[id] && s.levels[id].stars >= 1; }
    if (L.id === 1) return true;
    if (L.special) return !!passed(4);
    return !!passed(L.id - 1);
  };
  MZ.starsFor = function (score, total) {
    var r = score / total;
    return r >= 0.85 ? 3 : r >= 0.6 ? 2 : r >= 0.35 ? 1 : 0;
  };
  MZ.LEVEL_Q = 8;

  /* ---------- 选项工具 ---------- */
  function mc(correct, wrongs) {
    var all = shuffle([correct].concat(wrongs.slice(0, 3)));
    return { opts: all, ans: all.indexOf(correct) };
  }
  function uniqueFirst(list, n, bad) {
    var out = [], seen = {};
    (bad || []).forEach(function (b) { seen[b] = 1; });
    for (var i = 0; i < list.length && out.length < n; i++) { if (!seen[list[i]]) { seen[list[i]] = 1; out.push(list[i]); } }
    return out;
  }
  function allChars() { return D.order; }
  // 词性大类：补全句子时，错误选项取自不同词性的字，避免“换个字也说得通”
  var POS = { '数字': 'num', '自然': 'n', '身体': 'n', '家人': 'n', '动物': 'n', '植物': 'n', '学校': 'n', '物品': 'n', '天气': 'n',
              '颜色': 'adj', '形容': 'adj', '方位': 'loc', '方向': 'loc', '时间': 'loc', '动作': 'v', '我你他': 'pron', '常用字': 'fn' };
  var POSOF = {};
  D.groups.forEach(function (g) { g.chars.forEach(function (c) { POSOF[c] = POS[g.name] || g.name; }); });
  // bad：构建时算出来的“换成它也成词/成句”的字，一律不出现在选项里
  function charWrongs(c, pool, n, bad, diffPos) {
    var no = {}; no[c] = 1;
    (bad || '').split('').forEach(function (x) { no[x] = 1; });
    function okc(x) { return !no[x] && (!diffPos || POSOF[x] !== POSOF[c]); }
    var cand = shuffle(pool.filter(okc));
    if (cand.length < n) cand = cand.concat(shuffle(allChars().filter(function (x) { return okc(x) && cand.indexOf(x) < 0; })));
    if (cand.length < n) cand = cand.concat(shuffle(allChars().filter(function (x) { return !no[x] && cand.indexOf(x) < 0; })));
    return cand.slice(0, n);
  }
  function pyWrongs(py, c, pool) {
    var pp = MZ.parsePy(py), res = [];
    if (pp.tone) {
      shuffle([1, 2, 3, 4].filter(function (t) { return t !== pp.tone; })).slice(0, 2).forEach(function (t) { res.push(MZ.setTone(pp.plain, t)); });
    }
    shuffle(pool.filter(function (x) { return x !== c; })).forEach(function (x) { res.push(D.chars[x].p); });
    shuffle(allChars()).forEach(function (x) { res.push(D.chars[x].p); });
    return uniqueFirst(res, 3, [py]);
  }
  var TONE_NAMES = ['', '一声', '二声', '三声', '四声'];

  /* ---------- 汉字题 ---------- */
  function qListen(c, pool) {
    var m = mc(c, charWrongs(c, pool, 3)), ch = D.chars[c];
    return { kind: 'listen', prompt: '听一听，这是哪个字？', speak: MZ.say(c), autoSpeak: true, optKind: 'char', opts: m.opts, ans: m.ans,
             explain: '是“' + c + '”，读 ' + ch.p + '。比如：' + ch.words.join('、') + '。', after: c };
  }
  function qPinyin(c, pool) {
    var ch = D.chars[c], m = mc(ch.p, pyWrongs(ch.p, c, pool));
    return { kind: 'pinyin', prompt: '这个字怎么读？', big: { text: c, kai: true }, speak: MZ.say(c), optKind: 'py', opts: m.opts, ans: m.ans,
             explain: '“' + c + '”读 ' + ch.p + '。比如：' + ch.words.join('、') + '。', after: c };
  }
  function qWordFill(c, pool) {
    var ch = D.chars[c], w = pick(ch.words), idx = w.indexOf(c);
    var wi = ch.words.indexOf(w);
    var m = mc(c, charWrongs(c, pool, 3, ch.wb && ch.wb[wi]));
    return { kind: 'wordfill', prompt: '补全词语', big: { text: w.slice(0, idx) + '＿' + w.slice(idx + 1), kai: true }, optKind: 'char', opts: m.opts, ans: m.ans,
             explain: '“' + w + '”，读 ' + ch.wp[wi] + '。', after: w };
  }
  function qSentFill(c, pool) {
    var ch = D.chars[c], idx = ch.sent.indexOf(c);
    var m = mc(c, charWrongs(c, pool, 3, ch.sb, true));
    return { kind: 'sentfill', prompt: '补全句子', ruby: { text: ch.sent, py: ch.sp, blank: idx }, optKind: 'char', opts: m.opts, ans: m.ans,
             explain: ch.sent, after: ch.sent };
  }
  function qStrokes(c) {
    var n = D.chars[c].n;
    var wr = uniqueFirst(shuffle([n - 2, n - 1, n + 1, n + 2, n + 3].filter(function (x) { return x >= 1; })), 3, [n]);
    var m = mc(n, wr);
    return { kind: 'strokes', prompt: '这个字一共有几画？', big: { text: c, kai: true }, optKind: 'text', opts: m.opts.map(function (x) { return x + ' 画'; }), ans: m.ans,
             explain: '“' + c + '”一共 ' + n + ' 画。', after: c };
  }
  function qTone(c) {
    var ch = D.chars[c], t = MZ.toneOf(ch.p);
    var m = mc(t, [1, 2, 3, 4].filter(function (x) { return x !== t; }));
    return { kind: 'tone', prompt: '“' + c + '”是第几声？', big: { text: c, kai: true }, speak: MZ.say(c), optKind: 'text',
             opts: m.opts.map(function (x) { return TONE_NAMES[x]; }), ans: m.ans, explain: '“' + c + '”读 ' + ch.p + '，是' + TONE_NAMES[t] + '。', after: c };
  }
  function qRadical(c) {
    var ch = D.chars[c], ri = ch.r, R = D.radicals;
    var others = shuffle(R.map(function (_, i) { return i; }).filter(function (i) { return i !== ri; })).slice(0, 3);
    var all = shuffle([ri].concat(others));
    return { kind: 'radical', prompt: '“' + c + '”的偏旁是？', big: { text: c, kai: true }, optKind: 'rad',
             opts: all.map(function (i) { return { f: R[i].f, n: R[i].n }; }), ans: all.indexOf(ri),
             explain: '“' + c + '”的偏旁是“' + R[ri].f + '”（' + R[ri].n + '），' + R[ri].m + '。', after: c };
  }
  function qRadMeaning(ri) {
    var R = D.radicals[ri];
    var wr = uniqueFirst(shuffle(D.radicals.map(function (r) { return r.m; })), 3, [R.m]);
    var m = mc(R.m, wr);
    return { kind: 'radmean', prompt: '带“' + R.f + '”（' + R.n + '）的字，常和什么有关？', optKind: 'text', opts: m.opts, ans: m.ans,
             explain: '“' + R.f + '”叫' + R.n + '，' + R.m + '。' + R.x };
  }
  function qRadName(ri) {
    var R = D.radicals[ri];
    var wr = uniqueFirst(shuffle(D.radicals.map(function (r) { return r.n; })), 3, [R.n]);
    var m = mc(R.n, wr);
    return { kind: 'radname', prompt: '这个偏旁叫什么名字？', big: { text: R.f, kai: true }, optKind: 'text', opts: m.opts, ans: m.ans,
             explain: '“' + R.f + '”叫' + R.n + '，' + R.m + '。' };
  }

  /* ---------- 拼音题 ---------- */
  var FIN = [];
  D.pinyin.finals.forEach(function (g) { g.items.forEach(function (it) { FIN.push(it); }); });
  function qInitial(it) {
    var wr = uniqueFirst(shuffle(D.pinyin.initials.map(function (x) { return x.s; })), 3, [it.s]);
    var m = mc(it.s, wr);
    return { kind: 'ini', prompt: '听一听，“' + it.c + '”的声母是哪一个？', big: { text: it.c, kai: true }, speak: it.c, autoSpeak: true, optKind: 'py', opts: m.opts, ans: m.ans,
             explain: '“' + it.c + '”读 ' + it.p + '，声母是 ' + it.s + '。', after: it.c };
  }
  function qFinal(it) {
    var wr = uniqueFirst(shuffle(FIN.map(function (x) { return x.s; })), 3, [it.s]);
    var m = mc(it.s, wr);
    return { kind: 'fin', prompt: '“' + it.c + '”的韵母是哪一个？', big: { text: it.c, kai: true }, speak: it.c, optKind: 'py', opts: m.opts, ans: m.ans,
             explain: '“' + it.c + '”读 ' + it.p + '，韵母是 ' + it.s + '。', after: it.c };
  }
  function qSpell(card) {
    var same = D.pinyin.spell.filter(function (x) { return x.s !== card.s && (x.i === card.i || x.f === card.f); }).map(function (x) { return x.s; });
    var pp = MZ.parsePy(card.s), vari = shuffle([1, 2, 3, 4].filter(function (t) { return t !== pp.tone; })).map(function (t) { return MZ.setTone(pp.plain, t); });
    var rnd = shuffle(D.pinyin.spell.map(function (x) { return x.s; }));
    var wr = uniqueFirst(shuffle(same).slice(0, 1).concat(vari.slice(0, 1), rnd), 3, [card.s]);
    var m = mc(card.s, wr);
    return { kind: 'spell', prompt: '拼一拼，读出来是哪个音节？', big: { text: card.i + ' + ' + card.f, py: true }, optKind: 'py', opts: m.opts, ans: m.ans,
             explain: card.i + ' + ' + card.f + ' → ' + card.s + '，就是“' + card.c + '”。', after: card.c };
  }
  function qToneP(card) {
    var t = MZ.toneOf(card.s);
    var m = mc(t, [1, 2, 3, 4].filter(function (x) { return x !== t; }));
    return { kind: 'tonep', prompt: '听一听，“' + card.c + '”是第几声？', big: { text: card.c, kai: true }, speak: card.c, autoSpeak: true, optKind: 'text',
             opts: m.opts.map(function (x) { return TONE_NAMES[x]; }), ans: m.ans, explain: '“' + card.c + '”读 ' + card.s + '，是' + TONE_NAMES[t] + '。', after: card.c };
  }

  /* ---------- 成语题 ---------- */
  function qIdiomBlank(it) {
    var pos = Math.floor(Math.random() * 4), c = it.t[pos];
    var pool = {};
    D.idioms.forEach(function (x) { if (x !== it) x.t.split('').forEach(function (ch) { pool[ch] = 1; }); });
    var wr = uniqueFirst(shuffle(Object.keys(pool)), 3, [c].concat(it.t.split('')));
    var m = mc(c, wr);
    return { kind: 'idblank', prompt: '补全成语', ruby: { text: it.t, py: it.tp, blank: pos }, optKind: 'char', opts: m.opts, ans: m.ans,
             explain: it.t + '：' + it.m, after: it.t };
  }
  function qIdiomMean(it) {
    var wr = uniqueFirst(shuffle(D.idioms.filter(function (x) { return x !== it; }).map(function (x) { return x.m; })), 3, [it.m]);
    var m = mc(it.m, wr);
    return { kind: 'idmean', prompt: '“' + it.t + '”是什么意思？', big: { text: it.t, kai: true, py: it.tp }, speak: it.t, optKind: 'text', opts: m.opts, ans: m.ans,
             explain: it.t + '：' + it.m, after: it.t };
  }

  /* ---------- 组一关 ---------- */
  MZ.buildLevel = function (L) {
    var N = MZ.LEVEL_Q, qs = [], i;
    if (L.kind === 'chars') {
      var pool = [];
      L.groups.forEach(function (g) { pool = pool.concat(D.groups[g].chars); });
      var picks = shuffle(pool);
      while (picks.length < N) picks = picks.concat(shuffle(pool));
      picks = picks.slice(0, N);
      var types = shuffle(['listen', 'pinyin', 'wordfill', 'sentfill', 'listen', 'pinyin', 'wordfill', pick(['strokes', 'tone', 'radical', 'sentfill'])]);
      // 第一题用最简单的两种
      var fi = types.findIndex(function (t) { return t === 'listen' || t === 'pinyin'; });
      if (fi > 0) { var tmp = types[0]; types[0] = types[fi]; types[fi] = tmp; }
      for (i = 0; i < N; i++) {
        var c = picks[i], t = types[i], ch = D.chars[c];
        if (t === 'radical' && ch.r == null) t = 'pinyin';
        if (t === 'tone' && MZ.toneOf(ch.p) === 0) t = 'pinyin';
        qs.push({
          listen: qListen, pinyin: qPinyin, wordfill: qWordFill, sentfill: qSentFill, strokes: qStrokes, tone: qTone, radical: qRadical,
        }[t](c, pool));
      }
    } else if (L.kind === 'pinyin') {
      var ini = shuffle(D.pinyin.initials).slice(0, 3), fin = shuffle(FIN).slice(0, 2), sp = shuffle(D.pinyin.spell);
      qs = [qInitial(ini[0]), qFinal(fin[0]), qSpell(sp[0]), qInitial(ini[1]), qSpell(sp[1]), qFinal(fin[1]), qToneP(sp[2]), qInitial(ini[2])];
    } else if (L.kind === 'radical') {
      var inset = D.order.filter(function (c) { return D.chars[c].r != null; });
      var cs = shuffle(inset).slice(0, 3), rs = shuffle(D.radicals.map(function (_, k) { return k; }));
      qs = [qRadical(cs[0]), qRadName(rs[0]), qRadMeaning(rs[1]), qRadical(cs[1]), qRadName(rs[2]), qRadMeaning(rs[3]), qRadical(cs[2]), qRadName(rs[4])];
    } else if (L.kind === 'idiom') {
      var its = shuffle(D.idioms);
      qs = [qIdiomBlank(its[0]), qIdiomMean(its[1]), qIdiomBlank(its[2]), qIdiomMean(its[3]), qIdiomBlank(its[4]), qIdiomMean(its[5]), qIdiomBlank(its[6]), qIdiomMean(its[7])];
    }
    return qs;
  };
  MZ.qIdiomBlank = qIdiomBlank;   // 成语详情页的“试一试”复用
})();
