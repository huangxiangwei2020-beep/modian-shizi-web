/* 墨点识字 · 第 8 个小游戏：拼字工坊（把字拆成零件，再把零件拼成字） */
(function () {
  'use strict';
  var MZ = window.MZ, D = MZ.D, h = MZ.h, ui = MZ.ui, tap = ui.tap, icon = ui.icon, shuffle = MZ.shuffle;
  function later(fn, ms) { return setTimeout(fn, ms); }

  var CONF = ['口囗', '日曰', '己已巳', '末未', '戊戌戍', '土士'];

  // 一个零件的小卡片：零件 + 在字里的位置 + 名字
  function partCard(p, k, dk, cls) {
    var lab = MZ.partLabel(p);
    return h('div', { class: 'bd-part ' + (cls || '') }, h('b', null, p), h('i', null, MZ.SLOTN[dk][k] + (lab ? ' · ' + lab : '')));
  }

  MZ.regGame({
    id: 'build', name: '拼字工坊', emoji: '🧩', color: 'teal', desc: '把字拆成零件，再拼回来',
    how: '汉字是用零件拼出来的。有时给你两个零件，请选出它们拼成的字；有时给你一个字，请把它的两个零件放到对的位置。拼对了，字宝宝会“叮”一声合体！',
    tiers: ['拼一拼：看零件，选出拼成的字', '拆一拆：看字，找出它的两个零件', '拆拼混合，还有长得像的零件'], rounds: [6, 8, 10], minPool: 14,
    run: function (ctx) {
      var N = ctx.N, tier = ctx.tier, i = 0, timers = [], att = null;
      // 先用“我学过的字”里能拆的；不够再从常用字里补（从前几册开始，更简单）
      var pool = ctx.pool.filter(MZ.hasDc), have = {};
      pool.forEach(function (c) { have[c] = 1; });
      var need = Math.max(N * 3, 24);
      MZ.DCCORE.forEach(function (c) { if (pool.length < need && !have[c]) { pool.push(c); have[c] = 1; } });
      var targets = MZ.pickN(pool, N);
      var first = Math.random() < 0.5;
      var modes = targets.map(function (c, k) { return tier === 1 ? 'A' : tier === 2 ? 'B' : ((k % 2 === 0) === first ? 'A' : 'B'); });
      ctx.setSegs(N);
      var wrap = h('div', { class: 'bd-wrap' });
      ctx.area.appendChild(wrap);

      function sharing(c) {         // 和 c 至少有一个零件相同的别的字
        var ps = MZ.partsOf(c);
        return MZ.DCCORE.filter(function (x) {
          if (x === c) return false;
          var q = MZ.partsOf(x);
          return q[0] === ps[0] || q[1] === ps[1] || q[0] === ps[1] || q[1] === ps[0];
        });
      }
      function sharesPart(x, c) {
        var a = MZ.partsOf(x), b = MZ.partsOf(c);
        return a[0] === b[0] || a[1] === b[1] || a[0] === b[1] || a[1] === b[0];
      }
      // 拼一拼的干扰字：容易的随便选（不共用零件）；难的专挑共用一个零件的
      function decoyChars(c, n, hard) {
        var dcs = D.chars[c].dc, seen = {}, out = [];
        seen[c] = 1;
        function add(list, okFn) {
          shuffle(list.slice()).forEach(function (x) {
            if (out.length < n && !seen[x] && D.chars[x].dc !== dcs && (!okFn || okFn(x))) { seen[x] = 1; out.push(x); }
          });
        }
        if (hard) { var sh = sharing(c); add(sh.filter(function (x) { return have[x]; })); add(sh); }
        add(pool, function (x) { return !sharesPart(x, c); });
        add(MZ.DCCORE, function (x) { return !sharesPart(x, c); });
        add(MZ.DCCORE);
        return out;
      }
      // 拆一拆的干扰零件：难的用“兄弟字”的另一半（每 → 悔、梅 的 忄、木）
      function decoyParts(c, n) {
        var ps = MZ.partsOf(c), seen = {}, out = [];
        seen[ps[0]] = 1; seen[ps[1]] = 1;
        ps.forEach(function (p) { var sub = MZ.partsOf(p); if (sub) { seen[sub[0]] = 1; seen[sub[1]] = 1; } });   // 零件自己还能再拆，拆出来的不当干扰
        ps.forEach(function (p) { CONF.forEach(function (g) { if (g.indexOf(p) >= 0) g.split('').forEach(function (x) { seen[x] = 1; }); }); });   // 几乎一模一样的字形不当干扰（口/囗 日/曰 ……）
        function add(list) { shuffle(list.slice()).forEach(function (x) { if (out.length < n && !seen[x]) { seen[x] = 1; out.push(x); } }); }
        if (tier === 3) {
          var sib = [];
          sharing(c).forEach(function (x) { MZ.partsOf(x).forEach(function (p) { if (!seen[p] && sib.indexOf(p) < 0) sib.push(p); }); });
          add(sib);
        }
        add(MZ.PARTS.slice(0, 90));
        add(MZ.PARTS);
        return out;
      }

      function round() {
        if (i >= N) return ctx.finish({});
        ctx.curSeg(i);
        var c = targets[i];
        MZ.clear(wrap);
        att = ctx.begin(c);
        if (modes[i] === 'A') roundA(c); else roundB(c);
      }
      function next(ms) { i++; timers.push(later(round, ms || 1700)); }

      /* ---------- 拼一拼：看零件，选字 ---------- */
      function roundA(c) {
        var ps = MZ.partsOf(c), dk = D.chars[c].dk;
        var opts = shuffle([c].concat(decoyChars(c, tier === 1 ? 2 : 3, tier === 3)));
        var q = h('b', { class: 'bd-q' }, '?');
        var eq = h('div', { class: 'bd-eq' }, partCard(ps[0], 0, dk), h('span', { class: 'bd-op' }, '+'), partCard(ps[1], 1, dk), h('span', { class: 'bd-op' }, '='), q);
        var after = h('div', { class: 'bd-after' }, MZ.KIND[dk] + '：' + (dk === 'in' ? '外面一个，里面一个' : dk === 'ud' ? '上面一个，下面一个' : '左边一个，右边一个'));
        var btns = opts.map(function (x) {
          var b = h('button', { class: 'opt char bd-opt', onclick: tap(function () { choose(x, b); }) }, x); b._x = x; return b;
        });
        wrap.appendChild(h('div', { class: 'bd-ask' }, '这两个零件，拼成哪个字？'));
        wrap.appendChild(eq); wrap.appendChild(after);
        wrap.appendChild(h('div', { class: 'bd-opts n' + btns.length }, btns));
        function choose(x, b) {
          if (att.done || b.disabled) return;
          if (x === c) {
            ctx.hit(att); ctx.markSeg(i, att.wrongs === 0 && !att.assisted);
            q.textContent = c; q.classList.add('done'); b.classList.add('right');
            btns.forEach(function (o) { o.disabled = true; });
            after.textContent = ps[0] + ' + ' + ps[1] + ' = ' + c; after.classList.add('on');
            MZ.sfx.pop(); MZ.speak(MZ.say(c));
            ctx.say('cheer', MZ.pick(MZ.PRAISE));
            next(1800);
          } else {
            ctx.miss(att); b.classList.add('wrong'); b.disabled = true;
            eq.classList.remove('shake'); void eq.offsetWidth; eq.classList.add('shake');
            if (att.wrongs >= 2 && !att.assisted) { att.assisted = true; glow(); }
          }
        }
        function glow() { btns.forEach(function (b) { if (b._x === c) b.classList.add('glow'); }); }
        ctx.onHint = function () { if (att.done) return; if (ctx.hint(att)) glow(); };
      }

      /* ---------- 拆一拆：看字，把零件放到位置上 ---------- */
      function roundB(c) {
        var ch = D.chars[c], ps = MZ.partsOf(c), dk = ch.dk, filled = [false, false];
        var tiles = shuffle(ps.slice().concat(decoyParts(c, tier === 2 ? 3 : 4)));
        var target = h('div', { class: 'bd-target' },
          h('b', null, c), h('i', null, ch.p),
          h('button', { class: 'icon-btn spk sm', 'aria-label': '听一听', onclick: tap(function () { MZ.speak(MZ.say(c)); }) }, icon('speaker')),
          h('span', { class: 'chip' }, MZ.KIND[dk]));
        var slots = [0, 1].map(function (k) {
          return h('div', { class: 'bd-slot s' + k }, h('em', null, MZ.SLOTN[dk][k]), h('b', null, ''));
        });
        var frame = h('div', { class: 'bd-frame k-' + dk }, slots);
        var after = h('div', { class: 'bd-after' }, '点下面的零件，放进框里');
        var tileEls = tiles.map(function (p) {
          var t = h('button', { class: 'bd-tile', onclick: tap(function () { put(t); }) }, h('b', null, p)); t._p = p; return t;
        });
        wrap.appendChild(h('div', { class: 'bd-ask' }, '把“' + c + '”拆开：它是由哪两个零件拼成的？'));
        wrap.appendChild(h('div', { class: 'bd-row' }, target, h('span', { class: 'bd-arrow' }, '拆开'), frame));
        wrap.appendChild(after);
        wrap.appendChild(h('div', { class: 'bd-tiles n' + tileEls.length }, tileEls));
        timers.push(later(function () { MZ.speak(MZ.say(c)); }, 300));
        function put(t) {
          if (att.done || t.disabled) return;
          var k = -1;
          for (var j = 0; j < 2; j++) if (!filled[j] && ps[j] === t._p) { k = j; break; }
          if (k < 0) {
            ctx.miss(att); t.disabled = true; t.classList.add('bad');
            frame.classList.remove('shake'); void frame.offsetWidth; frame.classList.add('shake');
            if (att.wrongs >= 2 && !att.assisted) { att.assisted = true; glow(); }
            return;
          }
          filled[k] = true; t.disabled = true; t.classList.add('used');
          var s = slots[k]; s.classList.add('on'); s.querySelector('b').textContent = t._p;
          MZ.sfx.pop();
          if (filled[0] && filled[1]) done();
        }
        function done() {
          ctx.hit(att); ctx.markSeg(i, att.wrongs === 0 && !att.assisted);
          frame.classList.add('join');
          tileEls.forEach(function (t) { t.disabled = true; });
          after.textContent = ps[0] + ' + ' + ps[1] + ' = ' + c; after.classList.add('on');
          timers.push(later(function () { MZ.sfx.star(); }, 160));
          MZ.speak(MZ.say(c));
          ctx.say('cheer', MZ.pick(MZ.PRAISE));
          next(1900);
        }
        function glow() {
          var left = filled.map(function (f, k) { return f ? null : ps[k]; });
          tileEls.forEach(function (t) { var at = left.indexOf(t._p); if (at >= 0 && !t.disabled) { t.classList.add('glow'); left[at] = null; } });
        }
        ctx.onHint = function () { if (att.done) return; if (ctx.hint(att)) glow(); };
      }

      round();
      ctx.onLeave(function () { timers.forEach(clearTimeout); });
    },
  });
})();
