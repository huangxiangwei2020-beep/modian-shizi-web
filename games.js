/* 墨点识字 · 小游戏框架：游戏大厅、开局设置、计分/连击/提示/纪录、难度自适应、结算 */
(function () {
  'use strict';
  var MZ = window.MZ, D = MZ.D, S = MZ.S, h = MZ.h, V = MZ.VIEWS, ui = MZ.ui;
  var icon = ui.icon, tap = ui.tap, topbar = ui.topbar;

  var GAMES = MZ.GAMES = [], BYID = {};
  // 一个游戏 = { id, name, emoji, color, desc, how, tiers:[三档难度各一句话], rounds:[...], minPool, run(ctx) }
  MZ.regGame = function (g) { GAMES.push(g); BYID[g.id] = g; };
  var TIERS = [{ k: 1, name: '轻松', emoji: '🌱' }, { k: 2, name: '进阶', emoji: '🌿' }, { k: 3, name: '挑战', emoji: '🌳' }];
  var SCOPES = [{ k: 'learned', t: '我学过的字' }, { k: 'fuzzy', t: '迷糊字宝' }, { k: 'all', t: '所有汉字' }];
  MZ.TIERS = TIERS;

  function gtOf(id) { var s = S.get(); return s.gt[id] || { t: 1, hi: 0, lo: 0 }; }
  function bestStars(id) { return S.get().rec[id + '-stars'] || 0; }

  /* ================= 游戏大厅 ================= */
  V.games = function () {
    var s = S.get(), plays = 0; for (var k in s.plays) plays += s.plays[k];
    var cards = h('div', { class: 'gcards' }, GAMES.map(function (g) {
      var gt = gtOf(g.id), bs = bestStars(g.id), n = s.plays[g.id] || 0;
      return h('button', { class: 'gcard c-' + g.color, onclick: tap(function () { MZ.go('game', { id: g.id }); }) },
        h('div', { class: 'gc-e' }, g.emoji),
        h('h3', null, g.name), h('p', null, g.desc),
        h('div', { class: 'gc-foot' },
          h('span', { class: 'gc-tier' }, '推荐 ' + TIERS[gt.t - 1].emoji + TIERS[gt.t - 1].name),
          h('span', { class: 'gc-stars' }, [0, 1, 2].map(function (i) { return h('i', { class: i < bs ? 'on' : '' }, '★'); }))),
        n ? h('em', { class: 'gc-n' }, '玩过 ' + n + ' 局') : h('em', { class: 'gc-n new' }, '新游戏'));
    }));
    var node = h('section', { class: 'screen games th-sun' }, topbar({ title: '小游戏' }),
      h('div', { class: 'games-body' },
        h('p', { class: 'tip' }, '玩游戏也是在复习：答对的字宝宝会越记越牢，答不出来的会去“迷糊字宝本”休息，再多见几次就记住啦。已玩 ' + plays + ' 局。'),
        cards));
    return { node: node };
  };

  /* ================= 一局游戏 ================= */
  V.game = function (p) {
    var g = BYID[p.id];
    if (!g) return V.games({});
    var s = S.get();
    var state = { tier: p.tier || gtOf(g.id).t, scope: p.scope || 'learned' };
    var node = h('section', { class: 'screen game th-' + g.color });
    var cleanup = null, alive = true;

    function setScreen() { MZ.clear(node); Array.prototype.forEach.call(arguments, function (el) { node.appendChild(el); }); }

    /* ---------- 开局设置 ---------- */
    function lobby() {
      if (cleanup) { cleanup(); cleanup = null; }
      var fz = MZ.rev.fuzzyList().length, learned = S.learnedCount();
      if (state.scope === 'fuzzy' && !fz) state.scope = 'learned';
      var rec = s.rec[g.id + '-' + state.tier];
      var tierBtns = h('div', { class: 'gl-tiers' }, TIERS.map(function (t) {
        var rec_ = gtOf(g.id).t === t.k;
        return h('button', { class: 'gl-tier' + (state.tier === t.k ? ' on' : ''), onclick: tap(function () { state.tier = t.k; lobby(); }) },
          h('span', { class: 'gt-e' }, t.emoji), h('span', { class: 'gt-t' }, h('b', null, t.name), h('i', null, g.tiers[t.k - 1])), rec_ ? h('em', { class: 'gt-rec' }, '推荐') : null);
      }));
      var scopeBtns = h('div', { class: 'seg gl-scope' }, SCOPES.filter(function (c) { return c.k !== 'fuzzy' || fz > 0; }).map(function (c) {
        return h('button', { class: 'seg-b' + (state.scope === c.k ? ' on' : ''), onclick: tap(function () { state.scope = c.k; lobby(); }) }, c.t + (c.k === 'fuzzy' ? ' ' + fz : ''));
      }));
      var note = state.scope === 'learned' && learned < 8 ? '你学过的字还不多，墨墨会借几个新字一起玩。' : state.scope === 'all' ? '所有汉字都会出现，没学过的字也会遇到，试试看！' : '';
      var node2 = [topbar({ title: g.name }),
        h('div', { class: 'gm-lobby' },
          h('div', { class: 'gl-card' },
            h('div', { class: 'gl-glyph' }, g.emoji),
            h('h2', null, g.name), h('p', { class: 'gl-how' }, g.how), MZ.mascot('think', 84)),
          h('div', { class: 'gl-set' },
            h('h4', null, '选一个难度'), tierBtns,
            h('h4', null, '和哪些字玩'), scopeBtns,
            note ? h('p', { class: 'gl-note' }, note) : null,
            h('div', { class: 'gl-rec' }, rec ? '这个难度的最高分：' + rec + ' 分' : '这个难度还没玩过，快来试试！'),
            h('button', { class: 'btn coral lg gl-go', onclick: tap(play) }, icon('play'), '开始游戏')))];
      setScreen.apply(null, node2);
    }

    /* ---------- 玩 ---------- */
    function play() {
      if (cleanup) { cleanup(); cleanup = null; }
      MZ.stopSpeak();
      var tier = state.tier, poolInfo = MZ.pool(state.scope, g.minPool || 10);
      var N = g.rounds ? g.rounds[tier - 1] : 0;
      var stats = { right: 0, wrong: 0, clean: 0, combo: 0, best: 0, score: 0, hints: 3, moves: 0 };
      var missed = {}, finished = false;
      var segs = h('div', { class: 'qsegs' });
      var scoreEl = h('span', { class: 'pill star' }, icon('star'), h('b', null, '0'));
      var comboEl = h('span', { class: 'gm-combo' });
      var hintEl = h('button', { class: 'btn sky sm gm-hint', 'aria-label': '提示', onclick: tap(function () { if (ctx.onHint) ctx.onHint(); }) }, h('span', { class: 'ic' }, '💡'), h('b', null, '3'));
      var timeBar = h('div', { class: 'gm-time', style: { display: 'none' } }, h('i'));
      var area = h('div', { class: 'gm-area' });
      var say = h('div', { class: 'gm-say' });
      var top = h('header', { class: 'top gm-top' },
        h('button', { class: 'icon-btn', 'aria-label': '退出', onclick: tap(function () {
          if (finished) { MZ.back(); return; }
          MZ.modal({ title: '要退出吗？', body: '这一局还没玩完，现在退出不会得到星星哦。', buttons: [{ label: '继续玩', kind: 'coral' }, { label: '退出', kind: 'ghost', onClick: function () { MZ.back(); } }] });
        }) }, icon('close')),
        h('div', { class: 'ttl' }, g.name), segs, comboEl, h('div', { class: 'grow' }), hintEl, scoreEl);
      setScreen(top, timeBar, area, say);

      function setScore() { scoreEl.querySelector('b').textContent = String(stats.score); }
      function setCombo() {
        comboEl.textContent = stats.combo >= 2 ? '🔥 连击 ×' + stats.combo : '';
        comboEl.classList.remove('pop'); void comboEl.offsetWidth; if (stats.combo >= 2) comboEl.classList.add('pop');
      }
      function setHints() { hintEl.querySelector('b').textContent = String(stats.hints); hintEl.disabled = stats.hints <= 0; }
      var sayTimer = null;
      function sayIt(mood, text) {
        MZ.clear(say); say.appendChild(MZ.mascot(mood, 64)); if (text) say.appendChild(h('span', null, text));
        say.classList.add('on'); clearTimeout(sayTimer); sayTimer = setTimeout(function () { say.classList.remove('on'); }, 1400);
      }

      var ctx = {
        g: g, tier: tier, scope: state.scope, N: N, area: area, stats: stats, pool: poolInfo.chars, borrowed: poolInfo.borrowed,
        timeBar: timeBar, onHint: null,
        pick: function (n, o) { return MZ.pickN(poolInfo.chars, n, o); },
        setSegs: function (n) { MZ.clear(segs); for (var i = 0; i < n; i++) segs.appendChild(h('i')); },
        markSeg: function (i, ok) { if (segs.children[i]) segs.children[i].className = ok ? 'ok' : 'no'; },
        curSeg: function (i) { Array.prototype.forEach.call(segs.children, function (el, k) { if (!el.className || el.className === 'cur') el.className = k === i ? 'cur' : ''; }); },
        say: sayIt,
        onLeave: function (fn) { cleanup = fn; },
        // 一轮的开始：c 是这一轮在考的字（没有就传 ''）。soft：答错不算“迷糊”
        begin: function (c, soft) { return { c: c || '', wrongs: 0, assisted: false, soft: !!soft, done: false }; },
        hint: function (att) {
          if (stats.hints <= 0) return false;
          stats.hints--; setHints(); if (att) att.assisted = true; MZ.sfx.tap(); return true;
        },
        // 点错了
        miss: function (att) {
          att.wrongs++; stats.wrong++;
          if (att.wrongs === 1 && att.c) {
            missed[att.c] = 1;
            if (!att.soft) MZ.rev.grade(att.c, false);
          }
          stats.combo = 0; setCombo();
          stats.score = Math.max(0, stats.score - 2); setScore();
          MZ.sfx.bad();
        },
        // 做对了：返回这一轮得了多少分
        hit: function (att, bonus) {
          if (att.done) return 0; att.done = true;
          var clean = att.wrongs === 0 && !att.assisted, pts;
          stats.right++;
          if (clean) {
            stats.clean++; stats.combo++; stats.best = Math.max(stats.best, stats.combo);
            pts = 10 + Math.min(stats.combo - 1, 10) + (bonus || 0);
            if (att.c) MZ.rev.grade(att.c, true);
            if (stats.combo >= 2) MZ.sfx.combo(stats.combo); else MZ.sfx.ok();
          } else {
            pts = att.assisted ? 4 : Math.max(4, 8 - att.wrongs * 2);
            stats.combo = 0; MZ.sfx.ok();
          }
          stats.score += pts; setScore(); setCombo();
          if (clean && stats.combo > 0 && stats.combo % 5 === 0) { sayIt('cheer', stats.combo + ' 连击！太棒了！'); MZ.confetti(30); }
          return pts;
        },
        // 不属于某个字的小失误（比如翻牌没配上）
        slip: function () { stats.combo = 0; setCombo(); },
        addScore: function (n) { stats.score = Math.max(0, stats.score + n); setScore(); },
        finish: function (o) { finish(o || {}); },
      };
      setHints(); setCombo(); setScore();

      function finish(o) {
        if (finished) return; finished = true;
        if (cleanup) { cleanup(); cleanup = null; }
        MZ.stopSpeak();
        var acc = o.acc != null ? o.acc : (N ? stats.clean / N : 1);
        var starsN = o.stars != null ? o.stars : acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
        var score = o.score != null ? o.score : stats.score;
        var st = S.get(), key = g.id + '-' + tier, best = st.rec[key] || 0, newRec = best > 0 && score > best;
        if (score > best) st.rec[key] = score;
        st.rec[g.id + '-stars'] = Math.max(st.rec[g.id + '-stars'] || 0, starsN);
        if (newRec) st.recs++;
        st.plays[g.id] = (st.plays[g.id] || 0) + 1;
        st.combo = Math.max(st.combo || 0, stats.best);
        // 难度自适应：连续两局很顺就推荐升一档；连续两局吃力就推荐降一档
        var G = st.gt[g.id] || (st.gt[g.id] = { t: 1, hi: 0, lo: 0 }), tip = '';
        if (tier === G.t) {
          if (acc >= 0.9) { G.hi++; G.lo = 0; } else if (acc < 0.55) { G.lo++; G.hi = 0; } else { G.hi = 0; G.lo = 0; }
          if (G.hi >= 2 && G.t < 3) { G.t++; G.hi = 0; tip = '你玩得太好了！下次推荐试试“' + TIERS[G.t - 1].name + '”难度。'; }
          else if (G.lo >= 2 && G.t > 1) { G.t--; G.lo = 0; tip = '这个难度有点费劲，下次推荐先玩“' + TIERS[G.t - 1].name + '”，更轻松。'; }
        } else if (tier > G.t && acc >= 0.85) { G.t = tier; G.hi = 0; G.lo = 0; tip = '挑战成功！下次推荐“' + TIERS[G.t - 1].name + '”难度。'; }
        var gain = starsN + (tier - 1) + (newRec ? 1 : 0);
        S.save();
        MZ.adv.event('game');
        MZ.reward(gain, g.name);
        MZ.afterActivity();

        var starsRow = h('div', { class: 'rstars' }, [0, 1, 2].map(function (k) { return h('span', { class: 'rstar' + (k < starsN ? ' on' : ''), style: { animationDelay: (0.3 + k * 0.3) + 's' } }, icon('star')); }));
        var lines = [h('p', null, '得分 ' + score + (newRec ? '' : '') + '　·　最高连击 ' + stats.best)];
        (o.lines || []).forEach(function (t) { lines.push(h('p', { class: 'sub' }, t)); });
        var mset = Object.keys(missed).filter(function (c) { return st.learned[c]; });
        var missedBox = mset.length ? h('div', { class: 'gm-missed' }, h('span', null, '再看看这几个字：'),
          mset.slice(0, 8).map(function (c) { return h('button', { class: 'mchip', onclick: tap(function () { MZ.go('char', { c: c, g: MZ.groupOf(c) }); }) }, h('b', null, c), h('i', null, D.chars[c].p)); })) : null;
        var res = h('div', { class: 'result gm-res' }, MZ.mascot(starsN === 3 ? 'cheer' : 'happy', 110),
          h('h2', null, starsN === 3 ? '太厉害了！' : starsN === 2 ? '玩得真好！' : '完成啦，再来一次会更棒！'),
          newRec ? h('div', { class: 'newrec' }, '🏅 新纪录！') : null,
          starsRow, lines, tip ? h('p', { class: 'tipup' }, tip) : null, missedBox,
          h('div', { class: 'racts' },
            h('button', { class: 'btn coral', onclick: tap(function () { MZ.go('game', { id: g.id, tier: tier, scope: state.scope, start: 1 }, { replace: true }); }) }, icon('redo'), '再玩一次'),
            h('button', { class: 'btn ghost', onclick: tap(function () { MZ.go('game', { id: g.id, tier: G.t, scope: state.scope }, { replace: true }); }) }, '换难度'),
            h('button', { class: 'btn ghost', onclick: tap(function () { MZ.go('games', {}, { replace: true }); }) }, '玩别的')));
        setScreen(h('header', { class: 'top gm-top' }, h('button', { class: 'icon-btn', 'aria-label': '返回', onclick: tap(function () { MZ.back(); }) }, icon('back')), h('div', { class: 'ttl' }, g.name), h('div', { class: 'grow' }), ui.stats()),
          h('div', { class: 'gm-area gm-resbox' }, res));
        MZ.sfx.win(); MZ.confetti(starsN === 3 ? 160 : 90);
        MZ.refreshChrome();
      }

      g.run(ctx);
    }

    return { node: node, after: function () { if (p.start) play(); else lobby(); }, leave: function () { alive = false; if (cleanup) { cleanup(); cleanup = null; } } };
  };
})();
