/* 墨点识字 · 闯关：关卡定义与出题（小游戏和“叫醒字宝宝”也复用这里的题型） */
(function () {
  'use strict';
  var MZ = window.MZ, D = MZ.D, S = MZ.S;
  var shuffle = MZ.shuffle, pick = MZ.pick;

  /* ---------- 关卡 ----------
     book：0~6 是各册的识字关；'sp' 是特别关。prev：要先通过的那一关（没有就是一开始就能玩）。
     前 15 关的编号、名字和内容都和第一版一样，老存档里的星星不会乱。 */
  var G = function (names) {
    var out = [];
    names.forEach(function (n) {
      var found = false;
      for (var i = 0; i < D.groups.length; i++) if (D.groups[i].name === n) { out.push(i); found = true; break; }
      if (!found && window.console) console.log('[墨点识字] 找不到分组 ' + n);
    });
    return out;
  };
  var COLORS = ['coral', 'teal', 'sky', 'sun', 'grape'];
  var LV = [];
  function add(id, name, kind, o) {
    var L = { id: id, name: name, kind: kind, color: COLORS[(id - 1) % 5] };
    for (var k in o) L[k] = o[k];
    LV.push(L);
  }
  // 第 1 册（和第一版完全一致）
  [['数字岛', ['数字'], 'coral'], ['山水岛', ['自然'], 'teal'], ['身体乐园', ['身体'], 'sky'], ['一家人', ['家人'], 'sun'],
   ['动物园', ['动物'], 'grape'], ['花果园', ['植物'], 'teal'], ['彩虹桥', ['颜色', '方位', '方向'], 'coral'], ['四季谷', ['时间', '天气'], 'sky'],
   ['动作村', ['动作'], 'sun'], ['小学堂', ['学校'], 'grape'], ['反义屋', ['形容', '物品'], 'teal'], ['常用字塔', ['我你他', '常用字'], 'coral']
  ].forEach(function (a, i) {
    add(i + 1, a[0], 'chars', { groups: G(a[1]), color: a[2], book: 0, prev: i === 0 ? 0 : i });
  });
  add(13, '拼音岛', 'pinyin', { color: 'sky', special: true, book: 'sp', need: 4 });
  add(14, '偏旁岛', 'radical', { color: 'sun', special: true, book: 'sp', need: 4 });
  add(15, '成语山', 'idiom', { color: 'grape', special: true, book: 'sp', need: 4 });
  // 第 2~7 册
  var NEXT = [
    [1, ['小身板岛', ['身体二']], ['亲友村', ['亲朋好友']], ['小房子', ['家里的东西']], ['美食街', ['好吃的', '水果蔬菜']], ['衣帽间', ['穿戴', '玩具游戏']], ['数数乐园', ['数量词', '数目大小', '时间二']]],
    [2, ['江河湖海', ['水和大地', '山川泉池']], ['风雨天', ['天气二', '太空']], ['大森林', ['草木', '田野乡村']], ['动物王国', ['走兽飞禽', '动物身体']], ['小虫海滩', ['小虫海鲜']], ['宝石谷', ['宝石金属', '位置', '声音光影']]],
    [3, ['巧手屋', ['手的动作']], ['快脚村', ['脚的动作', '来来往往']], ['五官镇', ['嘴巴的事', '眼睛耳朵']], ['勤快村', ['做事情']], ['日子屋', ['吃喝睡', '生活', '会不会']], ['想一想', ['心里想', '练习比赛']]],
    [4, ['大课堂', ['教室', '课本里']], ['学习角', ['学习', '音乐']], ['职业街', ['各行各业', '城市']], ['大路口', ['路上', '其他']], ['节日彩虹', ['节日', '我们的国家', '颜色二']]],
    [5, ['反义乐园', ['反义词乐园']], ['心情谷', ['心情性格']], ['问号街', ['问一问', '状态']], ['小帮手岛', ['小帮手']], ['多少桥', ['多少有关', '时间副词', '常用小字']]],
    [6, ['小物件仓库', ['小物件']], ['数学教室', ['数学小课堂', '手工美工']], ['趣味岛', ['有趣的事', '好品质']], ['字海一', ['常用字·一', '常用字·二']], ['字海二', ['常用字·三', '常用字·四']],
        ['字海三', ['常用字·五', '常用字·六']], ['字海四', ['常用字·七', '常用字·八']], ['字海五', ['常用字·九', '常用字·十', '常用字·十一']]],
  ];
  var nid = 16;
  NEXT.forEach(function (row) {
    for (var i = 1; i < row.length; i++) {
      add(nid, row[i][0], 'chars', { groups: G(row[i][1]), book: row[0], prev: i === 1 ? 0 : nid - 1 });
      nid++;
    }
  });
  add(nid++, '古诗岛', 'poem', { color: 'grape', special: true, book: 'sp', need: 4 });
  add(nid++, '总复习', 'mix', { color: 'teal', special: true, book: 'sp', minLearned: 10 });
  MZ.LEVELS = LV;
  MZ.levelById = function (id) { for (var i = 0; i < LV.length; i++) if (LV[i].id === id) return LV[i]; return null; };
  MZ.levelHint = function (L) {
    if (L.minLearned) return '先学会 ' + L.minLearned + ' 个字，再来总复习吧！';
    if (L.need) return '先通过“' + MZ.levelById(L.need).name + '”这一关，就能来这里啦！';
    return '先通过前一关，才能来这里哦！';
  };
  MZ.levelUnlocked = function (L) {
    var s = S.get();
    function passed(id) { return !!(s.levels[id] && s.levels[id].stars >= 1); }
    if (L.minLearned) return S.learnedCount() >= L.minLearned;
    if (L.need) return passed(L.need);
    if (L.prev) return passed(L.prev);
    return true;
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
  MZ.mc = mc;
  function uniqueFirst(list, n, bad) {
    var out = [], seen = {};
    (bad || []).forEach(function (b) { seen[b] = 1; });
    for (var i = 0; i < list.length && out.length < n; i++) { if (!seen[list[i]]) { seen[list[i]] = 1; out.push(list[i]); } }
    return out;
  }
  function allChars() { return D.order; }
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
  MZ.TONE_NAMES = TONE_NAMES;

  /* ---------- 汉字题 ----------
     c：这道题考的是哪个字（答完后用来更新“字宝宝”的复习记录）
     o：{ sim: 是否放几个“长得像”的字当干扰, simN: 最多几个 } */
  function qListen(c, pool, o) {
    o = o || {};
    var wr = MZ.distract(c, 3, { pool: pool, diffSound: true, sim: o.sim !== undefined ? o.sim : Math.random() < 0.5, simN: o.simN || 1 });
    var m = mc(c, wr), ch = D.chars[c];
    return { kind: 'listen', c: c, prompt: '听一听，这是哪个字？', speak: MZ.say(c), autoSpeak: true, optKind: 'char', opts: m.opts, ans: m.ans,
             explain: '是“' + c + '”，读 ' + ch.p + '。比如：' + ch.words.join('、') + '。', after: c };
  }
  function qPinyin(c, pool) {
    var ch = D.chars[c], m = mc(ch.p, pyWrongs(ch.p, c, pool));
    return { kind: 'pinyin', c: c, prompt: '这个字怎么读？', big: { text: c, kai: true }, speak: MZ.say(c), optKind: 'py', opts: m.opts, ans: m.ans,
             explain: '“' + c + '”读 ' + ch.p + '。比如：' + ch.words.join('、') + '。', after: c };
  }
  function qWordFill(c, pool, o) {
    o = o || {};
    var ch = D.chars[c], w = pick(ch.words), idx = w.indexOf(c);
    var wi = ch.words.indexOf(w);
    var m = mc(c, MZ.distract(c, 3, { pool: pool, bad: ch.wb && ch.wb[wi], sim: !!o.sim, simN: o.simN || 1 }));
    return { kind: 'wordfill', c: c, prompt: '补全词语', big: { text: w.slice(0, idx) + '＿' + w.slice(idx + 1), kai: true }, optKind: 'char', opts: m.opts, ans: m.ans,
             explain: '“' + w + '”，读 ' + ch.wp[wi] + '。', after: w, word: w };
  }
  function qSentFill(c, pool, o) {
    o = o || {};
    var ch = D.chars[c], idx = ch.sent.indexOf(c);
    var m = mc(c, MZ.distract(c, 3, { pool: pool, bad: ch.sb, diffPos: true, sim: !!o.sim, simN: o.simN || 1 }));
    return { kind: 'sentfill', c: c, prompt: '补全句子', ruby: { text: ch.sent, py: ch.sp, blank: idx }, optKind: 'char', opts: m.opts, ans: m.ans,
             explain: ch.sent, after: ch.sent };
  }
  function qStrokes(c) {
    var n = D.chars[c].n;
    var wr = uniqueFirst(shuffle([n - 2, n - 1, n + 1, n + 2, n + 3].filter(function (x) { return x >= 1; })), 3, [n]);
    var m = mc(n, wr);
    return { kind: 'strokes', c: c, prompt: '这个字一共有几画？', big: { text: c, kai: true }, optKind: 'text', opts: m.opts.map(function (x) { return x + ' 画'; }), ans: m.ans,
             explain: '“' + c + '”一共 ' + n + ' 画。', after: c };
  }
  function qTone(c) {
    var ch = D.chars[c], t = MZ.toneOf(ch.p);
    var m = mc(t, [1, 2, 3, 4].filter(function (x) { return x !== t; }));
    return { kind: 'tone', c: c, prompt: '“' + c + '”是第几声？', big: { text: c, kai: true }, speak: MZ.say(c), optKind: 'text',
             opts: m.opts.map(function (x) { return TONE_NAMES[x]; }), ans: m.ans, explain: '“' + c + '”读 ' + ch.p + '，是' + TONE_NAMES[t] + '。', after: c };
  }
  function qRadical(c) {
    var ch = D.chars[c], ri = ch.r, R = D.radicals;
    var others = shuffle(R.map(function (_, i) { return i; }).filter(function (i) { return i !== ri; })).slice(0, 3);
    var all = shuffle([ri].concat(others));
    return { kind: 'radical', c: c, prompt: '“' + c + '”的偏旁是？', big: { text: c, kai: true }, optKind: 'rad',
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

  /* ---------- 古诗题：补上诗句里缺的字 ---------- */
  function poemList() { return D.passages.filter(function (p) { return p.kind === '古诗'; }); }
  function qPoemBlank(ps, k) {
    var line = ps.lines[k], idxs = [], pos, c;
    for (var i = 0; i < line.length; i++) if (MZ.isCJK(line[i])) idxs.push(i);
    pos = pick(idxs); c = line[pos];
    var have = {};
    line.split('').forEach(function (x) { have[x] = 1; });
    var bag = {};
    poemList().forEach(function (p) { p.lines.forEach(function (l) { l.split('').forEach(function (x) { if (MZ.isCJK(x) && !have[x]) bag[x] = 1; }); }); });
    var m = mc(c, shuffle(Object.keys(bag)).slice(0, 3));
    return { kind: 'poem', prompt: '补全诗句：《' + ps.title + '》', ruby: { text: line, py: ps.lp[k], blank: pos }, optKind: 'char', opts: m.opts, ans: m.ans,
             explain: ps.title + '：' + line, after: line };
  }

  /* ---------- 对外：给“叫醒字宝宝”和小游戏用 ---------- */
  MZ.Q = {
    listen: qListen, pinyin: qPinyin, wordfill: qWordFill, sentfill: qSentFill, strokes: qStrokes, tone: qTone, radical: qRadical,
    idiomBlank: qIdiomBlank, idiomMean: qIdiomMean, poemBlank: qPoemBlank,
  };
  MZ.qIdiomBlank = qIdiomBlank;   // 成语详情页的“试一试”复用

  /* ---------- 组一关 ---------- */
  var BUILDERS = { listen: qListen, pinyin: qPinyin, wordfill: qWordFill, sentfill: qSentFill, strokes: qStrokes, tone: qTone, radical: qRadical };
  MZ.buildLevel = function (L) {
    var N = MZ.LEVEL_Q, qs = [], i;
    if (L.kind === 'chars' || L.kind === 'mix') {
      var pool = [], picks;
      if (L.kind === 'chars') {
        L.groups.forEach(function (g) { pool = pool.concat(D.groups[g].chars); });
        picks = shuffle(pool);
        while (picks.length < N) picks = picks.concat(shuffle(pool));
        picks = picks.slice(0, N);
      } else {
        pool = MZ.pool('learned', 12).chars;
        picks = MZ.pickN(pool, N);
        while (picks.length < N) picks.push(pick(pool));
      }
      var types = shuffle(['listen', 'pinyin', 'wordfill', 'sentfill', 'listen', 'pinyin', 'wordfill', pick(['strokes', 'tone', 'radical', 'sentfill'])]);
      // 第一题用最简单的两种
      var fi = types.findIndex(function (t) { return t === 'listen' || t === 'pinyin'; });
      if (fi > 0) { var tmp = types[0]; types[0] = types[fi]; types[fi] = tmp; }
      for (i = 0; i < N; i++) {
        var c = picks[i], t = types[i], ch = D.chars[c];
        if (t === 'radical' && ch.r == null) t = 'pinyin';
        if (t === 'tone' && MZ.toneOf(ch.p) === 0) t = 'pinyin';
        qs.push(BUILDERS[t](c, pool));
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
    } else if (L.kind === 'poem') {
      var s = S.get(), ps = poemList(), read = ps.filter(function (p) { return s.reads[p.id]; });
      var src = read.length >= 3 ? read : ps, lines = [];
      src.forEach(function (p) { p.lines.forEach(function (l, k) { lines.push([p, k]); }); });
      lines = shuffle(lines);
      var used = {}, chosen = [];
      lines.forEach(function (x) { if (chosen.length < N && !used[x[0].id + x[1]]) { used[x[0].id + x[1]] = 1; chosen.push(x); } });
      qs = chosen.map(function (x) { return qPoemBlank(x[0], x[1]); });
    }
    return qs;
  };
})();
