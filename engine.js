/* 墨点识字 · 学习引擎：字宝宝复习（间隔记忆）、迷糊字宝、选字出题、每日小冒险、星星与装扮 */
(function () {
  'use strict';
  var MZ = window.MZ, D = MZ.D, S = MZ.S, h = MZ.h;

  /* ---------- 字 -> 分组 / 词性 / 册 的快速查找 ---------- */
  var GI = MZ.GI = {}, POSOF = MZ.POSOF = {}, BOOKOF = MZ.BOOKOF = {};
  D.groups.forEach(function (g, gi) {
    g.chars.forEach(function (c) { GI[c] = gi; POSOF[c] = g.pos || g.name; BOOKOF[c] = g.book; });
  });
  MZ.groupOf = function (c) { return GI[c] == null ? 0 : GI[c]; };
  MZ.bookStat = function (bi) {
    var s = S.get(), b = D.books[bi], total = 0, got = 0;
    b.groups.forEach(function (g) { D.groups[g].chars.forEach(function (c) { total++; if (s.learned[c]) got++; }); });
    return { got: got, total: total };
  };
  // 按识字顺序，取接下来还没学的 n 个字
  MZ.nextNew = function (n) {
    var s = S.get(), out = [];
    for (var i = 0; i < D.order.length && out.length < n; i++) if (!s.learned[D.order[i]]) out.push(D.order[i]);
    return out;
  };

  /* ---------- 间隔复习：每个学过的字有一个“睡眠箱” ----------
     b：0~5 档，档越高，隔得越久才再叫醒（0,1,2,4,7,14 天）；d：下次该叫醒的日期
     n/m：答对/答错次数；k：连续答对数；w：1 表示“迷糊字宝”（最近答错过，还没恢复） */
  var BOXES = [0, 1, 2, 4, 7, 14];
  var rev = MZ.rev = {
    BOXES: BOXES,
    // 刚学会一个字：明天第一次叫醒它
    born: function (c) {
      var s = S.get();
      if (!s.rev[c]) s.rev[c] = { b: 0, d: MZ.addDays(MZ.today(), 1), n: 0, m: 0, k: 0, w: 0 };
    },
    // 老存档升级：学过、但还没有复习记录的字，每天最多先叫醒 10 个（最近学的排前面），免得一打开就睡着一大片
    migrate: function () {
      var s = S.get(), t = MZ.today(), miss = [];
      D.order.forEach(function (c) { if (s.learned[c] && !s.rev[c]) miss.push(c); });
      if (!miss.length) return;
      miss.sort(function (a, b) { return (s.learned[b] || 0) - (s.learned[a] || 0); });
      miss.forEach(function (c, i) { s.rev[c] = { b: 0, d: MZ.addDays(t, Math.floor(i / 10)), n: 0, m: 0, k: 0, w: 0 }; });
      S.save();
    },
    // 老存档里学过、但还没有记录的字：当作今天该叫醒
    ensure: function (c) {
      var s = S.get();
      if (!s.rev[c]) s.rev[c] = { b: 0, d: MZ.today(), n: 0, m: 0, k: 0, w: 0 };
      return s.rev[c];
    },
    isDue: function (c) {
      var s = S.get();
      if (!s.learned[c]) return false;
      var r = s.rev[c];
      return !r || r.d <= MZ.today();
    },
    isFuzzy: function (c) { var r = S.get().rev[c]; return !!(r && r.w && S.get().learned[c]); },
    // 0 没学过；1 刚认识；2 比较熟；3 牢记（金色）
    stage: function (c) {
      var s = S.get();
      if (!s.learned[c]) return 0;
      var r = s.rev[c], b = r ? r.b : 0;
      return b >= 4 ? 3 : b >= 2 ? 2 : 1;
    },
    // 睡着了（该复习了）的字：迷糊的排最前，然后是拖得最久的
    dueList: function () {
      var s = S.get(), t = MZ.today(), out = [];
      D.order.forEach(function (c, i) {
        if (!s.learned[c]) return;
        var r = s.rev[c];
        if (r && r.d > t) return;
        out.push({ c: c, w: r && r.w ? 1 : 0, d: r ? r.d : t, i: i });
      });
      out.sort(function (a, b) { return (b.w - a.w) || (a.d < b.d ? -1 : a.d > b.d ? 1 : 0) || (a.i - b.i); });
      return out.map(function (x) { return x.c; });
    },
    fuzzyList: function () {
      var s = S.get(), out = [];
      D.order.forEach(function (c) { var r = s.rev[c]; if (s.learned[c] && r && r.w) out.push(c); });
      out.sort(function (a, b) { return (s.rev[b].m - s.rev[a].m); });
      return out;
    },
    counts: function () {
      var s = S.get(), st = [0, 0, 0, 0];
      D.order.forEach(function (c) { st[rev.stage(c)]++; });
      return { learned: S.count(s.learned), due: rev.dueList().length, fuzzy: rev.fuzzyList().length, s1: st[1], s2: st[2], s3: st[3] };
    },
    // 记一次结果。只有“该叫醒”的字答对才会升档，所以反复玩不会让字假装记牢。
    grade: function (c, ok) {
      var s = S.get();
      if (!s.learned[c]) return null;                       // 游戏里“借来”的新字不记
      var r = rev.ensure(c), t = MZ.today(), res = { cured: false, promoted: false, fuzzyNow: false };
      if (ok) {
        r.n++; r.k++;
        if (r.d <= t) { r.b = Math.min(5, r.b + 1); r.d = MZ.addDays(t, BOXES[r.b]); res.promoted = true; }
        if (r.w && r.k >= 3) { r.w = 0; r.k = 0; s.cured++; res.cured = true; }
      } else {
        r.m++; r.k = 0; r.b = Math.max(0, r.b - 1);
        if (!r.w) res.fuzzyNow = true;
        r.w = 1;
        var tm = MZ.addDays(t, 1);
        if (r.d > tm) r.d = tm;
      }
      S.save();
      return res;
    },
  };

  /* ---------- 学会一个字（识字页、描红完成时调用） ---------- */
  MZ.learn = function (c) {
    var s = S.get(), fresh = !s.learned[c];
    if (fresh) { s.learned[c] = Date.now(); rev.born(c); }
    S.save();
    return fresh;
  };
  MZ.dailyMark = function (c) {
    var s = S.get(), t = MZ.today();
    if (s.daily.date !== t) s.daily = { date: t, n: 0, done: false, chars: {} };
    if (!s.daily.chars) s.daily.chars = {};
    if (c && !s.daily.chars[c]) { s.daily.chars[c] = 1; s.daily.n++; }
    if (s.daily.n >= MZ.DAILY_GOAL && !s.daily.done) {
      s.daily.done = true; S.save();
      setTimeout(function () { MZ.toast('认识了 ' + MZ.DAILY_GOAL + ' 个新朋友，真棒！'); MZ.sfx.ok(); }, 900);
    } else S.save();
  };

  /* ---------- 选字：学过的字、迷糊的字、全部的字 ---------- */
  // scope：'learned' 我学过的字（默认）；'fuzzy' 迷糊字宝；'all' 全部汉字。
  // 学过的字不够 minN 个时，按识字顺序“借”几个新字来凑数，凑数的字不记入复习。
  MZ.pool = function (scope, minN) {
    var s = S.get(), learned = D.order.filter(function (c) { return s.learned[c]; }), list, borrowed = [], ex = {};
    minN = minN || 8;
    if (scope === 'all') list = D.order.slice();
    else if (scope === 'fuzzy') list = learned.filter(function (c) { return s.rev[c] && s.rev[c].w; });
    else list = learned.slice();
    list.forEach(function (c) { ex[c] = 1; });
    if (list.length < minN && scope === 'fuzzy') learned.forEach(function (c) { if (list.length < minN && !ex[c]) { list.push(c); ex[c] = 1; } });
    for (var i = 0; i < D.order.length && list.length < minN; i++) {
      var c = D.order[i];
      if (!ex[c] && !s.learned[c]) { list.push(c); ex[c] = 1; borrowed.push(c); }
    }
    return { chars: list, borrowed: borrowed, learnedN: learned.length };
  };

  var recent = [], RECENT_MAX = 30;
  // 带权重地挑 n 个不重复的字：迷糊的、该复习的、答错多的更容易被抽到；刚出现过的少抽
  MZ.pickN = function (pool, n, opt) {
    opt = opt || {};
    var s = S.get(), t = MZ.today(), items = [];
    pool.forEach(function (c) {
      if (opt.exclude && opt.exclude[c]) return;
      if (opt.need && !opt.need(c)) return;
      var r = s.rev[c], w = 1;
      if (r) {
        if (r.w) w += 3;
        if (r.d <= t && s.learned[c]) w += 2;
        var tot = r.n + r.m;
        w += tot ? 2 * r.m / (tot + 1) : 0.5;
      } else w += s.learned[c] ? 1.5 : 0.5;
      var ri = recent.lastIndexOf(c);
      if (ri >= 0) w *= 0.15 + 0.85 * (1 - (ri + 1) / (recent.length + 1));
      items.push({ c: c, w: w });
    });
    var out = [];
    while (out.length < n && items.length) {
      var sum = 0, i;
      for (i = 0; i < items.length; i++) sum += items[i].w;
      var r0 = Math.random() * sum, acc = 0, k = items.length - 1;
      for (i = 0; i < items.length; i++) { acc += items[i].w; if (r0 <= acc) { k = i; break; } }
      out.push(items[k].c); items.splice(k, 1);
    }
    if (opt.remember !== false) { out.forEach(function (c) { recent.push(c); }); if (recent.length > RECENT_MAX) recent = recent.slice(recent.length - RECENT_MAX); }
    return out;
  };

  // 找 n 个“干扰字”（答题时的错误选项）。
  // sim：优先放几个“长得像”的字（最多 simN 个）；hom：放几个读音只差声调的字（最多 homN 个）
  // diffPos：尽量取不同词性的（补全句子时，避免“换个字也说得通”）；diffSound：不要和答案同一个音节（听音选字时，免得听起来一样）
  // bad：构建时算好的“换成它也成词/成句”的字，永远不选
  MZ.distract = function (c, n, o) {
    o = o || {};
    var pool = o.pool || D.order, no = {}, out = [], ch = D.chars[c], plain = MZ.parsePy(ch.p).plain;
    no[c] = 1;
    (o.bad || '').split('').forEach(function (x) { no[x] = 1; });
    (o.not || []).forEach(function (x) { no[x] = 1; });
    function okc(x, strict) {
      if (no[x] || !D.chars[x]) return false;
      if (strict) {
        if (o.diffPos && POSOF[x] === POSOF[c]) return false;
        if (o.diffSound && MZ.parsePy(D.chars[x].p).plain === plain) return false;
      }
      return true;
    }
    function add(list, strict, max) {
      var cnt = 0;
      MZ.shuffle(list).forEach(function (x) {
        if (out.length < n && (max == null || cnt < max) && okc(x, strict)) { no[x] = 1; out.push(x); cnt++; }
      });
    }
    if (o.sim && ch.sim) add(ch.sim.split(''), true, o.simN || n);
    if (o.hom && ch.hom) add(ch.hom.split(''), false, o.homN || 1);
    add(pool, true); add(D.order, true); add(pool, false); add(D.order, false);
    return out;
  };

  /* ---------- 星星 ---------- */
  MZ.flyStars = function (n, why) {
    var el = h('div', { class: 'starfly' }, h('b', null, '+' + n), h('span', null, '⭐'), why ? h('small', null, why) : null);
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1700);
  };
  MZ.reward = function (n, why) {
    if (!(n > 0)) return;
    S.get().stars += n; S.save();
    MZ.flyStars(n, why);
    MZ.refreshChrome();
  };

  /* ---------- 每日小冒险：三件小事 + 一个宝箱，没做完也不会被扣什么 ---------- */
  var adv = MZ.adv = {
    st: function () {
      var s = S.get(), t = MZ.today();
      if (!s.adv || s.adv.date !== t) s.adv = { date: t, wake: 0, game: 0, chest: 0, notified: 0 };
      return s.adv;
    },
    tasks: function () {
      var a = adv.st(), n = S.dailyN(), sleepy = rev.dueList().length, learned = S.learnedCount();
      var left = D.order.length - learned;
      var t1 = left > 0
        ? { k: 'learn', label: '学' + MZ.DAILY_GOAL + '个新字', n: Math.min(n, MZ.DAILY_GOAL), goal: MZ.DAILY_GOAL, emoji: '🌱', to: 'learn' }
        : { k: 'learn', label: '全部认识啦', n: 1, goal: 1, emoji: '🌱', to: 'learn' };
      var woke = a.wake >= 1;
      var t2 = { k: 'wake', label: '叫醒字宝宝', n: (woke || sleepy === 0) ? 1 : 0, goal: 1, emoji: '⏰', to: 'wake', auto: !woke && sleepy === 0 };
      var t3 = { k: 'game', label: '玩1局游戏', n: Math.min(a.game, 1), goal: 1, emoji: '🎮', to: 'games' };
      [t1, t2, t3].forEach(function (t) { t.done = t.n >= t.goal; });
      return [t1, t2, t3];
    },
    allDone: function () { return adv.tasks().every(function (t) { return t.done; }); },
    chestReady: function () { return adv.allDone() && !adv.st().chest; },
    // 每次学了字、叫醒了字宝宝、玩了游戏之后调用：三件都完成时提醒一次
    check: function () {
      var a = adv.st();
      if (!a.notified && adv.allDone()) {
        a.notified = 1; S.save();
        setTimeout(function () { MZ.sfx.chest(); MZ.toast('今日小冒险完成啦！回首页打开宝箱吧 🎁', { long: true }); }, 1100);
      }
    },
    event: function (kind) { var a = adv.st(); if (kind === 'wake') a.wake++; else if (kind === 'game') a.game++; S.save(); },
    open: function () {
      var a = adv.st(), s = S.get();
      if (!adv.chestReady()) return 0;
      var gain = 5 + Math.min(5, S.streak());
      a.chest = 1; s.chests++; s.stars += gain; S.save();
      MZ.checkAch();
      return gain;
    },
  };

  /* ---------- 装扮商店 ---------- */
  MZ.shop = {
    owned: function (id) { return !!S.get().own[id]; },
    buy: function (id) {
      var it = MZ.ITEM[id], s = S.get();
      if (!it) return 'none';
      if (s.own[id]) return 'have';
      if (S.wallet() < it.price) return 'poor';
      s.spent = (s.spent || 0) + it.price; s.own[id] = Date.now();
      S.save(); MZ.checkAch();
      return 'ok';
    },
    wear: function (slot, id) {
      var s = S.get();
      if (!s.wear) s.wear = { hat: '', face: '', neck: '', bg: '' };
      if (id && !s.own[id]) return false;
      s.wear[slot] = id || '';
      S.save();
      return true;
    },
  };
})();
