/* 墨点识字 · 界面 */
(function () {
  'use strict';
  var MZ = window.MZ, D = MZ.D, S = MZ.S, h = MZ.h;
  var stage = document.getElementById('stage');
  var ALL = D.order.length;

  /* ---------- 图标（自绘） ---------- */
  var I = {
    star: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill="currentColor"/></svg>',
    flame: '<svg viewBox="0 0 24 24"><path d="M12 2c1.2 4.2-4.2 6.2-4.2 11.2a5.9 5.9 0 0011.8 0c0-3.1-1.9-4.6-2.3-7.3-1.9.9-3 2.3-3 4.4C14.3 7.8 13.6 4.6 12 2z" fill="currentColor"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    speaker: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 010 7M18.2 5.8a8.8 8.8 0 010 12.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 4.5L7.5 12 15 19.5" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>',
    pen: '<svg viewBox="0 0 24 24"><path d="M3 21l1.2-5L16 4.2a2 2 0 012.8 0l1 1a2 2 0 010 2.8L8 19.8 3 21z" fill="currentColor"/></svg>',
    redo: '<svg viewBox="0 0 24 24"><path d="M19 6v5h-5" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.4 11A7 7 0 106.6 17" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M4.5 12.5l5 5 10-11" stroke="currentColor" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 018 0v2.5" stroke="currentColor" stroke-width="2.6" fill="none"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M9 4.5l7.5 7.5L9 19.5" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bulb: '<svg viewBox="0 0 24 24"><path d="M12 2.8a6.2 6.2 0 00-3.7 11.2c.8.7 1.2 1.4 1.2 2.4h5c0-1 .4-1.7 1.2-2.4A6.2 6.2 0 0012 2.8z" fill="currentColor"/><path d="M9.6 19h4.8M10.4 21.4h3.2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  };
  function icon(n, cls) { return h('span', { class: 'ic ' + (cls || ''), html: I[n] }); }
  function tap(fn) { return function (ev) { MZ.sfx.tap(); fn(ev); }; }

  /* ---------- 路由 ---------- */
  var VIEWS = MZ.VIEWS = {}, stack = [], leave = null;
  function doLeave() { if (leave) { try { leave(); } catch (e) { /* ignore */ } leave = null; } MZ.stopSpeak(); }
  function render(name, params) {
    var v = VIEWS[name](params || {});
    leave = v.leave || null;
    MZ.clear(stage);
    stage.appendChild(v.node);
    v.node.classList.add('enter');
    stage.scrollTop = 0;
    if (v.after) v.after();
    MZ.refreshChrome();
  }
  MZ.go = function (name, params, opt) {
    doLeave();
    if (opt && opt.replace && stack.length) stack[stack.length - 1] = { name: name, params: params };
    else stack.push({ name: name, params: params });
    render(name, params);
  };
  MZ.home = function () { doLeave(); stack = [{ name: 'home', params: {} }]; render('home', {}); };
  MZ.back = function () {
    if (stack.length > 1) { doLeave(); stack.pop(); var t = stack[stack.length - 1]; render(t.name, t.params); } else MZ.home();
  };
  // 原地重画当前页面（比如领完宝箱之后）
  MZ.refresh = function () { var t = stack[stack.length - 1]; if (!t) return; doLeave(); render(t.name, t.params); };
  MZ.current = function () { return stack.length ? stack[stack.length - 1].name : ''; };
  MZ.refreshChrome = function () {
    var s = S.get();
    document.body.classList.toggle('no-py', !s.set.pinyin);
    Array.prototype.forEach.call(document.querySelectorAll('[data-stat="stars"]'), function (el) { el.textContent = String(S.wallet()); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-stat="streak"]'), function (el) { el.textContent = String(S.streak()); });
  };

  /* ---------- 通用部件 ---------- */
  function stats() {
    return h('div', { class: 'stats' },
      h('span', { class: 'pill star', title: '星星' }, icon('star'), h('b', { data: { stat: 'stars' } }, String(S.wallet()))),
      h('span', { class: 'pill fire' }, icon('flame'), h('b', { data: { stat: 'streak' } }, String(S.streak())), h('em', null, '天')));
  }
  function seg(items, active, onPick) {
    return h('div', { class: 'seg' }, items.map(function (t) {
      return h('button', { class: 'seg-b' + (t.k === active ? ' on' : ''), onclick: tap(function () { onPick(t.k); }) }, t.label);
    }));
  }
  function topbar(o) {
    var bar = h('header', { class: 'top' });
    if (o.back !== false) bar.appendChild(h('button', { class: 'icon-btn', 'aria-label': '返回', onclick: tap(function () { MZ.back(); }) }, icon('back')));
    bar.appendChild(h('div', { class: 'ttl' }, o.title));
    if (o.tabs) bar.appendChild(seg(o.tabs, o.tab, o.onTab));
    bar.appendChild(h('div', { class: 'grow' }));
    if (o.right) bar.appendChild(o.right);
    bar.appendChild(stats());
    return bar;
  }
  function speakBtn(text, cls, isChar) {
    return h('button', { class: 'icon-btn spk ' + (cls || ''), 'aria-label': '朗读', onclick: function (ev) { ev.stopPropagation(); MZ.sfx.tap(); isChar ? MZ.speakChar(text) : MZ.speak(text); } }, icon('speaker'));
  }
  function bar(p, total) { return h('div', { class: 'mbar' }, h('i', { style: { width: Math.round(100 * p / Math.max(1, total)) + '%' } })); }
  var groupOf = MZ.groupOf;
  MZ.ui = { icon: icon, tap: tap, topbar: topbar, speakBtn: speakBtn, bar: bar, seg: seg, stats: stats };

  /* ================= 首页 ================= */
  VIEWS.home = function () {
    var s = S.get(), cnt = MZ.rev.counts(), learned = cnt.learned, tasks = MZ.adv.tasks(), a = MZ.adv.st();
    var passed = Object.keys(s.levels).filter(function (k) { return s.levels[k].stars >= 1; }).length;
    var plays = 0; for (var pk in s.plays) plays += s.plays[pk];
    var ready = MZ.adv.chestReady(), opened = !!a.chest;
    var left = tasks[0].goal - tasks[0].n;
    var say = ready ? '小冒险完成啦！快开宝箱～'
      : learned === 0 ? '我是墨墨！从“一”开始学吧。'
      : cnt.due > 0 ? cnt.due + ' 个字宝宝睡着啦，快去叫醒！'
      : !tasks[0].done ? '再认识 ' + left + ' 个新字，小冒险就完成啦！'
      : !tasks[2].done ? '来玩一局小游戏，赢星星换帽子！'
      : opened ? '宝箱开啦。随便逛逛吧！' : '今天真棒，明天见！';

    function card3(cls, glyph, title, sub, meta, to, badge) {
      return h('button', { class: 'card3 ' + cls, onclick: tap(function () { MZ.go(to.name, to.params); }) },
        h('div', { class: 'c3-glyph' }, glyph),
        h('div', { class: 'c3-text' }, h('h3', null, title), h('p', null, sub), h('div', { class: 'bc-meta' }, meta)),
        badge ? h('span', { class: 'badge' }, String(badge)) : null);
    }
    function card5(cls, glyph, title, meta, to, badge) {
      return h('button', { class: 'card5 ' + cls, onclick: tap(function () { MZ.go(to.name, to.params); }) },
        h('div', { class: 'c5-glyph' }, glyph), h('h3', null, title), h('p', null, meta), badge ? h('span', { class: 'badge' }, String(badge)) : null);
    }

    var chips = tasks.map(function (t) {
      return h('button', { class: 'atask' + (t.done ? ' done' : ''), onclick: tap(function () { MZ.go(t.to); }) },
        h('span', { class: 'at-ic' }, t.done ? icon('check') : t.emoji),
        h('span', { class: 'at-tx' }, h('b', null, t.label), h('em', null, t.done ? (t.auto ? '都醒着' : '已完成') : t.n + ' / ' + t.goal)));
    });
    var chest = h('button', { class: 'chest' + (ready ? ' ready' : opened ? ' open' : ''), onclick: tap(function () {
      if (ready) return openChest();
      MZ.toast(opened ? '今天的宝箱已经打开啦，明天再来！' : '做完左边三件小事，就能打开宝箱！');
    }) }, h('span', { class: 'ch-ic' }, opened ? '🎊' : '🎁'), h('b', null, ready ? '打开宝箱' : opened ? '已打开' : '小宝箱'));
    function openChest() {
      var gain = MZ.adv.open();
      if (!gain) return;
      MZ.sfx.chest(); MZ.confetti(150);
      MZ.modal({
        title: '宝箱打开啦！',
        body: h('div', { class: 'chest-pop' }, MZ.mascot('cheer', 100), h('div', null, h('div', { class: 'chest-n' }, '+' + gain + ' ⭐'), h('p', null, '这是今天的奖励。星星可以给墨墨买新帽子哦！'))),
        buttons: [{ label: '去看看装扮', kind: 'ghost', onClick: function () { MZ.go('shop'); } }, { label: '太好了', kind: 'coral', onClick: function () { MZ.refreshChrome(); MZ.refresh(); } }],
      });
      MZ.refreshChrome();
    }

    var node = h('section', { class: 'screen home' },
      h('header', { class: 'top home-top' },
        h('div', { class: 'brand' }, h('div', null, h('h1', null, '墨点识字'), h('p', null, '和墨墨一起，开心认汉字'))),
        h('div', { class: 'grow' }), stats(),
        h('button', { class: 'icon-btn emo', 'aria-label': '给墨墨换装扮', onclick: tap(function () { MZ.go('shop'); }) }, h('span', null, '🎩')),
        h('button', { class: 'icon-btn', 'aria-label': '设置', onclick: tap(openSettings) }, icon('gear'))),
      h('div', { class: 'hero', data: { bg: (s.wear && s.wear.bg) || 'sky' } },
        h('button', { class: 'hero-m', 'aria-label': '墨墨', onclick: function () { MZ.speak(say); MZ.sfx.tap(); } }, MZ.mascot(ready ? 'cheer' : cnt.due > 0 ? 'happy' : 'happy', 128)),
        h('div', { class: 'adv' },
          h('div', { class: 'adv-say' }, h('span', null, say), icon('speaker')),
          h('div', { class: 'adv-h' }, '今日小冒险'),
          h('div', { class: 'atasks' }, chips)),
        chest),
      h('div', { class: 'cards3' },
        card3('c-coral', '字', '识字', '看笔顺 · 描红 · 认新字', ['已学 ' + learned + ' / ' + ALL + ' 字', bar(learned, ALL)], { name: 'learn' }),
        card3('c-sky', '⏰', '叫醒字宝宝', cnt.due > 0 ? cnt.due + ' 个字宝宝睡着啦' : (learned ? '字宝宝们都醒着' : '学了字才有字宝宝'), cnt.fuzzy > 0 ? ['迷糊字宝 ' + cnt.fuzzy + ' 个', bar(cnt.s3, Math.max(1, learned))] : ['牢记 ' + cnt.s3 + ' 个字', bar(cnt.s3, Math.max(1, learned))], { name: 'wake' }, cnt.due || 0),
        card3('c-sun', '🎮', '小游戏', '6 种玩法 · 赢星星', ['已玩 ' + plays + ' 局', bar(Math.min(plays, 30), 30)], { name: 'games' })),
      h('div', { class: 'cards5' },
        card5('c-grape', '✍️', '听写', '听一听 写出来', { name: 'dictate' }),
        card5('c-teal', '📒', '字宝册', cnt.learned + ' / ' + ALL, { name: 'album' }),
        card5('c-sky', '🔤', '拼音偏旁', '声母 韵母 偏旁', { name: 'pinyin' }),
        card5('c-coral', '📖', '故事儿歌', '成语 · 古诗 · 故事', { name: 'idioms' }),
        card5('c-sun', '🏆', '闯关成就', '通关 ' + passed + ' / ' + MZ.LEVELS.length, { name: 'levels' })));
    return { node: node };
  };

  /* ================= 识字：册 → 分组 → 字表 ================= */
  VIEWS.learn = function (p) {
    var s = S.get(), gi = p.g, bi;
    function firstOpenGroup(b) {
      var gs = D.books[b].groups;
      for (var i = 0; i < gs.length; i++) if (D.groups[gs[i]].chars.some(function (c) { return !s.learned[c]; })) return gs[i];
      return gs[0];
    }
    if (gi == null) {
      if (p.b != null) gi = firstOpenGroup(p.b);
      else {
        var nx = MZ.nextNew(1)[0];
        gi = nx ? MZ.groupOf(nx) : 0;
      }
    }
    bi = D.groups[gi].book;
    var strip = h('nav', { class: 'bookstrip' }), side = h('nav', { class: 'side' }), main = h('div', { class: 'main' });
    function renderStrip() {
      MZ.clear(strip);
      D.books.forEach(function (b, k) {
        var st = MZ.bookStat(k), nm = b.name.split(' · ');
        strip.appendChild(h('button', { class: 'bk' + (k === bi ? ' on' : '') + (st.got === st.total ? ' full' : ''), onclick: tap(function () { bi = k; gi = firstOpenGroup(k); renderStrip(); renderSide(); renderMain(); }) },
          h('span', { class: 'bk-ic' }, b.icon), h('span', { class: 'bk-t' }, h('i', null, nm[0]), h('b', null, nm[1] || nm[0])), h('em', null, st.got + '/' + st.total), bar(st.got, st.total)));
      });
    }
    function renderSide() {
      MZ.clear(side);
      D.books[bi].groups.forEach(function (k) {
        var g = D.groups[k], n = g.chars.filter(function (c) { return s.learned[c]; }).length;
        side.appendChild(h('button', { class: 'side-b' + (k === gi ? ' on' : ''), onclick: tap(function () { gi = k; renderSide(); renderMain(); }) },
          h('span', null, g.name), h('em', null, n + '/' + g.chars.length), bar(n, g.chars.length)));
      });
    }
    function renderMain() {
      MZ.clear(main);
      var g = D.groups[gi], n = g.chars.filter(function (c) { return s.learned[c]; }).length;
      var nextC = g.chars.filter(function (c) { return !s.learned[c]; })[0];
      main.appendChild(h('div', { class: 'grp-head' }, h('h2', null, g.name), h('span', null, n + ' / ' + g.chars.length + ' 个字'),
        h('div', { class: 'grow' }),
        nextC ? h('button', { class: 'btn coral sm', onclick: tap(function () { MZ.go('char', { c: nextC, g: gi }); }) }, '学下一个：' + nextC, icon('next')) : h('span', { class: 'allgot' }, '这一组全学会啦 🎉')));
      var grid = h('div', { class: 'tiles' });
      g.chars.forEach(function (c) {
        var ch = D.chars[c], done = !!s.learned[c], due = MZ.rev.isDue(c), fz = MZ.rev.isFuzzy(c);
        grid.appendChild(h('button', { class: 'tile' + (ch.e ? ' has-e' : '') + (done ? ' done' : '') + (done ? ' st' + MZ.rev.stage(c) : ''), onclick: tap(function () { MZ.go('char', { c: c, g: gi }); }) },
          ch.e ? h('span', { class: 'te' }, ch.e) : null,
          h('i', null, ch.p), h('b', null, c),
          done ? h('span', { class: 'tick' }, icon('check')) : null,
          done && (fz || due) ? h('span', { class: 'zz' }, fz ? '😵' : '😴') : null));
      });
      main.appendChild(grid);
    }
    renderStrip(); renderSide(); renderMain();
    var node = h('section', { class: 'screen learn th-coral' }, topbar({ title: '识字' }), strip, h('div', { class: 'split' }, side, main));
    return { node: node, after: function () {
      var on = side.querySelector('.side-b.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
      var bk = strip.querySelector('.bk.on'); if (bk && bk.scrollIntoView) bk.scrollIntoView({ block: 'nearest', inline: 'center' });
    } };
  };

  /* ================= 汉字详情：笔顺 + 描红 ================= */
  VIEWS.char = function (p) {
    var c = p.c, ch = D.chars[c], gi = groupOf(c), list = D.groups[gi].chars, idx = list.indexOf(c);
    var writer = null, token = 0;
    var hw = h('div', { class: 'hw' });
    var prog = h('div', { class: 'strk' }, '共 ' + ch.n + ' 笔');
    var board = h('div', { class: 'board' }, hw, prog);
    var hint = h('div', { class: 'hint' }, '先点“看笔顺”，再点“我来写”');
    var stageChip = h('span', { class: 'chip stg' });
    var learnedBtn = h('button', { class: 'btn ghost sm', onclick: tap(function () {
      if (MZ.learn(c)) { MZ.dailyMark(c); MZ.afterActivity(); refreshLearned(); }
    }) });
    function refreshLearned() {
      var done = !!S.get().learned[c];
      MZ.clear(learnedBtn); learnedBtn.classList.toggle('done', done);
      learnedBtn.appendChild(done ? icon('check') : document.createTextNode(''));
      learnedBtn.appendChild(document.createTextNode(done ? ' 已学会' : '我学会了'));
      var st = MZ.rev.stage(c), txt = '';
      if (done) txt = MZ.rev.isFuzzy(c) ? '😵 迷糊字宝' : MZ.rev.isDue(c) ? '😴 睡着了' : ['', '🌱 刚认识', '🌿 比较熟', '🌟 牢记'][st];
      stageChip.textContent = txt; stageChip.style.display = txt ? '' : 'none';
    }
    function setHint(t) { hint.textContent = t; }
    function watch() {
      if (!writer) return;
      token++; try { writer.cancelQuiz(); } catch (e) { /* ignore */ }
      prog.textContent = '共 ' + ch.n + ' 笔';
      setHint('看，一笔一笔这样写～');
      writer.hideCharacter();
      writer.animateCharacter({ onComplete: function () { setHint('看清楚了吗？再点“我来写”试一试！'); } });
    }
    function write() {
      if (!writer) return;
      var my = ++token;
      try { writer.cancelQuiz(); } catch (e) { /* ignore */ }
      writer.hideCharacter();
      prog.textContent = '已写 0 / ' + ch.n + ' 笔';
      setHint('照着浅色的字，一笔一笔写。写歪了会有小提示。');
      writer.quiz({
        leniency: 1.5, showHintAfterMisses: 2, highlightOnComplete: true, markStrokeCorrectAfterMisses: 4,
        onCorrectStroke: function (d) { MZ.sfx.stroke(); prog.textContent = '已写 ' + (d.strokeNum + 1) + ' / ' + ch.n + ' 笔'; },
        onMistake: function () { MZ.sfx.bad(); board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake'); },
        onComplete: function () { if (my === token) finishWrite(); },
      });
    }
    function finishWrite() {
      var s = S.get(), first = !s.starred[c];
      s.wrote++;
      var newly = MZ.learn(c);
      if (first) { s.starred[c] = 1; s.stars++; }
      S.save(); if (newly) MZ.dailyMark(c);
      prog.textContent = '写完啦！';
      setHint(MZ.pick(MZ.PRAISE) + (first ? ' 获得 1 颗星星！' : ''));
      MZ.sfx.ok(); if (first) setTimeout(MZ.sfx.star, 350);
      MZ.confetti(first ? 70 : 30);
      MZ.speakChar(c);
      refreshLearned(); MZ.afterActivity();
    }
    refreshLearned();

    var wordCards = ch.words.map(function (w, i) {
      return h('button', { class: 'wcard', onclick: tap(function () { MZ.speak(w); }) },
        MZ.ruby(w, w.split('').map(function (_, k) { return ch.wp[i].split(' ')[k]; }), { tap: false, cls: 'lg' }), icon('speaker'));
    });
    var chips = [h('span', { class: 'chip' }, ch.n + ' 画'), stageChip];
    if (ch.r != null) {
      var R = D.radicals[ch.r];
      chips.push(h('button', { class: 'chip link', onclick: tap(function () { MZ.go('pinyin', { tab: 'rad', ri: ch.r }); }) }, '偏旁 ' + R.f + '（' + R.n + '）'));
    }
    var simBox = null;
    if (ch.sim) {
      simBox = h('div', { class: 'simrow' }, h('h4', null, '长得像，看仔细哦'),
        h('div', { class: 'xchips' }, ch.sim.split('').slice(0, 5).map(function (x) {
          return h('button', { class: 'xchip link', onclick: tap(function () { MZ.go('char', { c: x, g: groupOf(x) }, { replace: true }); }) }, h('b', null, x), h('i', null, D.chars[x].p));
        })));
    }
    var info = h('div', { class: 'info' }, h('div', { class: 'info-body' },
      h('div', { class: 'py-row' }, h('div', { class: 'bigpy' }, ch.p), speakBtn(c, 'big', true), h('div', { class: 'grow' }), ch.e ? h('div', { class: 'pic', 'aria-hidden': 'true' }, ch.e) : null),
      h('div', { class: 'chips' }, chips),
      h('h4', null, '组词'), h('div', { class: 'wcards' }, wordCards),
      h('h4', null, '例句'),
      h('div', { class: 'sent' }, MZ.ruby(ch.sent, ch.sp, { cls: 'md' }), speakBtn(ch.sent, 'sm')),
      ch.note ? h('div', { class: 'note' }, '💡 ' + ch.note) : null,
      simBox),
      h('div', { class: 'info-foot' },
        learnedBtn,
        h('div', { class: 'nav2' },
          h('button', { class: 'btn ghost sm sq', 'aria-label': '上一个', onclick: tap(function () { MZ.go('char', { c: list[(idx - 1 + list.length) % list.length], g: gi }, { replace: true }); }) }, icon('back')),
          h('span', null, (idx + 1) + ' / ' + list.length),
          h('button', { class: 'btn ghost sm sq', 'aria-label': '下一个', onclick: tap(function () { MZ.go('char', { c: list[(idx + 1) % list.length], g: gi }, { replace: true }); }) }, icon('next')))));
    var node = h('section', { class: 'screen char th-coral' }, topbar({ title: '识字 · ' + D.groups[gi].name }),
      h('div', { class: 'char-body' },
        h('div', { class: 'left' },
          board, hint,
          h('div', { class: 'acts' },
            h('button', { class: 'btn sky', onclick: tap(watch) }, icon('play'), '看笔顺'),
            h('button', { class: 'btn coral', onclick: tap(write) }, icon('pen'), '我来写'),
            h('button', { class: 'btn ghost sq', 'aria-label': '重写', onclick: tap(write) }, icon('redo')))),
        info));
    return {
      node: node,
      after: function () {
        var size = Math.max(200, Math.floor(Math.min(board.clientWidth, board.clientHeight)));
        if (!window.HanziWriter) { hw.textContent = c; hw.classList.add('fallback'); return; }
        try {
          writer = HanziWriter.create(hw, c, {
            width: size, height: size, padding: Math.round(size * 0.06),
            charDataLoader: function (chr, onLoad, onErr) { var d = window.STROKES[chr]; d ? onLoad(d) : onErr(); },
            strokeColor: '#2A2748', outlineColor: '#E3D6BA', drawingColor: '#FF7A59', highlightColor: '#2FB9A5',
            showOutline: true, showCharacter: true, strokeAnimationSpeed: 1.3, delayBetweenStrokes: 240, strokeFadeDuration: 280,
            drawingWidth: Math.round(size * 0.07),
          });
        } catch (e) { hw.textContent = c; hw.classList.add('fallback'); }
      },
      leave: function () { token++; try { if (writer) writer.cancelQuiz(); } catch (e) { /* ignore */ } },
    };
  };

  /* ================= 拼音 / 偏旁 ================= */
  VIEWS.pinyin = function (p) {
    var tab = p.tab || 'py', sub = p.sub || 'ini', sel = null;
    var P = D.pinyin;
    var node = h('section', { class: 'screen pin th-sky' });
    node.appendChild(topbar({
      title: tab === 'py' ? '拼音' : '偏旁部首',
      tabs: [{ k: 'py', label: '拼音' }, { k: 'rad', label: '偏旁部首' }], tab: tab,
      onTab: function (k) { MZ.go('pinyin', { tab: k }, { replace: true }); },
    }));
    var body = h('div', { class: 'pin-body' });
    node.appendChild(body);

    function detailBox(big, line1, ex, onSpeak, extra) {
      return h('aside', { class: 'pdetail' },
        h('div', { class: 'pd-big' }, big),
        line1 ? h('div', { class: 'pd-l1' }, line1) : null,
        ex ? h('div', { class: 'pd-ex' }, h('b', null, ex.c), h('i', null, ex.p)) : null,
        h('button', { class: 'btn sky', onclick: tap(onSpeak) }, icon('speaker'), '听一听'),
        extra || null);
    }
    var detail = h('aside', { class: 'pdetail empty' }, MZ.mascot('think', 96), h('p', null, '点一点，听听它的读音'));
    function setDetail(el) { detail.replaceWith(el); detail = el; }

    function tileGrid(items, cls) {
      var grid = h('div', { class: 'ptiles ' + (cls || '') });
      items.forEach(function (it) {
        var t = h('button', { class: 'ptile', onclick: tap(function () {
          Array.prototype.forEach.call(body.querySelectorAll('.ptile.on'), function (x) { x.classList.remove('on'); });
          t.classList.add('on'); MZ.speak(it.c);
          setDetail(detailBox(it.s, '例字', { c: it.c, p: it.p }, function () { MZ.speak(it.c); },
            h('div', { class: 'pd-w' }, '“' + it.c + '”读 ' + it.p)));
        }) }, h('b', null, it.s), h('i', null, it.c));
        grid.appendChild(t);
      });
      return grid;
    }

    function renderPy() {
      var left = h('div', { class: 'pin-left' });
      left.appendChild(seg([{ k: 'ini', label: '声母' }, { k: 'fin', label: '韵母' }, { k: 'whole', label: '整体认读' }, { k: 'tone', label: '声调' }, { k: 'spell', label: '拼一拼' }], sub,
        function (k) { MZ.go('pinyin', { tab: 'py', sub: k }, { replace: true }); }));
      var content = h('div', { class: 'pin-scroll' });
      left.appendChild(content);
      if (sub === 'ini') {
        content.appendChild(h('p', { class: 'tip' }, '声母是音节开头的辅音，一共 23 个；最后的 y、w 用来给 i、u 开头的音节起头。'));
        content.appendChild(tileGrid(P.initials));
      } else if (sub === 'fin') {
        P.finals.forEach(function (g) { content.appendChild(h('h4', { class: 'gh' }, g.k)); content.appendChild(tileGrid(g.items)); });
      } else if (sub === 'whole') {
        content.appendChild(h('p', { class: 'tip' }, '整体认读音节，不用拼，看到就直接读出来。'));
        content.appendChild(tileGrid(P.whole));
      } else if (sub === 'tone') {
        content.appendChild(h('p', { class: 'tip' }, '汉语有四个声调，点一点听听它们的不同。'));
        var lines = { 1: 'M12 14 L88 14', 2: 'M12 50 L88 14', 3: 'M12 22 Q36 66 50 56 Q70 44 88 12', 4: 'M12 12 L88 52' };
        var tg = h('div', { class: 'tones' });
        P.tones.forEach(function (t) {
          tg.appendChild(h('button', { class: 'tonecard', onclick: tap(function () {
            MZ.speak(t.c);
            setDetail(detailBox(t.mark, t.name + ' · ' + t.desc, { c: t.c, p: t.p }, function () { MZ.speak(t.c); }, h('div', { class: 'pd-w' }, '“' + t.c + '”读 ' + t.p)));
          }) },
            h('span', { class: 'tcurve', html: '<svg viewBox="0 0 100 64"><path d="' + lines[t.n] + '" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round"/></svg>' }),
            h('b', null, t.mark), h('span', null, t.name), h('i', null, t.c + ' ' + t.p)));
        });
        content.appendChild(tg);
        content.appendChild(h('div', { class: 'rule' }, P.rule));
      } else {
        renderSpell(content);
      }
      return left;
    }

    function renderSpell(content) {
      var k = 0, joined = false;
      var a = h('div', { class: 'sp-block ini' }), b = h('div', { class: 'sp-block fin' });
      var res = h('div', { class: 'sp-res' }), ch = h('div', { class: 'sp-char' });
      var cnt = h('span', { class: 'cnt' });
      var stageEl = h('div', { class: 'sp-stage' }, cnt, a, h('span', { class: 'plus' }, '+'), b, h('span', { class: 'eq' }, '='), res, ch);
      var btn = h('button', { class: 'btn coral lg', onclick: tap(function () { join(); }) }, '拼一拼！');
      function show() {
        var c = P.spell[k]; joined = false; stageEl.classList.remove('joined');
        a.textContent = c.i; b.textContent = c.f; res.textContent = '?'; ch.textContent = '';
        cnt.textContent = (k + 1) + ' / ' + P.spell.length; btn.textContent = '拼一拼！';
      }
      function join() {
        var c = P.spell[k];
        if (joined) { MZ.speak(c.c); return; }
        joined = true; stageEl.classList.add('joined'); res.textContent = c.s; ch.textContent = c.c; btn.textContent = '再听一遍';
        MZ.sfx.ok(); MZ.speak(c.c);
      }
      content.appendChild(h('p', { class: 'tip' }, '声母和韵母碰在一起，就拼出一个音节啦。'));
      content.appendChild(stageEl);
      content.appendChild(h('div', { class: 'sp-ctl' },
        h('button', { class: 'icon-btn', 'aria-label': '上一个', onclick: tap(function () { k = (k - 1 + P.spell.length) % P.spell.length; show(); }) }, icon('back')),
        btn,
        h('button', { class: 'icon-btn', 'aria-label': '下一个', onclick: tap(function () { k = (k + 1) % P.spell.length; show(); }) }, icon('next'))));
      show();
    }

    function renderRad() {
      var left = h('div', { class: 'pin-left' });
      left.appendChild(h('p', { class: 'tip' }, '偏旁是汉字的“部件”，认识偏旁，就能猜出字的大概意思。'));
      var grid = h('div', { class: 'ptiles rad' });
      function showRad(ri) {
        var R = D.radicals[ri];
        Array.prototype.forEach.call(grid.querySelectorAll('.ptile.on'), function (x) { x.classList.remove('on'); });
        var t = grid.children[ri]; if (t) t.classList.add('on');
        var chips = R.ex.map(function (e) {
          var link = e.inset;
          return h('button', { class: 'xchip' + (link ? ' link' : ''), onclick: tap(function () { if (link) MZ.go('char', { c: e.c, g: groupOf(e.c) }); else MZ.speak(e.c); }) },
            h('b', null, e.c), h('i', null, e.p));
        });
        var el = h('aside', { class: 'pdetail rad' },
          h('div', { class: 'pd-big' }, R.f),
          h('div', { class: 'pd-l1' }, R.n + ' · ' + R.m),
          h('div', { class: 'pd-w' }, R.x),
          h('div', { class: 'xchips' }, chips),
          h('p', { class: 'tip s' }, '带边框的字，点一点可以去学写。'),
          h('button', { class: 'btn sky', onclick: tap(function () { MZ.speak(R.n + '，' + R.m + '。' + R.x); }) }, icon('speaker'), '听一听'));
        setDetail(el);
        MZ.speak(R.n);
      }
      D.radicals.forEach(function (R, ri) {
        grid.appendChild(h('button', { class: 'ptile', onclick: tap(function () { showRad(ri); }) }, h('b', null, R.f), h('i', null, R.n)));
      });
      var sc = h('div', { class: 'pin-scroll' }, grid);
      left.appendChild(sc);
      left._init = function () { if (p.ri != null) { showRad(p.ri); var t = grid.children[p.ri]; if (t && t.scrollIntoView) t.scrollIntoView({ block: 'center' }); } };
      return left;
    }

    var left = tab === 'py' ? renderPy() : renderRad();
    body.appendChild(left); body.appendChild(detail);
    return { node: node, after: function () { if (left._init) left._init(); } };
  };

  /* ================= 成语 / 阅读 ================= */
  function storyTabs(cur) {
    return {
      tabs: [{ k: 'idiom', label: '成语故事' }, { k: 'read', label: '儿歌短文' }], tab: cur,
      onTab: function (k) { MZ.go(k === 'idiom' ? 'idioms' : 'reads', {}, { replace: true }); },
    };
  }
  VIEWS.idioms = function (p) {
    var cats = ['全部', '寓言', '典故', '品格', '动物', '风景', '心情', '祝福', '日常'], cat = p.cat || '全部', s = S.get();
    var o = storyTabs('idiom'); o.title = '成语';
    var node = h('section', { class: 'screen story th-grape' }, topbar(o));
    var chips = h('div', { class: 'cats' }, cats.map(function (c) {
      var n = c === '全部' ? D.idioms.length : D.idioms.filter(function (x) { return x.c === c; }).length;
      return h('button', { class: 'cat' + (c === cat ? ' on' : ''), onclick: tap(function () { MZ.go('idioms', { cat: c }, { replace: true }); }) }, c, h('em', null, String(n)));
    }));
    var grid = h('div', { class: 'itiles' });
    D.idioms.forEach(function (it, i) {
      if (cat !== '全部' && it.c !== cat) return;
      var seen = !!s.idioms[it.t];
      grid.appendChild(h('button', { class: 'itile' + (seen ? ' done' : ''), onclick: tap(function () { MZ.go('idiom', { i: i, cat: cat }); }) },
        h('b', null, it.t), h('i', null, it.tp.filter(Boolean).join(' ')), h('em', null, it.c), seen ? h('span', { class: 'tick' }, icon('check')) : null));
    });
    node.appendChild(h('div', { class: 'story-body' }, chips, h('div', { class: 'pin-scroll' }, grid)));
    return { node: node };
  };

  VIEWS.idiom = function (p) {
    var i = p.i, it = D.idioms[i], s = S.get();
    var list = D.idioms.map(function (x, k) { return k; }).filter(function (k) { return !p.cat || p.cat === '全部' || D.idioms[k].c === p.cat; });
    var pos = list.indexOf(i);
    if (!s.idioms[it.t]) { s.idioms[it.t] = Date.now(); S.save(); MZ.afterActivity(); }
    var q = MZ.qIdiomBlank(it), answered = false, fb = h('div', { class: 'tryfb' });
    var opts = h('div', { class: 'qopts four' });
    q.opts.forEach(function (c, k) {
      var b = h('button', { class: 'opt char', onclick: tap(function () {
        if (answered) return;
        answered = true;
        var ok = k === q.ans;
        b.classList.add(ok ? 'right' : 'wrong');
        opts.children[q.ans].classList.add('right');
        MZ.clear(fb);
        if (ok) {
          MZ.sfx.ok();
          var st = S.get(), first = !st.idiomOk[it.t];   // 答对记录单独存放，不计入“已读成语”数
          if (first) { st.idiomOk[it.t] = 1; st.stars++; S.save(); MZ.sfx.star(); MZ.confetti(40); }
          fb.appendChild(document.createTextNode(MZ.pick(MZ.PRAISE) + (first ? ' 获得 1 颗星星！' : '')));
        } else { MZ.sfx.bad(); fb.appendChild(document.createTextNode('正确答案是“' + it.t[q.ruby.blank] + '”。')); }
        MZ.speak(it.t); MZ.afterActivity(); MZ.refreshChrome();
      }) }, c);
      opts.appendChild(b);
    });
    var o = storyTabs('idiom'); o.title = '成语故事';
    var node = h('section', { class: 'screen idiom th-grape' }, topbar(o),
      h('div', { class: 'idiom-body' },
        h('div', { class: 'ileft' },
          h('div', { class: 'ibig' }, MZ.ruby(it.t, it.tp, { cls: 'xxl' }), speakBtn(it.t, 'big')),
          h('div', { class: 'imean' }, h('h4', null, '意思'), h('p', null, it.m)),
          h('div', { class: 'imean' }, h('h4', null, '例句'), h('div', { class: 'sent' }, MZ.ruby(it.e, it.ep, { cls: 'md' }), speakBtn(it.e, 'sm'))),
          h('div', { class: 'nav2' },
            h('button', { class: 'btn ghost sm', onclick: tap(function () { MZ.go('idiom', { i: list[(pos - 1 + list.length) % list.length], cat: p.cat }, { replace: true }); }) }, icon('back'), '上一个'),
            h('span', null, (pos + 1) + ' / ' + list.length),
            h('button', { class: 'btn ghost sm', onclick: tap(function () { MZ.go('idiom', { i: list[(pos + 1) % list.length], cat: p.cat }, { replace: true }); }) }, '下一个', icon('next')))),
        h('div', { class: 'iright' },
          h('div', { class: 'story-card' }, h('div', { class: 'sc-h' }, h('h4', null, '小故事'), speakBtn(it.s, 'sm')), MZ.ruby(it.s, it.sp, { cls: 'md' })),
          h('div', { class: 'try' }, h('h4', null, '试一试：补上缺的字'),
            h('div', { class: 'try-q' }, MZ.ruby(it.t, it.tp, { blank: function (k) { return k === q.ruby.blank; }, tap: false, cls: 'lg' })),
            opts, fb))));
    return { node: node };
  };

  VIEWS.reads = function (p) {
    var s = S.get(), kinds = ['全部', '儿歌', '短文', '故事', '古诗'], kind = p.kind || '全部';
    var o = storyTabs('read'); o.title = '阅读';
    var chips = h('div', { class: 'cats' }, kinds.map(function (k) {
      var n = k === '全部' ? D.passages.length : D.passages.filter(function (x) { return x.kind === k; }).length;
      return h('button', { class: 'cat' + (k === kind ? ' on' : ''), onclick: tap(function () { MZ.go('reads', { kind: k }, { replace: true }); }) }, k, h('em', null, String(n)));
    }));
    var grid = h('div', { class: 'books' });
    D.passages.forEach(function (ps) {
      if (kind !== '全部' && ps.kind !== kind) return;
      var done = !!s.reads[ps.id];
      grid.appendChild(h('button', { class: 'book' + (done ? ' done' : ''), onclick: tap(function () { MZ.go('passage', { id: ps.id }); }) },
        h('span', { class: 'kind' }, ps.kind), h('b', null, ps.title), ps.by ? h('em', { class: 'by' }, ps.by) : null, h('i', null, ps.lines[0]), done ? h('span', { class: 'tick' }, icon('check')) : null));
    });
    return { node: h('section', { class: 'screen story th-grape' }, topbar(o), h('div', { class: 'story-body' }, chips, h('div', { class: 'pin-scroll' }, grid))) };
  };

  VIEWS.passage = function (p) {
    var ps = D.passages.filter(function (x) { return x.id === p.id; })[0], s = S.get();
    var reading = 0, lineEls = [];
    var text = h('div', { class: 'ptext' });
    // 一行里按逗号、句号分成小段；需要换行时整段一起换，读起来更顺
    function clauses(t) {
      var segs = [], a = 0;
      for (var i = 0; i < t.length; i++) {
        if ('，、；：？！。'.indexOf(t[i]) >= 0 || i === t.length - 1) { segs.push([a, i + 1]); a = i + 1; }
      }
      return segs;
    }
    ps.lines.forEach(function (l, k) {
      var el = h('div', { class: 'pline' }, clauses(l).map(function (sg) {
        return MZ.ruby(l.slice(sg[0], sg[1]), ps.lp[k].slice(sg[0], sg[1]), { cls: 'lg' });
      }));
      lineEls.push(el); text.appendChild(el);
    });
    async function readAll() {
      var my = ++reading;
      for (var k = 0; k < ps.lines.length; k++) {
        if (my !== reading) return;
        lineEls.forEach(function (e) { e.classList.remove('on'); });
        lineEls[k].classList.add('on');
        var ok = await MZ.speak(ps.lines[k], { queue: false });
        if (!ok) await new Promise(function (r) { setTimeout(r, 900); });
      }
      lineEls.forEach(function (e) { e.classList.remove('on'); });
    }
    var qbox = h('div', { class: 'rq' });
    function startQ() {
      var k = 0, right = 0;
      function showQ() {
        MZ.clear(qbox);
        if (k >= ps.qs.length) {
          var all = right === ps.qs.length, first = all && !S.get().reads[ps.id];
          if (all) { var st = S.get(); if (!st.reads[ps.id]) { st.reads[ps.id] = Date.now(); st.stars++; S.save(); } MZ.sfx.win(); MZ.confetti(70); }
          qbox.appendChild(h('div', { class: 'rq-done' }, MZ.mascot(all ? 'cheer' : 'happy', 80),
            h('p', null, all ? '全部答对啦！' + (first ? '获得 1 颗星星！' : '') : '答对了 ' + right + ' / ' + ps.qs.length + '，再读一遍，全答对才算读完哦。'),
            h('button', { class: 'btn ghost', onclick: tap(function () { startQ(); }) }, icon('redo'), '再做一遍')));
          MZ.afterActivity(); return;
        }
        var q = ps.qs[k], locked = false;
        var opts = h('div', { class: 'rq-opts' });
        MZ.shuffle(q.o.map(function (t, j) { return { t: t, ok: j === q.a }; })).forEach(function (o) {
          var b = h('button', { class: 'opt text', onclick: tap(function () {
            if (locked) return; locked = true;
            b.classList.add(o.ok ? 'right' : 'wrong'); if (o.ok) { right++; MZ.sfx.ok(); } else { MZ.sfx.bad(); Array.prototype.forEach.call(opts.children, function (x) { if (x._ok) x.classList.add('right'); }); }
            setTimeout(function () { k++; showQ(); }, 900);
          }) }, o.t);
          b._ok = o.ok; opts.appendChild(b);
        });
        qbox.appendChild(h('div', { class: 'rq-h' }, '第 ' + (k + 1) + ' / ' + ps.qs.length + ' 题'));
        qbox.appendChild(h('div', { class: 'rq-q' }, q.q)); qbox.appendChild(opts);
      }
      showQ();
    }
    var o = storyTabs('read'); o.title = ps.title;
    var node = h('section', { class: 'screen passage th-grape' }, topbar(o),
      h('div', { class: 'passage-body' },
        h('div', { class: 'pleft' }, h('div', { class: 'ptitle' }, h('h2', null, ps.title), h('span', { class: 'kind' }, ps.kind), ps.by ? h('span', { class: 'by' }, ps.by) : null), text),
        h('div', { class: 'pright' },
          h('div', { class: 'pact' },
            h('button', { class: 'btn grape', onclick: tap(readAll) }, icon('speaker'), '朗读全文'),
            h('button', { class: 'btn ghost', onclick: tap(function () { reading++; MZ.stopSpeak(); lineEls.forEach(function (e) { e.classList.remove('on'); }); }) }, '停止'),
            h('button', { class: 'btn ghost', onclick: tap(function () { var st = S.get(); st.set.pinyin = !st.set.pinyin; S.save(); MZ.refreshChrome(); }) }, '拼音 开/关')),
          h('p', { class: 'tip' }, '点一点任何一个字，都能听到它的读音。'),
          h('div', { class: 'qwrap' }, qbox, h('button', { class: 'btn coral lg', onclick: tap(startQ) }, '读完啦，做题！')))));
    return { node: node, leave: function () { reading++; } };
  };

  /* ================= 闯关 / 成就 ================= */
  VIEWS.levels = function (p) {
    var tab = p.tab || 'lv', s = S.get(), bk = p.bk;
    function passedL(L) { return !!(s.levels[L.id] && s.levels[L.id].stars >= 1); }
    function levelsOf(b) { return MZ.LEVELS.filter(function (L) { return L.book === b; }); }
    if (bk == null) {
      bk = 'sp';
      for (var bb = 0; bb < D.books.length; bb++) { if (levelsOf(bb).some(function (L) { return !passedL(L); })) { bk = bb; break; } }
    }
    var node = h('section', { class: 'screen lv th-teal' }, topbar({
      title: tab === 'lv' ? '闯关' : '成就',
      tabs: [{ k: 'lv', label: '闯关' }, { k: 'ach', label: '成就' }], tab: tab,
      onTab: function (k) { MZ.go('levels', { tab: k }, { replace: true }); },
    }));
    if (tab === 'lv') {
      var strip = h('nav', { class: 'bookstrip sm' });
      var books = D.books.map(function (b, k) { return { k: k, icon: b.icon, t1: '第' + (k + 1) + '册', t2: b.name.split(' · ')[1] || b.name }; }).concat([{ k: 'sp', icon: '⭐', t1: '特别', t2: '特别关卡' }]);
      books.forEach(function (b) {
        var ls = levelsOf(b.k), n = ls.filter(passedL).length;
        strip.appendChild(h('button', { class: 'bk' + (b.k === bk ? ' on' : ''), onclick: tap(function () { MZ.go('levels', { bk: b.k }, { replace: true }); }) },
          h('span', { class: 'bk-ic' }, b.icon), h('span', { class: 'bk-t' }, h('i', null, b.t1), h('b', null, b.t2)), h('em', null, n + '/' + ls.length), bar(n, ls.length)));
      });
      var grid = h('div', { class: 'lvgrid' });
      levelsOf(bk).forEach(function (L) {
        var open = MZ.levelUnlocked(L), st = s.levels[L.id] ? s.levels[L.id].stars : 0;
        var stars = [0, 1, 2].map(function (k) { return h('span', { class: 'sstar' + (k < st ? ' on' : '') }, icon('star')); });
        var sub = L.kind === 'chars' ? L.groups.slice(0, 2).map(function (g) { return D.groups[g].name; }).join(' ') + (L.groups.length > 2 ? ' 等' : '')
          : L.kind === 'pinyin' ? '声母 韵母 拼读' : L.kind === 'radical' ? '偏旁部首' : L.kind === 'poem' ? '补全诗句' : L.kind === 'mix' ? '学过的字大回顾' : '成语';
        grid.appendChild(h('button', { class: 'lvcard c-' + L.color + (open ? '' : ' locked') + (L.special ? ' special' : ''), onclick: tap(function () {
          if (!open) { MZ.toast(MZ.levelHint(L)); return; }
          startIntro(L);
        }) },
          h('span', { class: 'no' }, String(L.id)), h('b', null, L.name), h('i', null, sub),
          open ? h('div', { class: 'sstars' }, stars) : h('span', { class: 'lockic' }, icon('lock'))));
      });
      node.appendChild(h('div', { class: 'lv-body' }, strip, h('p', { class: 'tip' }, '每关 8 道题。答对越多，星星越多：★ 3 颗需要至少答对 7 题。'), h('div', { class: 'pin-scroll' }, grid)));
    } else {
      var n = MZ.ACH.filter(function (a) { return s.ach[a.id]; }).length;
      var ag = h('div', { class: 'achgrid' });
      MZ.ACH.forEach(function (a) {
        var on = !!s.ach[a.id], pr = a.prog(s);
        ag.appendChild(h('div', { class: 'ach' + (on ? ' on' : '') }, MZ.medal(a), h('b', null, a.name), h('i', null, a.desc),
          on ? h('em', null, '已获得') : h('div', { class: 'ach-p' }, bar(Math.min(pr[0], pr[1]), pr[1]), h('span', null, Math.min(pr[0], pr[1]) + ' / ' + pr[1]))));
      });
      node.appendChild(h('div', { class: 'lv-body' }, h('p', { class: 'tip' }, '已获得 ' + n + ' / ' + MZ.ACH.length + ' 枚奖章'), h('div', { class: 'pin-scroll' }, ag)));
    }
    function startIntro(L) {
      MZ.modal({
        title: '第 ' + L.id + ' 关 · ' + L.name,
        body: h('div', { class: 'intro' }, MZ.mascot('cheer', 80), h('p', null, '一共 ' + MZ.LEVEL_Q + ' 道题，准备好了吗？答对 7 题就能拿 3 颗星！')),
        buttons: [{ label: '再等等', kind: 'ghost' }, { label: '开始闯关', kind: 'coral', onClick: function () { MZ.go('quiz', { id: L.id }); } }],
      });
    }
    return { node: node, after: function () { var on = node.querySelector('.bk.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' }); } };
  };

  VIEWS.quiz = function (p) {
    var L = MZ.levelById(p.id), qs = MZ.buildLevel(L);
    return MZ.qrun({
      qs: qs, color: L.color, title: '第 ' + L.id + ' 关 · ' + L.name, exitText: '退出后，这一关的成绩不会保存。',
      onFinish: function (cx) {
        var N = cx.N, score = cx.score, area = cx.area;
        var s = S.get(), old = s.levels[L.id] || { stars: 0, best: 0 }, ns = MZ.starsFor(score, N), gain = Math.max(0, ns - old.stars);
        s.levels[L.id] = { stars: Math.max(old.stars, ns), best: Math.max(old.best, score) };
        s.stars += gain; S.save();
        // 闯关也算复习：答错的字变成“迷糊字宝”，该复习的字答对了就升档
        cx.results.forEach(function (r) { if (r && r.q.c) MZ.rev.grade(r.q.c, r.ok); });
        var nextL = MZ.LEVELS.filter(function (l) { return l.prev === L.id; })[0];
        var stars = [0, 1, 2].map(function (k) { return h('span', { class: 'rstar' + (k < ns ? ' on' : ''), style: { animationDelay: (0.35 + k * 0.35) + 's' } }, icon('star')); });
        area.appendChild(h('div', { class: 'result' }, MZ.mascot(ns >= 2 ? 'cheer' : ns === 1 ? 'happy' : 'oops', 110),
          h('h2', null, ns === 3 ? '太棒了！三星通关！' : ns >= 1 ? '通关成功！' : '差一点点，再试试吧'),
          h('div', { class: 'rstars' }, stars),
          h('p', null, '答对 ' + score + ' / ' + N + ' 题' + (gain > 0 ? '，新得到 ' + gain + ' 颗星星' : '')),
          h('div', { class: 'racts' },
            h('button', { class: 'btn ghost', onclick: tap(function () { MZ.go('quiz', { id: L.id }, { replace: true }); }) }, icon('redo'), '再玩一次'),
            h('button', { class: 'btn ghost', onclick: tap(function () { MZ.go('levels', { bk: L.book }, { replace: true }); }) }, '回到地图'),
            ns >= 1 && nextL && MZ.levelUnlocked(nextL) ? h('button', { class: 'btn teal', onclick: tap(function () { MZ.go('quiz', { id: nextL.id }, { replace: true }); }) }, '下一关', icon('next')) : null)));
        if (ns >= 1) { MZ.sfx.win(); MZ.confetti(ns === 3 ? 160 : 90); } else MZ.sfx.bad();
        MZ.afterActivity();
      },
    });
  };

  /* ================= 设置 / 关于 ================= */
  function openSettings() {
    var s = S.get();
    function toggle(label, key) {
      var b = h('button', { class: 'tg' + (s.set[key] ? ' on' : ''), role: 'switch', 'aria-checked': String(!!s.set[key]), onclick: function () {
        s.set[key] = !s.set[key]; S.save(); b.classList.toggle('on', s.set[key]); b.setAttribute('aria-checked', String(!!s.set[key])); MZ.sfx.tap(); MZ.refreshChrome();
      } }, h('i'));
      return h('div', { class: 'srow' }, h('span', null, label), b);
    }
    var rates = [{ v: 0.7, t: '慢' }, { v: 0.85, t: '适中' }, { v: 1, t: '快' }];
    var rateRow = h('div', { class: 'srow' }, h('span', null, '朗读速度'), h('div', { class: 'seg sm' }, rates.map(function (r) {
      var b = h('button', { class: 'seg-b' + (Math.abs(s.set.rate - r.v) < 0.01 ? ' on' : ''), onclick: function () {
        s.set.rate = r.v; S.save(); Array.prototype.forEach.call(b.parentNode.children, function (x) { x.classList.remove('on'); }); b.classList.add('on'); MZ.speak('你好，小朋友'); } }, r.t);
      return b;
    })));
    var body = h('div', { class: 'settings' },
      toggle('声音（朗读和音效）', 'sound'), toggle('显示拼音', 'pinyin'), rateRow,
      h('div', { class: 'srow' }, h('span', null, '开源声明'), h('button', { class: 'btn ghost sm', onclick: function () { MZ.sfx.tap(); document.getElementById('modal').classList.remove('on'); MZ.go('about'); } }, '查看')),
      h('div', { class: 'srow' }, h('span', null, '清空学习记录'), h('button', { class: 'btn danger sm', onclick: function () {
        MZ.modal({ title: '确定要清空吗？', body: '星星、学会的字、奖章都会被清除，不能恢复。', buttons: [{ label: '不清空', kind: 'coral' }, { label: '确定清空', kind: 'danger', onClick: function () { S.reset(); MZ.toast('已清空，从头开始吧！'); MZ.home(); } }] });
      } }, '清空')));
    MZ.modal({ title: '设置', body: body, buttons: [{ label: '完成', kind: 'coral' }] });
  }

  VIEWS.about = function () {
    var L = window.LICENSES || {};
    var node = h('section', { class: 'screen about th-sky' }, topbar({ title: '关于 · 开源声明' }),
      h('div', { class: 'about-body pin-scroll' },
        h('div', { class: 'ab-card' }, MZ.mascot('happy', 70),
          h('div', null, h('h2', null, '墨点识字'), h('p', null, '这是一个离线的汉字学习小应用：不联网、不收集任何信息、没有广告。学习记录只保存在这台设备上。'))),
        h('div', { class: 'ab-card col' },
          h('h3', null, '内容来源'),
          h('p', null, '字表、组词、例句、成语小故事、儿歌短文、部首讲解，以及“墨墨”的形象，均为本应用原创。')),
        h('div', { class: 'ab-card col' },
          h('h3', null, '开源组件'),
          h('p', null, '汉字笔顺动画与描红：Hanzi Writer（MIT 许可证，© 2014 David Chanin）。'),
          h('p', null, '汉字笔画数据：hanzi-writer-data，源自 Make Me a Hanzi 项目，使用 Arphic Public License（文泉驿/文鼎字体衍生数据）。以下为许可证原文，保持未改动：'),
          h('pre', { class: 'lic' }, L.arphic || '（许可证原文见应用包内 licenses/ARPHICPL.TXT）'),
          h('pre', { class: 'lic' }, L.hanziwriter || '（许可证原文见应用包内 licenses/HANZI-WRITER-LICENSE-MIT.txt）'))));
    return { node: node };
  };

  /* ---------- 启动 ---------- */
  MZ.start = function () {
    S.get(); S.touchDay(); MZ.rev.migrate(); MZ.refreshChrome();
    MZ.home();
  };
})();
