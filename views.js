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
  };
  function icon(n, cls) { return h('span', { class: 'ic ' + (cls || ''), html: I[n] }); }
  function tap(fn) { return function (ev) { MZ.sfx.tap(); fn(ev); }; }

  /* ---------- 路由 ---------- */
  var VIEWS = {}, stack = [], leave = null;
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
  MZ.refreshChrome = function () {
    var s = S.get();
    document.body.classList.toggle('no-py', !s.set.pinyin);
    Array.prototype.forEach.call(document.querySelectorAll('[data-stat="stars"]'), function (el) { el.textContent = String(s.stars); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-stat="streak"]'), function (el) { el.textContent = String(S.streak()); });
  };

  /* ---------- 通用部件 ---------- */
  function stats() {
    return h('div', { class: 'stats' },
      h('span', { class: 'pill star' }, icon('star'), h('b', { data: { stat: 'stars' } }, String(S.get().stars))),
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
  function dailyMark(c) {
    var s = S.get(), t = MZ.today();
    if (s.daily.date !== t) s.daily = { date: t, n: 0, done: false, chars: {} };
    if (!s.daily.chars) s.daily.chars = {};
    if (c && !s.daily.chars[c]) { s.daily.chars[c] = 1; s.daily.n++; }
    if (s.daily.n >= MZ.DAILY_GOAL && !s.daily.done) {
      s.daily.done = true; S.save();
      setTimeout(function () { MZ.toast('今日目标完成啦！墨墨为你鼓掌 👏'); MZ.confetti(140); MZ.sfx.win(); }, 900);
    } else S.save();
  }
  function groupOf(c) { for (var i = 0; i < D.groups.length; i++) if (D.groups[i].chars.indexOf(c) >= 0) return i; return 0; }

  /* ================= 首页 ================= */
  VIEWS.home = function () {
    var s = S.get(), learned = S.learnedCount(), done = S.dailyN(), goal = MZ.DAILY_GOAL;
    var passed = Object.keys(s.levels).filter(function (k) { return s.levels[k].stars >= 1; }).length;
    var say = learned === 0 ? '我是墨墨！我们从“一”开始学吧。'
      : done < goal ? '再学 ' + (goal - done) + ' 个字，就完成今日目标啦！'
      : '今天的目标完成啦，去闯关玩一玩吧！';
    function card(cls, glyph, title, sub, meta, to) {
      return h('button', { class: 'bigcard ' + cls, onclick: tap(function () { MZ.go(to.name, to.params); }) },
        h('div', { class: 'bc-glyph' }, glyph), h('h3', null, title), h('p', null, sub), h('div', { class: 'bc-meta' }, meta));
    }
    var dots = [];
    for (var i = 0; i < goal; i++) dots.push(h('span', { class: 'gdot' + (i < done ? ' on' : '') }, icon('star')));
    var node = h('section', { class: 'screen home' },
      h('header', { class: 'top home-top' },
        h('div', { class: 'brand' }, MZ.mascot('happy', 52),
          h('div', null, h('h1', null, '墨点识字'), h('p', null, '和墨墨一起，开心认汉字'))),
        h('div', { class: 'grow' }), stats(),
        h('button', { class: 'icon-btn', 'aria-label': '设置', onclick: tap(openSettings) }, icon('gear'))),
      h('div', { class: 'cards' },
        card('c-coral', '字', '识字', '看笔顺 · 描红', ['已学 ' + learned + ' / ' + ALL + ' 字', bar(learned, ALL)], { name: 'learn' }),
        card('c-sky', '拼', '拼音偏旁', '声母韵母 · 偏旁', ['声调 · 偏旁 ' + D.radicals.length + ' 个', bar(((s.levels[13] && s.levels[13].stars) ? 1 : 0) + ((s.levels[14] && s.levels[14].stars) ? 1 : 0), 2)], { name: 'pinyin' }),
        card('c-grape', '读', '成语阅读', '成语故事 · 儿歌', ['已读 ' + (S.count(s.idioms) + S.count(s.reads)) + ' / ' + (D.idioms.length + D.passages.length) + ' 篇', bar(S.count(s.idioms) + S.count(s.reads), D.idioms.length + D.passages.length)], { name: 'idioms' }),
        card('c-teal', '闯', '闯关成就', '闯关 · 领奖章', ['通关 ' + passed + ' / ' + MZ.LEVELS.length, bar(passed, MZ.LEVELS.length)], { name: 'levels' })),
      h('footer', { class: 'home-foot' },
        h('button', { class: 'talk', onclick: function () { MZ.speak(say); MZ.sfx.tap(); } }, MZ.mascot('cheer', 78), h('div', { class: 'bubble' }, say, icon('speaker'))),
        h('div', { class: 'goal' }, h('span', null, '今日目标'), h('div', { class: 'gdots' }, dots), h('em', null, done + ' / ' + goal))));
    return { node: node };
  };

  /* ================= 识字：分组 + 字表 ================= */
  VIEWS.learn = function (p) {
    var s = S.get(), gi = p.g;
    if (gi == null) {
      gi = 0;
      for (var i = 0; i < D.groups.length; i++) {
        if (D.groups[i].chars.some(function (c) { return !s.learned[c]; })) { gi = i; break; }
      }
    }
    var side = h('nav', { class: 'side' }), main = h('div', { class: 'main' });
    function renderSide() {
      MZ.clear(side);
      D.groups.forEach(function (g, k) {
        var n = g.chars.filter(function (c) { return s.learned[c]; }).length;
        side.appendChild(h('button', { class: 'side-b' + (k === gi ? ' on' : ''), onclick: tap(function () { gi = k; renderSide(); renderMain(); }) },
          h('span', null, g.name), h('em', null, n + '/' + g.chars.length), bar(n, g.chars.length)));
      });
    }
    function renderMain() {
      MZ.clear(main);
      var g = D.groups[gi], n = g.chars.filter(function (c) { return s.learned[c]; }).length;
      main.appendChild(h('div', { class: 'grp-head' }, h('h2', null, g.name), h('span', null, '已学会 ' + n + ' / ' + g.chars.length + ' 个字')));
      var grid = h('div', { class: 'tiles' });
      g.chars.forEach(function (c) {
        var ch = D.chars[c], done = !!s.learned[c];
        grid.appendChild(h('button', { class: 'tile' + (done ? ' done' : ''), onclick: tap(function () { MZ.go('char', { c: c, g: gi }); }) },
          h('i', null, ch.p), h('b', null, c), done ? h('span', { class: 'tick' }, icon('check')) : null));
      });
      main.appendChild(grid);
    }
    renderSide(); renderMain();
    var node = h('section', { class: 'screen learn th-coral' }, topbar({ title: '识字' }), h('div', { class: 'split' }, side, main));
    return { node: node, after: function () { var on = side.querySelector('.side-b.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' }); } };
  };

  /* ================= 汉字详情：笔顺 + 描红 ================= */
  VIEWS.char = function (p) {
    var c = p.c, ch = D.chars[c], gi = groupOf(c), list = D.groups[gi].chars, idx = list.indexOf(c);
    var writer = null, token = 0;
    var hw = h('div', { class: 'hw' });
    var prog = h('div', { class: 'strk' }, '共 ' + ch.n + ' 笔');
    var board = h('div', { class: 'board' }, hw, prog);
    var hint = h('div', { class: 'hint' }, '先点“看笔顺”，再点“我来写”');
    var learnedBtn = h('button', { class: 'btn ghost sm', onclick: tap(function () {
      var s = S.get(); if (s.learned[c]) return;
      s.learned[c] = Date.now(); S.save(); dailyMark(c); MZ.afterActivity(); refreshLearned();
    }) });
    function refreshLearned() {
      var done = !!S.get().learned[c];
      MZ.clear(learnedBtn); learnedBtn.classList.toggle('done', done);
      learnedBtn.appendChild(done ? icon('check') : document.createTextNode(''));
      learnedBtn.appendChild(document.createTextNode(done ? ' 已学会' : '我认识这个字了'));
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
      setHint('照着浅色的字，一笔一笔写。写错了会有提示。');
      writer.quiz({
        leniency: 1.5, showHintAfterMisses: 2, highlightOnComplete: true, markStrokeCorrectAfterMisses: 4,
        onCorrectStroke: function (d) { MZ.sfx.stroke(); prog.textContent = '已写 ' + (d.strokeNum + 1) + ' / ' + ch.n + ' 笔'; },
        onMistake: function () { MZ.sfx.bad(); board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake'); },
        onComplete: function () { if (my === token) finishWrite(); },
      });
    }
    function finishWrite() {
      var s = S.get(), first = !s.starred[c];
      s.wrote++; var newly = !s.learned[c]; s.learned[c] = s.learned[c] || Date.now();
      if (first) { s.starred[c] = 1; s.stars++; }
      S.save(); dailyMark(c);
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
    var chips = [h('span', { class: 'chip' }, ch.n + ' 画')];
    if (ch.r != null) {
      var R = D.radicals[ch.r];
      chips.push(h('button', { class: 'chip link', onclick: tap(function () { MZ.go('pinyin', { tab: 'rad', ri: ch.r }); }) }, '偏旁 ' + R.f + '（' + R.n + '）'));
    }
    var info = h('div', { class: 'info' },
      h('div', { class: 'py-row' }, h('div', { class: 'bigpy' }, ch.p), speakBtn(c, 'big', true)),
      h('div', { class: 'chips' }, chips),
      ch.note ? h('div', { class: 'note' }, ch.note) : null,
      h('h4', null, '组词'), h('div', { class: 'wcards' }, wordCards),
      h('h4', null, '例句'),
      h('div', { class: 'sent' }, MZ.ruby(ch.sent, ch.sp, { cls: 'md' }), speakBtn(ch.sent, 'sm')),
      h('div', { class: 'info-foot' },
        learnedBtn,
        h('div', { class: 'nav2' },
          h('button', { class: 'btn ghost sm', onclick: tap(function () { MZ.go('char', { c: list[(idx - 1 + list.length) % list.length], g: gi }, { replace: true }); }) }, icon('back'), '上一个'),
          h('span', null, (idx + 1) + ' / ' + list.length),
          h('button', { class: 'btn ghost sm', onclick: tap(function () { MZ.go('char', { c: list[(idx + 1) % list.length], g: gi }, { replace: true }); }) }, '下一个', icon('next')))));
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
    var cats = ['全部', '寓言', '品格', '风景', '心情', '祝福'], cat = p.cat || '全部', s = S.get();
    var o = storyTabs('idiom'); o.title = '成语';
    var node = h('section', { class: 'screen story th-grape' }, topbar(o));
    var chips = h('div', { class: 'cats' }, cats.map(function (c) {
      return h('button', { class: 'cat' + (c === cat ? ' on' : ''), onclick: tap(function () { MZ.go('idioms', { cat: c }, { replace: true }); }) }, c);
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

  VIEWS.reads = function () {
    var s = S.get();
    var o = storyTabs('read'); o.title = '阅读';
    var grid = h('div', { class: 'books' });
    D.passages.forEach(function (ps) {
      var done = !!s.reads[ps.id];
      grid.appendChild(h('button', { class: 'book' + (done ? ' done' : ''), onclick: tap(function () { MZ.go('passage', { id: ps.id }); }) },
        h('span', { class: 'kind' }, ps.kind), h('b', null, ps.title), h('i', null, ps.lines[0]), done ? h('span', { class: 'tick' }, icon('check')) : null));
    });
    return { node: h('section', { class: 'screen story th-grape' }, topbar(o), h('div', { class: 'story-body' }, h('div', { class: 'pin-scroll' }, grid))) };
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
        h('div', { class: 'pleft' }, h('div', { class: 'ptitle' }, h('h2', null, ps.title), h('span', { class: 'kind' }, ps.kind)), text),
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
    var tab = p.tab || 'lv', s = S.get();
    var node = h('section', { class: 'screen lv th-teal' }, topbar({
      title: tab === 'lv' ? '闯关' : '成就',
      tabs: [{ k: 'lv', label: '闯关' }, { k: 'ach', label: '成就' }], tab: tab,
      onTab: function (k) { MZ.go('levels', { tab: k }, { replace: true }); },
    }));
    if (tab === 'lv') {
      var grid = h('div', { class: 'lvgrid' });
      MZ.LEVELS.forEach(function (L) {
        var open = MZ.levelUnlocked(L), st = s.levels[L.id] ? s.levels[L.id].stars : 0;
        var stars = [0, 1, 2].map(function (k) { return h('span', { class: 'sstar' + (k < st ? ' on' : '') }, icon('star')); });
        grid.appendChild(h('button', { class: 'lvcard c-' + L.color + (open ? '' : ' locked') + (L.special ? ' special' : ''), onclick: tap(function () {
          if (!open) { MZ.toast(L.special ? '先通过“一家人”这一关，就能来这里啦！' : '先通过前一关，才能来这里哦！'); return; }
          startIntro(L);
        }) },
          h('span', { class: 'no' }, String(L.id)), h('b', null, L.name),
          h('i', null, L.kind === 'chars' ? D.groups[L.groups[0]].name + (L.groups.length > 1 ? ' 等' : '') : L.kind === 'pinyin' ? '声母 韵母 拼读' : L.kind === 'radical' ? '偏旁部首' : '成语'),
          open ? h('div', { class: 'sstars' }, stars) : h('span', { class: 'lockic' }, icon('lock'))));
      });
      node.appendChild(h('div', { class: 'lv-body' }, h('p', { class: 'tip' }, '每关 8 道题。答对越多，星星越多：★ 3 颗需要至少答对 7 题。'), h('div', { class: 'pin-scroll' }, grid)));
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
    return { node: node };
  };

  VIEWS.quiz = function (p) {
    var L = MZ.LEVELS.filter(function (l) { return l.id === p.id; })[0];
    var qs = MZ.buildLevel(L), N = qs.length, i = 0, score = 0, locked = false, done = false;
    var segs = h('div', { class: 'qsegs' }, qs.map(function () { return h('i'); }));
    var scoreEl = h('span', { class: 'pill star' }, icon('star'), h('b', null, '0'));
    var area = h('div', { class: 'qarea' }), sheet = h('div', { class: 'qsheet' });
    var node = h('section', { class: 'screen quiz th-' + L.color },
      h('header', { class: 'top' },
        h('button', { class: 'icon-btn', 'aria-label': '退出', onclick: tap(function () {
          if (done) { MZ.back(); return; }
          MZ.modal({ title: '要退出吗？', body: '退出后，这一关的成绩不会保存。', buttons: [{ label: '继续闯关', kind: 'coral' }, { label: '退出', kind: 'ghost', onClick: function () { MZ.back(); } }] });
        }) }, icon('close')),
        h('div', { class: 'ttl' }, '第 ' + L.id + ' 关 · ' + L.name), segs, h('div', { class: 'grow' }), scoreEl), area, sheet);

    function optNode(q, o, k) {
      var b;
      var click = function () { choose(k, b); };
      if (q.optKind === 'rad') b = h('button', { class: 'opt rad', onclick: tap(click) }, h('b', null, o.f), h('i', null, o.n));
      else b = h('button', { class: 'opt ' + (q.optKind === 'char' ? 'char' : q.optKind === 'py' ? 'py' : 'text'), onclick: tap(click) }, String(o));
      return b;
    }
    // 题目内容太高时（不同 iPad 屏幕比例、两行的句子等），整体等比缩小，保证不压到顶栏和底部的反馈条
    function fitQ() {
      var box = area.querySelector('.qfit');
      if (!box) return;
      box.style.zoom = '';
      var cs = getComputedStyle(area);
      var avail = area.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      var need = box.offsetHeight;
      if (avail < 80 || need <= avail) return;
      box.style.zoom = String(Math.max(0.6, Math.floor(avail / need * 100) / 100));
    }
    function onResize() { if (!done) fitQ(); }
    window.addEventListener('resize', onResize);
    function showQ() {
      locked = false; MZ.clear(area); sheet.classList.remove('on'); MZ.clear(sheet);
      var q = qs[i];
      Array.prototype.forEach.call(segs.children, function (s, k) { s.className = k < i ? (s._ok ? 'ok' : 'no') : k === i ? 'cur' : ''; });
      var big = null;
      if (q.big) {
        if (q.big.py && q.big.py.length) big = MZ.ruby(q.big.text, q.big.py, { tap: false, cls: 'xxl' });
        else big = h('div', { class: 'qbig' + (q.big.kai ? ' kai' : '') + (q.big.text.length > 3 ? ' long' : '') }, q.big.text);
      } else if (q.ruby) {
        big = MZ.ruby(q.ruby.text, q.ruby.py, { blank: function (k) { return k === q.ruby.blank; }, tap: false, cls: 'xl' });
      }
      var opts = h('div', { class: 'qopts ' + (q.optKind === 'text' && q.opts.some(function (o) { return String(o).length > 9; }) ? 'one' : 'four') });
      q.opts.forEach(function (o, k) { opts.appendChild(optNode(q, o, k)); });
      var fitBox = h('div', { class: 'qfit' });
      fitBox.appendChild(h('div', { class: 'qprompt' }, q.prompt, q.speak ? speakBtn(q.speak, 'sm') : null));
      if (big) fitBox.appendChild(h('div', { class: 'qstage' }, big));
      fitBox.appendChild(opts);
      area.appendChild(fitBox);
      fitQ();
      if (q.autoSpeak && q.speak) setTimeout(function () { if (!done) MZ.speak(q.speak); }, 350);
    }
    function choose(k, btn) {
      if (locked) return; locked = true;
      var q = qs[i], ok = k === q.ans, opts = area.querySelector('.qopts');
      segs.children[i]._ok = ok;
      btn.classList.add(ok ? 'right' : 'wrong');
      if (!ok) { opts.children[q.ans].classList.add('right'); btn.classList.add('shake'); }
      if (ok) { score++; scoreEl.querySelector('b').textContent = String(score); MZ.sfx.ok(); } else MZ.sfx.bad();
      Array.prototype.forEach.call(opts.children, function (o) { o.disabled = true; });
      MZ.clear(sheet);
      sheet.appendChild(MZ.mascot(ok ? 'cheer' : 'oops', 70));
      sheet.appendChild(h('div', { class: 'qfb' }, h('b', null, ok ? MZ.pick(MZ.PRAISE) : MZ.pick(MZ.TRYAGAIN)), h('p', null, q.explain)));
      sheet.appendChild(h('button', { class: 'btn ' + (ok ? 'teal' : 'coral') + ' lg', onclick: tap(function () { i++; i < N ? showQ() : finish(); }) }, i + 1 < N ? '下一题' : '看结果', icon('next')));
      sheet.classList.add('on');
      if (q.after) setTimeout(function () { if (!done) MZ.speak(q.after); }, 450);
    }
    function finish() {
      done = true; MZ.stopSpeak();
      var s = S.get(), old = s.levels[L.id] || { stars: 0, best: 0 }, ns = MZ.starsFor(score, N), gain = Math.max(0, ns - old.stars);
      s.levels[L.id] = { stars: Math.max(old.stars, ns), best: Math.max(old.best, score) };
      s.stars += gain; S.save();
      var nextL = MZ.LEVELS.filter(function (l) { return l.id === L.id + 1; })[0];
      MZ.clear(area); MZ.clear(sheet); sheet.classList.remove('on');
      Array.prototype.forEach.call(segs.children, function (x) { x.className = x._ok ? 'ok' : 'no'; });
      var stars = [0, 1, 2].map(function (k) { return h('span', { class: 'rstar' + (k < ns ? ' on' : ''), style: { animationDelay: (0.35 + k * 0.35) + 's' } }, icon('star')); });
      area.appendChild(h('div', { class: 'result' }, MZ.mascot(ns >= 2 ? 'cheer' : ns === 1 ? 'happy' : 'oops', 110),
        h('h2', null, ns === 3 ? '太棒了！三星通关！' : ns >= 1 ? '通关成功！' : '差一点点，再试试吧'),
        h('div', { class: 'rstars' }, stars),
        h('p', null, '答对 ' + score + ' / ' + N + ' 题' + (gain > 0 ? '，新得到 ' + gain + ' 颗星星' : '')),
        h('div', { class: 'racts' },
          h('button', { class: 'btn ghost', onclick: tap(function () { MZ.go('quiz', { id: L.id }, { replace: true }); }) }, icon('redo'), '再玩一次'),
          h('button', { class: 'btn ghost', onclick: tap(function () { MZ.go('levels', {}, { replace: true }); }) }, '回到地图'),
          ns >= 1 && nextL && MZ.levelUnlocked(nextL) ? h('button', { class: 'btn teal', onclick: tap(function () { MZ.go('quiz', { id: nextL.id }, { replace: true }); }) }, '下一关', icon('next')) : null)));
      if (ns >= 1) { MZ.sfx.win(); MZ.confetti(ns === 3 ? 160 : 90); } else MZ.sfx.bad();
      MZ.afterActivity();
    }
    return { node: node, after: showQ, leave: function () { done = true; window.removeEventListener('resize', onResize); } };
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
    S.get(); S.touchDay(); MZ.refreshChrome();
    MZ.home();
  };
})();
