/* 墨点识字 · 小游戏（第三批）：墨墨跑酷
   玩法：小主人（小朋友自己选的、穿着自己买的装扮）自动往前跑，点一下屏幕就跳。
   路上有“字门”：一道门里有两个答案，一个在地上、一个在天上——想选地上的就继续跑，想选天上的就跳起来。
   选对了得分、字宝宝记得更牢；选错了会听到正确读音，这个字之后会多出现几次。
   路上的石头要跳过去，星星可以顺路吃。没有“失败”，一局大约一分钟。 */
(function () {
  'use strict';
  var MZ = window.MZ, h = MZ.h, S = MZ.S, ui = MZ.ui, AV = MZ.AV;
  var shuffle = MZ.shuffle, pick = MZ.pick;

  /* ---------- 原创小插画（SVG 数据，用到时才生成一次） ---------- */
  function uri(svg) { return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")'; }
  var ART = null;
  function art() {
    if (ART) return ART;
    var far = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" preserveAspectRatio="none"><path d="M0 300 L0 190 C150 120 300 120 420 180 C540 240 660 110 800 130 C950 150 1050 230 1200 190 L1200 300Z" fill="#BDEBB6"/></svg>';
    var trees = '';
    [[130, 1], [330, 0.8], [560, 1.1], [760, 0.9], [990, 1], [1120, 0.75]].forEach(function (t) {
      trees += '<g transform="translate(' + t[0] + ' 262) scale(' + t[1] + ')"><rect x="-5" y="-24" width="10" height="34" rx="4" fill="#9A6B3E"/><circle cx="0" cy="-40" r="26" fill="#58B968"/><circle cx="-14" cy="-28" r="16" fill="#6CCB7A"/><circle cx="15" cy="-30" r="15" fill="#4FAE5F"/></g>';
    });
    var near = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" preserveAspectRatio="none"><path d="M0 300 L0 230 C100 190 220 190 330 235 C450 280 560 190 700 200 C840 210 960 270 1200 230 L1200 300Z" fill="#8ED68B"/>' + trees + '</svg>';
    function cloud(x, y, s) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="#fff" opacity=".92"><ellipse cx="0" cy="0" rx="46" ry="20"/><ellipse cx="-26" cy="-12" rx="26" ry="18"/><ellipse cx="14" cy="-20" rx="30" ry="22"/><ellipse cx="38" cy="-4" rx="24" ry="14"/></g>'; }
    var clouds = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" preserveAspectRatio="none">' + cloud(160, 90, 1) + cloud(560, 160, 0.8) + cloud(900, 70, 1.15) + '</svg>';
    var tufts = '', dots = '', i;
    for (i = 0; i < 12; i++) { var x = 50 + i * 98; tufts += '<path d="M' + x + ' 34 q3 -14 6 0 q3 -12 6 0 q3 -12 6 0" stroke="#3FA250" stroke-width="3" fill="none" stroke-linecap="round"/>'; }
    for (i = 0; i < 14; i++) { dots += '<ellipse cx="' + (30 + i * 85 + (i % 3) * 14) + '" cy="' + (78 + (i % 4) * 14) + '" rx="' + (5 + (i % 3) * 2) + '" ry="3.4" fill="#B67842"/>'; }
    var ground = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 160" preserveAspectRatio="none"><rect width="1200" height="160" fill="#CF9660"/><rect width="1200" height="46" fill="#6FD05F"/><rect y="38" width="1200" height="10" fill="#4FB147"/>' + tufts + dots + '</svg>';
    ART = { far: uri(far), near: uri(near), clouds: uri(clouds), ground: uri(ground) };
    return ART;
  }
  // 路上的障碍：石头、灌木、木头、小蘑菇（w/h 是相对尺寸）
  var OBS = [
    { w: 1.0, h: 0.62, svg: '<svg viewBox="0 0 60 38"><path d="M4 36 C2 20 12 6 30 5 C48 5 58 20 56 36Z" fill="#9AA3B8" stroke="#6D7690" stroke-width="2.4" stroke-linejoin="round"/><path d="M14 22 C16 14 22 11 28 11" stroke="#C9D0E2" stroke-width="3" fill="none" stroke-linecap="round"/></svg>' },
    { w: 1.0, h: 0.66, svg: '<svg viewBox="0 0 60 40"><g fill="#46B25A" stroke="#2E8A43" stroke-width="2.2"><circle cx="18" cy="26" r="13"/><circle cx="40" cy="25" r="14"/><circle cx="29" cy="15" r="13"/></g><circle cx="22" cy="12" r="2.4" fill="#FF7A8A"/><circle cx="38" cy="22" r="2.4" fill="#FF7A8A"/></svg>' },
    { w: 1.2, h: 0.5, svg: '<svg viewBox="0 0 70 34"><rect x="3" y="6" width="64" height="26" rx="10" fill="#B9794A" stroke="#7E4E2A" stroke-width="2.4"/><ellipse cx="62" cy="19" rx="5" ry="10" fill="#E3B27C" stroke="#7E4E2A" stroke-width="2"/><path d="M12 14 H48 M16 22 H40" stroke="#8E5C34" stroke-width="2.2" stroke-linecap="round"/></svg>' },
    { w: 0.8, h: 0.72, svg: '<svg viewBox="0 0 48 40"><rect x="18" y="20" width="12" height="18" rx="5" fill="#F4E9D3" stroke="#B9A98A" stroke-width="2"/><path d="M3 22 C4 8 16 3 24 3 C34 3 45 9 45 22Z" fill="#EF5B5B" stroke="#B93C3C" stroke-width="2.2"/><circle cx="14" cy="14" r="3.6" fill="#fff"/><circle cx="29" cy="10" r="3" fill="#fff"/><circle cx="36" cy="17" r="2.6" fill="#fff"/></svg>' },
  ];
  var STAR = '<svg viewBox="0 0 24 24"><path d="M12 2.2l3.1 6.6 7.2.9-5.3 4.9 1.4 7.1L12 18.1 5.6 21.7 7 14.6 1.7 9.7l7.2-.9z" fill="#FFCB2E" stroke="#E29A00" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  /* ---------- 注册 ---------- */
  var def = {
    id: 'run', name: '墨墨跑酷', emoji: '🏃', color: 'sky', desc: '带着你的小主人跑起来！跳一跳，吃对字',
    how: '你的小主人会自己往前跑，点一下屏幕就能跳起来！前面会有“字门”，里面有两个答案：一个在地上，一个在天上。想选地上的就继续跑，想选天上的就跳起来！路上的石头要跳过去，星星可以顺路吃。',
    tiers: ['慢慢跑：听声音选字、读拼音', '跑快点：加上补全词语，障碍多一些', '飞速跑：补全句子，字门里有长得像的字'], rounds: [6, 8, 10], minPool: 12,
    run: function (ctx) { run(ctx); },
  };
  MZ.regGame(def);
  // 跑酷放在大厅第一位（主推的玩法）
  MZ.GAMES.splice(MZ.GAMES.indexOf(def), 1); MZ.GAMES.unshift(def);

  function run(ctx) {
    var N = ctx.N, tier = ctx.tier;
    // v：每秒跑多少个“屏幕宽”；gap：两道字门隔几秒；first：第一道门几秒后到；lead：提前几秒出题；obs：两道门之间的石头数
    var P = [
      { v: 0.30, gap: 8.6, first: 9.0, lead: 5.6, obs: [1, 2] },
      { v: 0.36, gap: 7.6, first: 8.2, lead: 5.0, obs: [1, 2] },
      { v: 0.42, gap: 7.0, first: 7.6, lead: 4.6, obs: [1, 2] },
    ][tier - 1];
    // 画面比例（都是“场景高度 H”的几分之几）：地面线、小人高度、泡泡半径、泡泡离地高度、跳的最高点、滞空时间
    var GY = 0.80, HERO_H = 0.30, R = 0.105, LOW_Y = 0.13, AIR_Y = 0.46, HJ = 0.32, JT = 0.78, THR = 0.12;
    var G = 8 * HJ / (JT * JT), V0 = G * JT / 2;
    var A = art();

    ctx.area.classList.add('rn-area');
    var scene = h('div', { class: 'rn-scene' });
    var sky = h('div', { class: 'rn-sky' });
    var wear = S.get().wear || {};
    sky.style.background = wear.bg ? AV.bgCss(wear.bg) : 'linear-gradient(180deg, #8EDBFF 0%, #CFF0FF 52%, #EAF9F0 100%)';
    function layer(cls, img) { var el = h('div', { class: 'rn-l ' + cls }); el.style.backgroundImage = img; return el; }
    var lClouds = layer('clouds', A.clouds), lFar = layer('far', A.far), lNear = layer('near', A.near), lGround = layer('ground', A.ground);
    var world = h('div', { class: 'rn-world' });
    var shadow = h('i', { class: 'rn-shadow' });
    var hero = h('div', { class: 'rn-hero' }, MZ.mascot('happy', 100, { run: true, still: true }));
    var banner = h('div', { class: 'rn-banner' });
    var tip = h('div', { class: 'rn-tip' }, h('span', null, '👆'), h('b', null, '点一下屏幕，跳起来！'));
    var ready = h('div', { class: 'rn-ready' }, '准备…');
    var prog = h('div', { class: 'rn-prog' }, h('i'), h('span', null, '🏁'));
    scene.appendChild(sky);
    [lClouds, lFar, lNear, lGround].forEach(function (l) { scene.appendChild(l); });
    [world, shadow, hero, banner, prog].forEach(function (x) { scene.appendChild(x); });
    var showTip = (S.get().plays.run || 0) < 2;
    if (showTip) scene.appendChild(tip);
    scene.appendChild(ready);
    ctx.area.appendChild(scene);
    ctx.setSegs(N);

    /* ---------- 尺寸 ---------- */
    var W = 800, H = 500, heroX = 160;
    function measure() {
      var r = scene.getBoundingClientRect();
      if (r.width < 50 || r.height < 50) return;
      W = r.width; H = r.height; heroX = W * 0.2;
      scene.style.setProperty('--H', H + 'px'); scene.style.setProperty('--W', W + 'px');
      lClouds.style.height = H * 0.5 + 'px'; lClouds.style.top = H * 0.06 + 'px';
      lFar.style.height = H * 0.36 + 'px'; lFar.style.top = H * (GY - 0.36 + 0.02) + 'px';
      lNear.style.height = H * 0.26 + 'px'; lNear.style.top = H * (GY - 0.26 + 0.03) + 'px';
      lGround.style.top = H * (GY - 0.02) + 'px'; lGround.style.height = H * (1 - GY + 0.02) + 'px';
      hero.style.width = H * HERO_H * 0.8 + 'px'; hero.style.height = H * HERO_H + 'px';
      hero.style.top = H * (GY - HERO_H) + 'px'; hero.style.left = heroX - H * HERO_H * 0.4 + 'px';
      shadow.style.top = H * (GY - 0.012) + 'px'; shadow.style.left = heroX - H * 0.07 + 'px'; shadow.style.width = H * 0.14 + 'px';
    }
    function onResize() { measure(); }
    window.addEventListener('resize', onResize);

    /* ---------- 剧本：每一道字门、石头、星星在第几秒到（再按速度换算成位置） ---------- */
    var targets = ctx.pick(N);
    var kindsPool = tier === 1 ? ['listen', 'pinyin'] : tier === 2 ? ['listen', 'pinyin', 'wordfill'] : ['wordfill', 'sentfill', 'pinyin', 'listen'];
    var kinds = [];
    while (kinds.length < N) kinds = kinds.concat(shuffle(kindsPool));
    function makeQ(c, k) {
      var q;
      try {
        if (k === 'listen') q = MZ.Q.listen(c, ctx.pool, { sim: tier > 1, simN: 1 });
        else if (k === 'wordfill') q = MZ.Q.wordfill(c, ctx.pool, { sim: tier >= 2, simN: 1 });
        else if (k === 'sentfill') q = MZ.Q.sentfill(c, ctx.pool, { sim: true, simN: 1 });
        else q = MZ.Q.pinyin(c, ctx.pool);
      } catch (e) { q = MZ.Q.pinyin(c, ctx.pool); }
      var correct = q.opts[q.ans];
      var wrong = pick(q.opts.filter(function (x, i) { return i !== q.ans; }));
      return { q: q, ch: [{ x: correct, ok: true }, { x: wrong, ok: false }] };
    }
    var spec = [], gates = [], lastAir = -1, airRun = 0, i, k;
    for (i = 0; i < N; i++) {
      var tg = P.first + i * P.gap, air;
      do { air = Math.random() < 0.5 ? 0 : 1; } while (air === lastAir && airRun >= 2);
      airRun = air === lastAir ? airRun + 1 : 1; lastAir = air;
      spec.push({ t: tg, type: 'gate', i: i, air: air });
      // 这道门前面的路上：石头（上面一道弧形的星星），石头之间至少隔 1.3 秒；离字门至少 2.4 秒
      var from = i === 0 ? 2.8 : P.first + (i - 1) * P.gap + 1.8, to = tg - 2.4, span = to - from;
      var nObs = i === 0 ? 1 : P.obs[0] + Math.round(Math.random() * (P.obs[1] - P.obs[0]));
      nObs = Math.min(nObs, Math.max(1, Math.floor(span / 1.3)));
      for (k = 0; k < nObs; k++) {
        var to_ = i === 0 ? 3.2 : from + (k + 0.5) / nObs * span;
        spec.push({ t: to_, type: 'obs', kind: Math.floor(Math.random() * OBS.length) });
        for (var s = -2; s <= 2; s++) spec.push({ t: to_ + s * 0.16, type: 'coin', lift: 0.13 + 0.17 * (1 - Math.pow(s / 2.2, 2)) });
      }
      // 地上一排星星（跑过去就吃到）
      var gt = tg + 1.2; if (i < N - 1) for (k = 0; k < 4; k++) spec.push({ t: gt + k * 0.22, type: 'coin', lift: 0.1 });
    }
    var tEnd = P.first + (N - 1) * P.gap + 5.2;
    spec.push({ t: tEnd, type: 'flag' });
    spec.sort(function (a, b) { return a.t - b.t; });

    var qi = 0, active = [];
    var worldX = 0, vNow = 0, tt = 0, lift = 0, vy = 0, onGround = true, jumpQ = 0, stumble = 0, invul = 0, ending = 0, ended = false, coinsGot = 0, obsHit = 0;
    var started = false, alive = true, raf = 0, last = 0, moodT = 0, curMood = 'happy';
    var curGate = null, gateIdx = 0, bannerOn = false, fbTimer = 0;

    function wxOf(sec) { return sec * P.v * W; }
    function buildItem(sp) {
      var o = { wx: wxOf(sp.t), type: sp.type, done: false }, el;
      if (sp.type === 'obs') {
        var d = OBS[sp.kind]; o.ow = H * 0.11 * d.w; o.oh = H * 0.11 * d.h;
        el = h('i', { class: 'rn-obs', html: d.svg });
        el.style.width = o.ow + 'px'; el.style.height = o.oh + 'px'; el.style.top = H * GY - o.oh + H * 0.012 + 'px';
      } else if (sp.type === 'coin') {
        o.ow = H * 0.06; o.cy = H * (GY - sp.lift - 0.02);
        el = h('i', { class: 'rn-coin', html: STAR });
        el.style.width = o.ow + 'px'; el.style.height = o.ow + 'px'; el.style.top = o.cy - o.ow / 2 + 'px';
      } else if (sp.type === 'flag') {
        o.ow = H * 0.3;
        el = h('i', { class: 'rn-flag' }, h('b'), h('span', null, '终点'));
        el.style.height = H * 0.42 + 'px'; el.style.top = H * GY - H * 0.42 + 'px'; el.style.width = o.ow + 'px';
      } else if (sp.type === 'gate') {
        var built = makeQ(targets[sp.i], kinds[sp.i]);
        o.q = built.q; o.choices = built.ch; o.air = sp.air; o.i = sp.i; o.att = ctx.begin(targets[sp.i]);
        o.sawAir = false; o.bannered = false;
        o.ow = H * R * 2 * 1.25;
        el = h('div', { class: 'rn-gate' }); el.style.width = o.ow + 'px';
        el.appendChild(h('i', { class: 'rn-beam' }));
        o.bub = [];
        [0, 1].forEach(function (kk) {
          var isAir = kk === o.air, ch = o.choices[kk];
          var b = h('b', { class: 'rn-b ' + (isAir ? 'high ' : 'low ') + (o.q.optKind === 'py' ? 'py' : o.q.optKind === 'text' ? 'tx' : 'ch') }, h('span', null, String(ch.x)));
          b.style.width = b.style.height = H * R * 2 + 'px'; b.style.left = (o.ow - H * R * 2) / 2 + 'px';
          b.style.top = H * (GY - (isAir ? AIR_Y : LOW_Y) - R) + 'px';
          el.appendChild(b); o.bub[kk] = b;
        });
        el.appendChild(h('i', { class: 'rn-post l' })); el.appendChild(h('i', { class: 'rn-post r' }));
        gates.push(o);
      }
      o.el = el; el.style.transform = 'translate3d(-999px,0,0)';
      world.appendChild(el);
      return o;
    }

    /* ---------- 题目横幅 ---------- */
    function fitBanner() {
      banner.style.zoom = '';
      var w = banner.offsetWidth, hh = banner.offsetHeight;
      var z = Math.min(1, (W * 0.64) / Math.max(1, w), (H * 0.2) / Math.max(1, hh));
      if (z < 1) banner.style.zoom = String(Math.max(0.5, Math.floor(z * 100) / 100));
    }
    function showBanner(g) {
      var q = g.q, big = null;
      if (q.big) big = q.big.py && q.big.py.length ? MZ.ruby(q.big.text, q.big.py, { tap: false, cls: 'lg' }) : h('div', { class: 'qbig kai' }, q.big.text);
      else if (q.ruby) big = MZ.ruby(q.ruby.text, q.ruby.py, { blank: function (kk) { return kk === q.ruby.blank; }, tap: false, cls: 'lg' });
      clearTimeout(fbTimer);
      MZ.clear(banner);
      banner.className = 'rn-banner on';
      // “听一听”这类题：没有字可看，喇叭就是题目，做成大按钮，孩子随时能再点一下重听
      banner.appendChild(h('div', { class: 'rn-qp' }, q.prompt, q.speak && big ? ui.speakBtn(q.speak, 'sm') : null));
      if (big) banner.appendChild(h('div', { class: 'rn-qb' }, big));
      else if (q.speak) banner.appendChild(h('div', { class: 'rn-qb' }, ui.speakBtn(q.speak, 'big')));
      fitBanner();
      bannerOn = true; g.bannered = true; curGate = g;
      ctx.curSeg(g.i);
      if (q.autoSpeak && q.speak) setTimeout(function () { if (alive) MZ.speak(q.speak); }, 250);
    }
    function showFeedback(ok, g) {
      clearTimeout(fbTimer);
      MZ.clear(banner);
      banner.className = 'rn-banner on fb ' + (ok ? 'ok' : 'no');
      banner.appendChild(h('div', { class: 'rn-qp' }, ok ? MZ.pick(MZ.PRAISE) : '差一点！记住它：'));
      banner.appendChild(h('div', { class: 'rn-qb sm' }, g.q.explain));
      fitBanner();
      fbTimer = setTimeout(function () { if (alive && banner.classList.contains('fb')) { banner.className = 'rn-banner'; bannerOn = false; } }, 2600);
    }
    function applyPose() {
      var svg = hero.querySelector('svg'); if (!svg) return;
      svg.classList.toggle('av-air', !onGround);
      svg.classList.toggle('av-run', onGround && vNow > 20 && !ended);
    }
    function setMood(m, dur) {
      moodT = dur || 0;
      if (curMood === m) return;
      curMood = m;
      hero.firstChild.innerHTML = AV.render({ mood: m, run: true });
      applyPose();
    }

    /* ---------- 跳 ---------- */
    function jump() {
      if (ended || !started) return;
      if (onGround) { onGround = false; vy = V0 * H; MZ.sfx.tap(); applyPose(); tip.classList.add('off'); }
      else jumpQ = 0.14;
    }
    function down(ev) {
      if (ev.target && ev.target.closest && ev.target.closest('.spk')) return;
      if (ev.cancelable) ev.preventDefault();
      jump();
    }
    scene.addEventListener('pointerdown', down);

    /* ---------- 字门：飞过门中间的那一刻，在空中就是选天上的，在地上就是选地上的 ---------- */
    function resolveGate(g) {
      g.done = true;
      var kk = g.sawAir ? g.air : 1 - g.air, ok = g.choices[kk].ok, correctIdx = g.choices[0].ok ? 0 : 1;
      g.bub[0].classList.remove('pick'); g.bub[1].classList.remove('pick');
      g.bub[kk].classList.add(ok ? 'ok' : 'no');
      if (!ok) g.bub[correctIdx].classList.add('show');
      g.bub[1 - kk].classList.add('dim');
      if (ok) {
        ctx.hit(g.att);
        ctx.markSeg(g.i, g.att.wrongs === 0 && !g.att.assisted);
        setMood('cheer', 1.1);
        hero.classList.remove('cheer'); void hero.offsetWidth; hero.classList.add('cheer');
        sparkle(heroX + H * 0.05, H * (GY - 0.2));
        MZ.sfx.pop();
      } else {
        ctx.miss(g.att);
        ctx.markSeg(g.i, false);
        setMood('oops', 1.2); stumble = 0.55;
      }
      showFeedback(ok, g);
      setTimeout(function () { if (alive && g.q.after) MZ.speak(g.q.after); }, 420);
      gateIdx = g.i + 1; curGate = null;
    }
    function sparkle(x, y) {
      for (var n = 0; n < 8; n++) {
        var s = h('i', { class: 'rn-sp' }), a = n / 8 * Math.PI * 2, d = H * (0.1 + Math.random() * 0.06);
        s.style.left = x + 'px'; s.style.top = y + 'px';
        s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        scene.appendChild(s);
        (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700); })(s);
      }
    }
    function popText(txt, x, y, cls) {
      var el = h('b', { class: 'rn-pop ' + (cls || '') }, txt);
      el.style.left = x + 'px'; el.style.top = y + 'px'; scene.appendChild(el);
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
    }

    /* ---------- 每一帧 ---------- */
    function frame(ts) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts;
      var md = document.getElementById('modal');
      if (md && md.classList.contains('on')) return;       // 弹出“要退出吗”之类的窗口时暂停
      update(dt);
    }
    function update(dt) {
      tt += dt;
      if (!started && tt >= 1.1) { started = true; ready.textContent = '跑！'; setTimeout(function () { ready.classList.add('off'); }, 500); if (showTip) setTimeout(function () { tip.classList.add('off'); }, 6500); }
      var vT = started && !ending ? P.v * W : 0;
      if (stumble > 0) { stumble -= dt; vT *= 0.5; }
      vNow += (vT - vNow) * Math.min(1, dt * (ending ? 3.2 : 2.6));
      worldX += vNow * dt;
      if (!onGround) {
        vy -= G * H * dt; lift += vy * dt;
        if (lift <= 0) { lift = 0; vy = 0; onGround = true; applyPose(); if (jumpQ > 0) { jumpQ = 0; jump(); } }
      }
      if (jumpQ > 0) jumpQ -= dt;
      if (moodT > 0) { moodT -= dt; if (moodT <= 0 && curMood !== 'happy') setMood('happy'); }
      if (invul > 0) { invul -= dt; hero.classList.toggle('blink', invul > 0 && Math.floor(invul * 10) % 2 === 0); if (invul <= 0) hero.classList.remove('blink'); }
      hero.style.transform = 'translate3d(0,' + (-lift).toFixed(1) + 'px,0)';
      var sc = 1 - Math.min(0.5, lift / (H * HJ) * 0.5);
      shadow.style.transform = 'scaleX(' + sc.toFixed(2) + ')'; shadow.style.opacity = String(0.22 * sc + 0.05);
      if (vNow > 20 && onGround && !ended) { var sv = hero.querySelector('svg'); if (sv && !sv.classList.contains('av-run')) sv.classList.add('av-run'); }
      // 背景滚动（近处快、远处慢）
      lGround.style.transform = 'translate3d(' + (-(worldX % W)).toFixed(1) + 'px,0,0)';
      lNear.style.transform = 'translate3d(' + (-((worldX * 0.45) % W)).toFixed(1) + 'px,0,0)';
      lFar.style.transform = 'translate3d(' + (-((worldX * 0.2) % W)).toFixed(1) + 'px,0,0)';
      lClouds.style.transform = 'translate3d(' + (-((worldX * 0.07 + tt * 6) % W)).toFixed(1) + 'px,0,0)';
      prog.firstChild.style.width = Math.min(100, worldX / wxOf(tEnd) * 100).toFixed(1) + '%';
      // 生成前方快要到的物件
      while (qi < spec.length && wxOf(spec[qi].t) - worldX < W * 1.15) { active.push(buildItem(spec[qi])); qi++; }
      var hw = H * HERO_H * 0.4, heroMidY = H * GY - H * HERO_H * 0.5 - lift;
      for (var a = active.length - 1; a >= 0; a--) {
        var o = active[a], sx = heroX + (o.wx - worldX);
        o.el.style.transform = 'translate3d(' + (sx - o.ow / 2).toFixed(1) + 'px,0,0)';
        if (o.type === 'obs') {
          if (!o.done && Math.abs(sx - heroX) < (o.ow + hw * 0.7) / 2 && lift < o.oh * 0.9) {
            o.done = true;
            if (invul <= 0) { obsHit++; invul = 1.1; stumble = 0.5; ctx.addScore(-2); popText('哎呀 -2', heroX - H * 0.05, H * (GY - 0.42), 'bad'); MZ.sfx.bad(); setMood('oops', 0.8); }
          }
        } else if (o.type === 'coin') {
          if (!o.done && Math.abs(sx - heroX) < hw * 0.9 && Math.abs(o.cy - heroMidY) < H * 0.11) {
            o.done = true; coinsGot++; ctx.addScore(1); o.el.classList.add('got'); MZ.sfx.stroke();
          }
        } else if (o.type === 'gate') {
          var lead = P.lead * P.v * W;
          if (!o.bannered && gateIdx === o.i && o.wx - worldX < lead && (!bannerOn || o.wx - worldX < lead * 0.7)) showBanner(o);
          if (!o.done) {
            var half = (o.ow + hw * 2) / 2;
            if (sx - heroX < half && sx - heroX > 0) {
              if (lift > H * THR) o.sawAir = true;
              o.bub[o.air].classList.toggle('pick', o.sawAir); o.bub[1 - o.air].classList.toggle('pick', !o.sawAir);
            }
            if (sx <= heroX) resolveGate(o);
          }
        } else if (o.type === 'flag') {
          if (!ending && sx <= heroX + H * 0.25) ending = 1;
        }
        if (sx < -W * 0.4) { if (o.el.parentNode) o.el.parentNode.removeChild(o.el); active.splice(a, 1); }
      }
      if (ending && !ended && vNow < 12) {
        ended = true;
        var sv2 = hero.querySelector('svg'); if (sv2) sv2.classList.remove('av-run');
        setMood('cheer', 99); hero.classList.add('cheer');
        MZ.sfx.win(); MZ.confetti(60);
        setTimeout(function () { if (alive) ctx.finish({ lines: ['一路上吃到 ' + coinsGot + ' 颗星星' + (obsHit ? '，撞到 ' + obsHit + ' 块石头' : '，一块石头都没撞到！')] }); }, 1500);
      }
    }

    // 提示：让正确答案的泡泡发光（这一道题算“有人帮忙”）
    ctx.onHint = function () {
      var g = curGate;
      if (!g || g.done) return;
      if (ctx.hint(g.att)) g.bub[g.choices[0].ok ? 0 : 1].classList.add('glow');
    };

    measure();
    setTimeout(measure, 60); setTimeout(measure, 400);       // 页面刚切过来时尺寸可能还没算好，再量两次
    applyPose();
    // 给自动测试用的小钩子（不影响玩）
    MZ._rn = { jump: jump, state: function () { return { worldX: worldX, lift: lift, onGround: onGround, started: started, ended: ended, gateIdx: gateIdx, coinsGot: coinsGot, obsHit: obsHit, W: W, H: H, v: vNow, heroX: heroX, tEnd: tEnd, obs: active.filter(function (o) { return o.type === 'obs' && !o.done; }).map(function (o) { return { wx: o.wx, ow: o.ow }; }), gates: gates.map(function (g) { return { i: g.i, wx: g.wx, air: g.air, ok: g.choices.map(function (c) { return c.ok; }), done: g.done, bannered: g.bannered }; }) }; } };
    raf = requestAnimationFrame(frame);
    ctx.onLeave(function () { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); clearTimeout(fbTimer); MZ._rn = null; });
  }
})();
