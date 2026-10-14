/* 墨点识字 · 6 个小游戏：找朋友、泡泡乐、青蛙过河、字宝分家、火眼金睛、闪电快答 */
(function () {
  'use strict';
  var MZ = window.MZ, D = MZ.D, S = MZ.S, h = MZ.h, ui = MZ.ui, icon = ui.icon, tap = ui.tap;
  var shuffle = MZ.shuffle, pick = MZ.pick;

  function later(fn, ms) { var t = setTimeout(fn, ms); return t; }
  function speakSoon(text, ms) { return later(function () { MZ.speak(text); }, ms || 200); }

  /* ======================================================
     1. 找朋友：翻牌配对
     ====================================================== */
  MZ.regGame({
    id: 'match', name: '找朋友', emoji: '🃏', color: 'coral', desc: '翻牌配对，找好朋友',
    how: '每次翻开两张牌：如果是一对好朋友（比如“鸟”和它的拼音），牌就留下来；不是的话会盖回去，要记住它们在哪里哦！',
    tiers: ['4 对：字和拼音配对', '6 对：字和图画配对', '8 对：拼音、图画、词语混着配'], rounds: null, minPool: 12,
    run: function (ctx) {
      var tier = ctx.tier, pairsN = [4, 6, 8][tier - 1];
      var cand = MZ.pickN(ctx.pool, pairsN * 4, { remember: false });
      var chosen = [], usedPy = {}, usedEm = {};
      function take(c, needEmoji) {
        var ch = D.chars[c];
        if (usedPy[ch.p] || (needEmoji && (!ch.e || usedEm[ch.e]))) return false;
        usedPy[ch.p] = 1; if (ch.e) usedEm[ch.e] = 1; chosen.push(c); return true;
      }
      if (tier >= 2) cand.filter(function (c) { return D.chars[c].e; }).forEach(function (c) { if (chosen.length < Math.ceil(pairsN * (tier === 2 ? 1 : 0.6))) take(c, true); });
      cand.forEach(function (c) { if (chosen.length < pairsN && chosen.indexOf(c) < 0) take(c, false); });
      if (chosen.length < pairsN) D.order.forEach(function (c) { if (chosen.length < pairsN && chosen.indexOf(c) < 0) take(c, false); });
      MZ.pickN(chosen, chosen.length);        // 记一下刚出过哪些字，下一局尽量换新的
      var kinds = chosen.map(function (c, i) {
        var hasE = !!D.chars[c].e;
        if (tier === 1) return 'py';
        if (tier === 2) return hasE ? 'pic' : 'py';
        var k = ['py', 'pic', 'word', 'py', 'pic', 'word', 'py', 'word'][i % 8];
        return k === 'pic' && !hasE ? 'word' : k;
      });
      var cards = [];
      chosen.forEach(function (c, i) {
        var ch = D.chars[c], k = kinds[i], w = ch.words.filter(function (x) { return x.length === 2; })[0] || ch.words[0];
        cards.push({ pair: i, kind: 'char', c: c });
        cards.push({ pair: i, kind: k, c: c, w: w });
      });
      cards = shuffle(cards);
      ctx.setSegs(pairsN);
      var grid = h('div', { class: 'mgrid n' + cards.length });
      var els = cards.map(function (cd, idx) {
        var front;
        if (cd.kind === 'char') front = h('b', { class: 'mf-c' }, cd.c);
        else if (cd.kind === 'py') front = h('b', { class: 'mf-py' }, D.chars[cd.c].p);
        else if (cd.kind === 'pic') front = h('span', { class: 'mf-e' }, D.chars[cd.c].e);
        else front = h('b', { class: 'mf-w' }, cd.w.split('').map(function (x) { return h('span', { class: x === cd.c ? 'hl' : '' }, x); }));
        var el = h('button', { class: 'mcard', 'aria-label': '牌' }, h('div', { class: 'mc-in' }, h('div', { class: 'mc-back' }, h('i'), h('i'), h('i')), h('div', { class: 'mc-front k-' + cd.kind }, front)));
        el.onclick = function () { MZ.sfx.tap(); flip(idx); };
        return el;
      });
      els.forEach(function (e) { grid.appendChild(e); });
      ctx.area.appendChild(grid);
      var first = -1, lock = false, matched = 0, moves = 0, assisted = {}, timers = [];
      ctx.curSeg(0);
      function flip(i) {
        var cd = cards[i];
        if (lock || cd.open || cd.done) return;
        cd.open = true; els[i].classList.add('open'); MZ.sfx.flip();
        if (first < 0) { first = i; return; }
        var a = first, b = i; first = -1; moves++; ctx.stats.moves = moves;
        if (cards[a].pair === cards[b].pair) {
          lock = true;
          timers.push(later(function () {
            cards[a].done = cards[b].done = true; els[a].classList.add('done'); els[b].classList.add('done');
            var c = cards[a].c, att = ctx.begin(c); if (assisted[cards[a].pair]) att.assisted = true;
            ctx.hit(att); ctx.markSeg(matched, !att.assisted); matched++;
            MZ.speak(MZ.say(c)); lock = false;
            if (matched === pairsN) timers.push(later(end, 900)); else ctx.curSeg(matched);
          }, 380));
        } else {
          lock = true; ctx.slip(); MZ.sfx.bad();
          timers.push(later(function () {
            cards[a].open = cards[b].open = false; els[a].classList.remove('open'); els[b].classList.remove('open'); lock = false;
          }, 950));
        }
      }
      ctx.onHint = function () {
        if (lock) return;
        var pairIdx = -1;
        if (first >= 0) pairIdx = cards[first].pair;
        else { var left = []; for (var i = 0; i < pairsN; i++) { if (!cards.some(function (c) { return c.pair === i && c.done; })) left.push(i); } pairIdx = pick(left); }
        if (pairIdx < 0) return;
        if (!ctx.hint(null)) return;
        assisted[pairIdx] = true; lock = true;
        var idxs = []; cards.forEach(function (c, i) { if (c.pair === pairIdx && !c.done) idxs.push(i); });
        var wasOpen = idxs.map(function (i) { return cards[i].open; });
        idxs.forEach(function (i) { els[i].classList.add('open', 'peek'); });
        timers.push(later(function () {
          idxs.forEach(function (i, k) { els[i].classList.remove('peek'); if (!wasOpen[k]) els[i].classList.remove('open'); });
          lock = false;
        }, 1500));
      };
      function end() {
        var eff = Math.min(1, pairsN * 1.5 / Math.max(moves, pairsN));
        var bonus = Math.max(0, pairsN * 3 - (moves - pairsN) * 2);
        ctx.finish({ acc: eff, score: ctx.stats.score + bonus, lines: ['翻了 ' + moves + ' 次，配成 ' + pairsN + ' 对（最少只要 ' + pairsN + ' 次）'] });
      }
      ctx.onLeave(function () { timers.forEach(clearTimeout); });
    },
  });

  /* ======================================================
     2. 泡泡乐：听音 / 看拼音 / 补句子，戳破对的泡泡
     ====================================================== */
  MZ.regGame({
    id: 'bubble', name: '泡泡乐', emoji: '🎈', color: 'sky', desc: '听一听，戳破对的泡泡',
    how: '墨墨会让你找一个字：有时是听声音，有时是看拼音，有时是补全句子。找到它，把对的泡泡戳破！戳到别的泡泡会变灰，别着急。',
    tiers: ['听声音找字，4 个泡泡', '听声音或看拼音，6 个泡泡，有长得像的字', '补句子、看拼音、听声音混合，8 个泡泡'], rounds: [8, 10, 12], minPool: 12,
    run: function (ctx) {
      var N = ctx.N, tier = ctx.tier, nb = [4, 6, 8][tier - 1], i = 0, timers = [], att = null;
      var targets = ctx.pick(N, tier >= 3 ? { need: function (c) { return !!D.chars[c].sent; } } : null);
      ctx.setSegs(N);
      var stage = h('div', { class: 'bb-prompt' }), field = h('div', { class: 'bb-field n' + nb });
      ctx.area.appendChild(stage); ctx.area.appendChild(field);
      function round() {
        if (i >= N) return ctx.finish({});
        ctx.curSeg(i);
        var c = targets[i], ch = D.chars[c], mode = tier === 1 ? 'audio' : tier === 2 ? pick(['pinyin', 'audio', 'pinyin']) : pick(['sent', 'sent', 'pinyin', 'audio']);
        att = ctx.begin(c);
        var opts;
        if (mode === 'sent') opts = MZ.distract(c, nb - 1, { pool: ctx.pool, bad: ch.sb, diffPos: true, sim: true, simN: 2 });
        else opts = MZ.distract(c, nb - 1, { pool: ctx.pool, diffSound: true, sim: tier >= 2, simN: tier === 2 ? 1 : 2 });
        opts = shuffle(opts.concat([c]));
        MZ.clear(stage); MZ.clear(field);
        if (mode === 'audio') {
          stage.appendChild(h('div', { class: 'bb-q' }, h('b', null, '听一听，戳破这个字的泡泡'), h('button', { class: 'icon-btn big', 'aria-label': '再听一遍', onclick: tap(function () { MZ.speak(MZ.say(c)); }) }, icon('speaker'))));
          timers.push(speakSoon(MZ.say(c), 350));
        } else if (mode === 'pinyin') {
          stage.appendChild(h('div', { class: 'bb-q' }, h('b', null, '戳破读'), h('span', { class: 'bb-py' }, ch.p), h('b', null, '的字'), h('button', { class: 'icon-btn big', 'aria-label': '听一听', onclick: tap(function () { MZ.speak(MZ.say(c)); }) }, icon('speaker'))));
        } else {
          stage.appendChild(h('div', { class: 'bb-q col' }, h('b', null, '补上缺的字，戳破它'), MZ.ruby(ch.sent, ch.sp, { blank: function (k) { return k === ch.sent.indexOf(c); }, tap: false, cls: 'xl' })));
        }
        var btns = opts.map(function (x, k) {
          var b = h('button', { class: 'bub b' + (k % 6), style: { animationDelay: (-Math.random() * 3).toFixed(2) + 's', animationDuration: (3 + Math.random() * 2).toFixed(2) + 's' }, onclick: tap(function () { choose(x, b); }) }, h('span', null, x));
          b._x = x; return b;
        });
        btns.forEach(function (b) { field.appendChild(b); });
        function choose(x, b) {
          if (att.done || b.disabled) return;
          if (x === c) {
            ctx.hit(att);
            ctx.markSeg(i, att.wrongs === 0 && !att.assisted);
            b.classList.add('pop'); MZ.sfx.pop();
            btns.forEach(function (o) { if (o !== b) o.classList.add('away'); });
            ctx.say('cheer', MZ.pick(MZ.PRAISE));
            timers.push(later(function () { MZ.speak(mode === 'sent' ? ch.sent : MZ.say(c)); }, 250));
            i++; timers.push(later(round, mode === 'sent' ? 1800 : 1100));
          } else {
            ctx.miss(att); b.disabled = true; b.classList.add('wrong'); ctx.say('oops', '再找找看');
            if (att.wrongs >= 2 && !att.assisted) { att.assisted = true; glow(); }
          }
        }
        function glow() { btns.forEach(function (b) { if (b._x === c) b.classList.add('glow'); }); }
        ctx.onHint = function () { if (att.done) return; if (ctx.hint(att)) glow(); };
      }
      round();
      ctx.onLeave(function () { timers.forEach(clearTimeout); });
    },
  });

  /* ======================================================
     3. 青蛙过河：补全词语 / 句子，帮小青蛙跳过荷叶
     ====================================================== */
  MZ.regGame({
    id: 'frog', name: '青蛙过河', emoji: '🐸', color: 'teal', desc: '补上缺的字，帮青蛙过河',
    how: '题目里缺了一个字，请选对荷叶，帮小青蛙跳过去。选到别的荷叶会沉一下，小青蛙会再试一次。',
    tiers: ['补全词语，3 片荷叶', '补全词语，4 片荷叶，有长得像的字', '补全句子，4 片荷叶'], rounds: [5, 6, 8], minPool: 12,
    run: function (ctx) {
      var N = ctx.N, tier = ctx.tier, i = 0, timers = [], att = null;
      var targets = ctx.pick(N);
      ctx.setSegs(N);
      var qbox = h('div', { class: 'fr-q' }), river = h('div', { class: 'fr-river' }), path = h('div', { class: 'fr-path' });
      var frog = h('div', { class: 'fr-frog' }, h('span', null, '🐸'));
      var stones = [];
      for (var k = 0; k <= N; k++) {
        var st = h('i', { class: 'fr-stone' + (k === 0 ? ' start' : k === N ? ' end' : ''), style: { left: (k / N * 100).toFixed(2) + '%' } }, k === N ? '🏁' : '');
        stones.push(st); path.appendChild(st);
      }
      path.appendChild(frog);
      ctx.area.appendChild(qbox); ctx.area.appendChild(river); ctx.area.appendChild(path);
      function place(idx) { frog.style.left = (idx / N * 100).toFixed(2) + '%'; }
      place(0);
      function round() {
        if (i >= N) return ctx.finish({});
        ctx.curSeg(i);
        var c = targets[i];
        var q = tier === 3 ? MZ.Q.sentfill(c, ctx.pool, { sim: true, simN: 2 }) : MZ.Q.wordfill(c, ctx.pool, { sim: tier === 2, simN: 2 });
        var pads = tier === 1 ? 3 : 4, correct = q.opts[q.ans];
        var wrongs = q.opts.filter(function (x, k2) { return k2 !== q.ans; }).slice(0, pads - 1);
        var opts = shuffle(wrongs.concat([correct]));
        att = ctx.begin(c);
        MZ.clear(qbox); MZ.clear(river);
        if (q.big) qbox.appendChild(h('div', { class: 'qbig kai' }, q.big.text));
        else qbox.appendChild(MZ.ruby(q.ruby.text, q.ruby.py, { blank: function (k2) { return k2 === q.ruby.blank; }, tap: false, cls: 'xl' }));
        var btns = opts.map(function (x, k2) {
          var b = h('button', { class: 'pad p' + (k2 % 4), onclick: tap(function () { choose(x, b); }) }, h('span', null, x)); b._x = x; return b;
        });
        btns.forEach(function (b) { river.appendChild(b); });
        function choose(x, b) {
          if (att.done || b.disabled) return;
          if (x === correct) {
            ctx.hit(att); ctx.markSeg(i, att.wrongs === 0 && !att.assisted);
            b.classList.add('ok'); btns.forEach(function (o) { if (o !== b) o.classList.add('away'); });
            frog.classList.add('hop'); place(i + 1); MZ.sfx.pop();
            timers.push(later(function () { frog.classList.remove('hop'); MZ.speak(q.after); }, 420));
            ctx.say('cheer', MZ.pick(MZ.PRAISE));
            i++; timers.push(later(round, tier === 3 ? 2000 : 1500));
          } else {
            ctx.miss(att); b.disabled = true; b.classList.add('sink'); MZ.sfx.splash();
            frog.classList.remove('shake'); void frog.offsetWidth; frog.classList.add('shake');
            if (att.wrongs >= 2 && !att.assisted) { att.assisted = true; glow(); }
          }
        }
        function glow() { btns.forEach(function (b) { if (b._x === correct) b.classList.add('glow'); }); }
        ctx.onHint = function () { if (att.done) return; if (ctx.hint(att)) glow(); };
      }
      round();
      ctx.onLeave(function () { timers.forEach(clearTimeout); });
    },
  });

  // 字宝分家的“类别”：每一类由若干个识字分组合并而成。SORTBAD 里的两类意思容易混（比如“植物”和“吃的”都能放“米”），不会同时出现。
  var SORTCATS = [
    { k: 'num', t: '数字', e: '🔢', g: ['数字', '数目大小'] },
    { k: 'body', t: '身体', e: '🧍', g: ['身体', '身体二'] },
    { k: 'family', t: '家人亲戚', e: '👪', g: ['家人', '亲朋好友'] },
    { k: 'animal', t: '动物', e: '🐶', g: ['动物', '走兽飞禽', '小虫海鲜'] },
    { k: 'plant', t: '植物', e: '🌿', g: ['植物', '草木'] },
    { k: 'food', t: '吃的', e: '🍚', g: ['好吃的', '水果蔬菜'] },
    { k: 'color', t: '颜色', e: '🎨', g: ['颜色', '颜色二'] },
    { k: 'dir', t: '方位', e: '🧭', g: ['方位', '方向', '位置'] },
    { k: 'time', t: '时间', e: '⏰', g: ['时间', '时间二'] },
    { k: 'home', t: '家里的东西', e: '🏠', g: ['家里的东西'] },
    { k: 'wear', t: '穿戴', e: '👕', g: ['穿戴'] },
    { k: 'toy', t: '玩具游戏', e: '🧸', g: ['玩具游戏'] },
    { k: 'weather', t: '天气', e: '⛅', g: ['天气', '天气二'] },
    { k: 'nature', t: '大自然', e: '🏞️', g: ['自然', '水和大地', '山川泉池'] },
    { k: 'school', t: '学校', e: '🏫', g: ['学校', '教室', '课本里'] },
    { k: 'city', t: '城市', e: '🏙️', g: ['城市', '路上'] },
  ];
  var SORTBAD = {};
  ['plant|food', 'nature|weather', 'time|weather', 'time|nature', 'home|school', 'body|family', 'animal|food', 'num|time'].forEach(function (x) { SORTBAD[x] = 1; });

  /* ======================================================
     4. 字宝分家：把字宝宝送进对的篮子
     ====================================================== */
  MZ.regGame({
    id: 'sort', name: '字宝分家', emoji: '🧺', color: 'sun', desc: '把字宝宝送回它们的家',
    how: '每次出来一个字，请把它放进对的篮子里。有时按“它属于哪一类”分，高级的还要按声调或偏旁分。放进别的篮子会弹回来，再试一次。',
    tiers: ['2 个篮子：按类别分', '3 个篮子：按类别分', '3~4 个篮子：按声调或偏旁分'], rounds: [10, 12, 14], minPool: 12,
    run: function (ctx) {
      var N = ctx.N, tier = ctx.tier, i = 0, timers = [], att = null;
      var plan = makePlan();
      var items = plan.items;
      ctx.setSegs(items.length);
      var card = h('div', { class: 'so-card' }), baskets = h('div', { class: 'so-baskets k' + plan.baskets.length });
      var info = h('div', { class: 'so-info' }, plan.title);
      ctx.area.appendChild(info); ctx.area.appendChild(card); ctx.area.appendChild(baskets);
      var bEls = plan.baskets.map(function (b, k) {
        var el = h('button', { class: 'basket bk' + (k % 4), onclick: tap(function () { choose(k, el); }) },
          h('span', { class: 'b-e' }, b.emoji), h('b', null, b.label), b.sub ? h('i', null, b.sub) : null, h('em', { class: 'b-n' }, '0'));
        el._n = 0; return el;
      });
      bEls.forEach(function (e) { baskets.appendChild(e); });
      function makePlan() {
        var s = S.get(), kBask = tier === 1 ? 2 : 3, mode = 'group';
        if (tier === 3) {
          var withR = MZ.core.filter(function (c) { return D.chars[c].r != null; });
          var byR = {}; withR.forEach(function (c) { (byR[D.chars[c].r] = byR[D.chars[c].r] || []).push(c); });
          var rIdx = Object.keys(byR).filter(function (k) { return byR[k].length >= 4; });
          mode = (rIdx.length >= 3 && Math.random() < 0.4) ? 'radical' : 'tone';
          if (mode === 'radical') {
            var rs = shuffle(rIdx).slice(0, 3), per = Math.ceil(N / 3), its = [];
            rs.forEach(function (r, bi) { MZ.pickN(byR[r], Math.min(per, byR[r].length)).forEach(function (c) { its.push({ c: c, b: bi }); }); });
            return { title: '按偏旁分一分', items: shuffle(its).slice(0, N), baskets: rs.map(function (r) { var R = D.radicals[+r]; return { label: R.f, sub: R.n, emoji: '🧺' }; }) };
          }
          var tones = [1, 2, 3, 4], per2 = Math.ceil(N / 4), its2 = [];
          tones.forEach(function (t, bi) {
            var cs = ctx.pool.filter(function (c) { return MZ.toneOf(D.chars[c].p) === t; });
            if (cs.length < per2) cs = cs.concat(MZ.core.filter(function (c) { return MZ.toneOf(D.chars[c].p) === t && cs.indexOf(c) < 0; }).slice(0, per2));
            MZ.pickN(cs, Math.min(per2, cs.length)).forEach(function (c) { its2.push({ c: c, b: bi }); });
          });
          return { title: '按声调分一分（点字旁边的喇叭可以听）', tone: true, items: shuffle(its2).slice(0, N),
            baskets: tones.map(function (t) { return { label: ['ā', 'á', 'ǎ', 'à'][t - 1], sub: MZ.TONE_NAMES[t], emoji: '🧺' }; }) };
        }
        // 按类别：只用意思清楚、互不重叠的大类（有可能混淆的类别不会同时出现在一局里）
        var poolSet = {}; ctx.pool.forEach(function (c) { poolSet[c] = 1; });
        var cats = SORTCATS.map(function (ct) {
          var cs = []; ct.g.forEach(function (gn) { D.groups.forEach(function (gg) { if (gg.name === gn) cs = cs.concat(gg.chars); }); });
          return { ct: ct, chars: cs, n: Math.min(6, cs.filter(function (c) { return poolSet[c]; }).length) };
        }).filter(function (x) { return x.chars.length >= 6; });
        cats = shuffle(cats); cats.sort(function (x, y) { return y.n - x.n; });          // 偏向学过的字更多的类别
        var chosenC = [];
        cats.forEach(function (x) {
          if (chosenC.length < kBask && chosenC.every(function (y) { return !SORTBAD[x.ct.k + '|' + y.ct.k] && !SORTBAD[y.ct.k + '|' + x.ct.k]; })) chosenC.push(x);
        });
        var per3 = Math.ceil(N / kBask), its3 = [];
        chosenC.forEach(function (x, bi) {
          var inP = shuffle(x.chars.filter(function (c) { return poolSet[c]; })), outP = shuffle(x.chars.filter(function (c) { return !poolSet[c]; }));
          inP.concat(outP).slice(0, per3).forEach(function (c) { its3.push({ c: c, b: bi }); });
        });
        return { title: '它属于哪一类？', items: shuffle(its3).slice(0, N), baskets: chosenC.map(function (x) { return { label: x.ct.t, emoji: x.ct.e }; }) };
      }
      function showItem() {
        if (i >= items.length) return ctx.finish({});
        ctx.curSeg(i);
        var it = items[i], ch = D.chars[it.c]; att = ctx.begin(it.c);
        MZ.clear(card);
        card.classList.remove('fly', 'in'); void card.offsetWidth; card.classList.add('in');
        card.appendChild(h('b', { class: 'so-c' }, it.c));
        if (plan.tone) card.appendChild(h('button', { class: 'icon-btn spk sm', 'aria-label': '听一听', onclick: tap(function () { MZ.speak(MZ.say(it.c)); }) }, icon('speaker')));
        else card.appendChild(h('i', { class: 'so-py' }, ch.p));
        if (plan.tone) timers.push(speakSoon(MZ.say(it.c), 300));
        bEls.forEach(function (e) { e.classList.remove('glow', 'bad'); });
      }
      function choose(k, el) {
        if (!att || att.done) return;
        var it = items[i];
        if (k === it.b) {
          ctx.hit(att); ctx.markSeg(i, att.wrongs === 0 && !att.assisted);
          el._n++; el.querySelector('.b-n').textContent = String(el._n); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
          card.classList.add('fly'); MZ.sfx.pop();
          if (!plan.tone) MZ.speak(MZ.say(it.c));
          i++; timers.push(later(showItem, 520));
        } else {
          ctx.miss(att); el.classList.add('bad'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
          timers.push(later(function () { el.classList.remove('bad'); }, 500));
          if (att.wrongs >= 2 && !att.assisted) { att.assisted = true; bEls[it.b].classList.add('glow'); }
        }
      }
      ctx.onHint = function () { if (!att || att.done) return; if (ctx.hint(att)) bEls[items[i].b].classList.add('glow'); };
      showItem();
      ctx.onLeave(function () { timers.forEach(clearTimeout); });
    },
  });

  /* ======================================================
     5. 火眼金睛：找出和别人不一样的字
     ====================================================== */
  MZ.regGame({
    id: 'odd', name: '火眼金睛', emoji: '🔍', color: 'grape', desc: '找出那个不一样的字',
    how: '这里有好多字，其中只有一个和别的不一样。睁大眼睛，把它找出来！越到后面，长得越像，越要仔细看。',
    tiers: ['6 个字，差别很明显', '12 个字，有长得像的字', '20 个字，长得非常像'], rounds: [6, 8, 10], minPool: 12,
    run: function (ctx) {
      var N = ctx.N, tier = ctx.tier, i = 0, timers = [], att = null;
      var tiles = [6, 12, 20][tier - 1];
      var targets = ctx.pick(N, tier >= 2 ? { need: function (c) { return !!D.chars[c].sim; } } : null);
      var havSim = targets.filter(function (c) { return D.chars[c].sim; }).length;
      if (tier >= 2 && havSim < N) {          // 学过的字里长得像的不够，从全部字里补
        var more = MZ.pickN(MZ.core.filter(function (c) { return D.chars[c].sim && targets.indexOf(c) < 0; }), N - targets.length);
        targets = targets.concat(more).slice(0, N);
      }
      ctx.setSegs(N);
      var prompt = h('div', { class: 'od-q' }, h('b', null, '找出那个不一样的字'));
      var grid = h('div', { class: 'od-grid t' + tiles }), explain = h('div', { class: 'od-ex' });
      ctx.area.appendChild(prompt); ctx.area.appendChild(grid); ctx.area.appendChild(explain);
      function baseFor(c) {
        var ch = D.chars[c], n = ch.n;
        if (tier >= 2 && ch.sim) {
          var sims = ch.sim.split('').filter(function (x) { return D.chars[x]; });
          if (tier === 3) { var close = sims.filter(function (x) { return Math.abs(D.chars[x].n - n) <= 1; }); if (close.length) sims = close; }
          return pick(sims);
        }
        var far = MZ.core.filter(function (x) { return x !== c && Math.abs(D.chars[x].n - n) >= 3; });
        return pick(far);
      }
      function round() {
        if (i >= N) return ctx.finish({});
        ctx.curSeg(i);
        var c = targets[i], base = baseFor(c); att = ctx.begin(c, true);
        MZ.clear(grid); MZ.clear(explain);
        var oddAt = Math.floor(Math.random() * tiles), els = [];
        for (var k = 0; k < tiles; k++) {
          (function (k) {
            var isOdd = k === oddAt, b = h('button', { class: 'otile', onclick: tap(function () { choose(isOdd, b); }) }, h('span', null, isOdd ? c : base));
            b._odd = isOdd; els.push(b); grid.appendChild(b);
          })(k);
        }
        function choose(isOdd, b) {
          if (att.done || b.disabled) return;
          if (isOdd) {
            ctx.hit(att); ctx.markSeg(i, att.wrongs === 0 && !att.assisted);
            b.classList.add('found'); els.forEach(function (o) { if (o !== b) o.classList.add('dim'); });
            explain.textContent = '找到啦！它是“' + c + '”（' + D.chars[c].p + '），别的都是“' + base + '”（' + D.chars[base].p + '）。';
            ctx.say('cheer', MZ.pick(MZ.PRAISE)); MZ.sfx.pop();
            timers.push(later(function () { MZ.speak(MZ.say(c)); }, 250));
            i++; timers.push(later(round, 2100));
          } else {
            ctx.miss(att); b.disabled = true; b.classList.add('wrong');
            if (att.wrongs >= 2 && !att.assisted) { att.assisted = true; els.forEach(function (o) { if (o._odd) o.classList.add('glow'); }); }
          }
        }
        ctx.onHint = function () {
          if (att.done) return;
          if (!ctx.hint(att)) return;
          var others = els.filter(function (o) { return !o._odd && !o.disabled; }), drop = shuffle(others).slice(0, Math.ceil(others.length / 2));
          drop.forEach(function (o) { o.classList.add('dim'); o.disabled = true; });
        };
      }
      round();
      ctx.onLeave(function () { timers.forEach(clearTimeout); });
    },
  });

  /* ======================================================
     6. 闪电快答：限时抢答，越快越多越好
     ====================================================== */
  MZ.regGame({
    id: 'blitz', name: '闪电快答', emoji: '⚡', color: 'coral', desc: '一分钟限时抢答',
    how: '时间到之前，答对越多越好！答对一个就马上出下一题，连续答对还能加时间。答不上来也没关系，继续往下答。',
    tiers: ['60 秒：看字选拼音，3 个选项', '45 秒：看字选拼音、听音选字', '30 秒：补词语、补句子、听音选字'], rounds: null, minPool: 12,
    run: function (ctx) {
      var tier = ctx.tier, total = [60, 45, 30][tier - 1] * 1000, remain = total, last = Date.now(), timers = [], iv = null, qn = 0, over = false;
      var att = null, locked = false;
      ctx.setSegs(0);
      var area = ctx.area, tb = ctx.timeBar; tb.style.display = ''; var tfill = tb.querySelector('i');
      var holder = h('div', { class: 'bl-wrap' });
      area.appendChild(holder);
      function nextQ() {
        if (over) return;
        var c = ctx.pick(1)[0], q, kind;
        if (tier === 1) kind = 'pinyin';
        else if (tier === 2) kind = pick(['pinyin', 'listen', 'listen']);
        else kind = pick(['wordfill', 'sentfill', 'listen', 'wordfill']);
        var o = { sim: tier >= 2, simN: 2 };
        q = MZ.Q[kind](c, ctx.pool, o);
        if (tier === 1) { var cor = q.opts[q.ans]; var wr = q.opts.filter(function (x, k) { return k !== q.ans; }).slice(0, 2); q.opts = shuffle(wr.concat([cor])); q.ans = q.opts.indexOf(cor); }
        att = ctx.begin(c); locked = false; qn++;
        MZ.clear(holder);
        var fit = h('div', { class: 'qfit bl-q' });
        fit.appendChild(h('div', { class: 'qprompt' }, q.prompt, q.speak ? ui.speakBtn(q.speak, 'sm') : null));
        var big = null;
        if (q.big) big = h('div', { class: 'qbig' + (q.big.kai ? ' kai' : '') }, q.big.text);
        else if (q.ruby) big = MZ.ruby(q.ruby.text, q.ruby.py, { blank: function (k) { return k === q.ruby.blank; }, tap: false, cls: 'xl' });
        if (big) fit.appendChild(h('div', { class: 'qstage' }, big));
        var opts = h('div', { class: 'qopts ' + (q.opts.length === 3 ? 'three' : 'four') });
        q.opts.forEach(function (x, k) {
          var b = h('button', { class: 'opt ' + (q.optKind === 'char' ? 'char' : q.optKind === 'py' ? 'py' : 'text'), onclick: tap(function () { answer(k, b, q, opts); }) }, String(x));
          opts.appendChild(b);
        });
        fit.appendChild(opts);
        holder.appendChild(fit);
        if (q.autoSpeak && q.speak) timers.push(later(function () { if (!over) MZ.speak(q.speak); }, 250));
        ctx.onHint = function () {
          if (locked || att.done) return;
          if (!ctx.hint(att)) return;
          opts.children[q.ans].classList.add('glow');
        };
      }
      function answer(k, b, q, opts) {
        if (locked || over) return;
        if (k === q.ans) {
          locked = true; var before = ctx.stats.combo; ctx.hit(att); b.classList.add('right');
          if (ctx.stats.combo > 0 && ctx.stats.combo % 5 === 0) { remain = Math.min(total, remain + (tier === 3 ? 1500 : 2500)); ctx.say('cheer', '加时间！'); }
          timers.push(later(nextQ, 260));
        } else {
          ctx.miss(att); b.classList.add('wrong'); b.disabled = true;
          if (att.wrongs >= 2) { opts.children[q.ans].classList.add('glow'); }
        }
      }
      function tick() {
        var now = Date.now(); remain -= (now - last); last = now;
        var pct = Math.max(0, remain / total);
        tfill.style.width = (pct * 100).toFixed(1) + '%';
        tb.classList.toggle('low', remain < 8000);
        if (remain <= 0 && !over) end();
      }
      function end() {
        over = true; clearInterval(iv);
        var st = ctx.stats, n = st.right + st.wrong, acc = n ? st.right / n : 0;
        var th = [[7, 11], [8, 13], [8, 12]][tier - 1], stars = st.right >= th[1] ? 3 : st.right >= th[0] ? 2 : 1;
        if (acc < 0.6) stars = Math.min(stars, 1); else if (acc < 0.8) stars = Math.min(stars, 2);
        ctx.finish({ acc: acc, stars: stars, lines: ['时间到！答对 ' + st.right + ' 个，答了 ' + n + ' 个'] });
      }
      nextQ();
      iv = setInterval(tick, 100);
      ctx.onLeave(function () { over = true; clearInterval(iv); timers.forEach(clearTimeout); tb.style.display = 'none'; });
    },
  });
})();
