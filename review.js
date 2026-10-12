/* 墨点识字 · 叫醒字宝宝（复习）、迷糊字宝本、字宝册、听写、装扮商店 */
(function () {
  'use strict';
  var MZ = window.MZ, D = MZ.D, S = MZ.S, h = MZ.h, V = MZ.VIEWS, ui = MZ.ui;
  var icon = ui.icon, tap = ui.tap, bar = ui.bar, topbar = ui.topbar, speakBtn = ui.speakBtn;
  var ALL = D.order.length;

  function emptyBox(mood, title, text, buttons) {
    return h('div', { class: 'empty-box' }, MZ.mascot(mood, 120), h('h2', null, title), h('p', null, text), h('div', { class: 'racts' }, buttons));
  }

  /* ================= 叫醒字宝宝：入口 ================= */
  V.wake = function () {
    var cnt = MZ.rev.counts(), due = cnt.due, learned = cnt.learned;
    var left = h('div', { class: 'wk-left' });
    left.appendChild(MZ.mascot(due > 0 ? 'sleep' : 'cheer', 170));
    left.appendChild(h('h2', null, learned === 0 ? '还没有字宝宝呢' : due > 0 ? due + ' 个字宝宝睡着啦' : '字宝宝们都醒着！'));
    left.appendChild(h('p', null, learned === 0 ? '学会的每一个字，都会变成一个字宝宝。先去认识几个字吧！'
      : due > 0 ? '字宝宝睡久了会忘记自己的名字。答对问题就能叫醒它们，它们会记得更牢。'
      : '都记得很牢，真棒！想再玩一玩，可以再复习一轮。'));
    var st3 = h('div', { class: 'stg3' },
      h('div', { class: 'stg s1' }, h('span', null, '🌱'), h('b', null, String(cnt.s1)), h('i', null, '刚认识')),
      h('div', { class: 'stg s2' }, h('span', null, '🌿'), h('b', null, String(cnt.s2)), h('i', null, '比较熟')),
      h('div', { class: 'stg s3' }, h('span', null, '🌟'), h('b', null, String(cnt.s3)), h('i', null, '牢记')));
    left.appendChild(st3);

    function big(cls, emoji, title, sub, fn, badge) {
      return h('button', { class: 'wk-btn ' + cls, onclick: tap(fn) }, h('span', { class: 'wk-e' }, emoji), h('span', { class: 'wk-t' }, h('b', null, title), h('i', null, sub)), badge ? h('span', { class: 'badge' }, String(badge)) : icon('next'));
    }
    var right = h('div', { class: 'wk-right' });
    if (learned === 0) right.appendChild(big('c-coral', '🌱', '去认识新字', '先学会几个字', function () { MZ.go('learn'); }));
    else if (due > 0) right.appendChild(big('c-sky', '⏰', '叫醒字宝宝', '一轮最多 ' + Math.min(8, due) + ' 个，还有 ' + due + ' 个在睡觉', function () { MZ.go('wakeplay', { mode: 'due' }); }, due));
    else right.appendChild(big('c-sky', '🎈', '再复习一轮', '随便抽 8 个字宝宝玩一玩', function () { MZ.go('wakeplay', { mode: 'free' }); }));
    right.appendChild(big('c-grape', '😵', '迷糊字宝本', cnt.fuzzy > 0 ? cnt.fuzzy + ' 个字宝宝有点迷糊' : '现在没有迷糊的字宝宝', function () { MZ.go('fuzzy'); }, cnt.fuzzy || 0));
    right.appendChild(big('c-teal', '📒', '字宝册', '看看收集了多少字宝宝', function () { MZ.go('album'); }));
    right.appendChild(big('c-sun', '✍️', '听写练习', '听一听，把字写出来', function () { MZ.go('dictate'); }));
    var node = h('section', { class: 'screen wake th-sky' }, topbar({ title: '叫醒字宝宝' }), h('div', { class: 'wake-body' }, left, right));
    return { node: node };
  };

  /* ================= 叫醒字宝宝：一轮复习 ================= */
  V.wakeplay = function (p) {
    var mode = p.mode || 'due', s = S.get(), list;
    if (mode === 'fuzzy') list = MZ.rev.fuzzyList().slice(0, 8);
    else if (mode === 'due') list = MZ.rev.dueList().slice(0, 8);
    else list = MZ.pickN(D.order.filter(function (c) { return s.learned[c]; }), 8);
    if (!list.length) {
      return { node: h('section', { class: 'screen wake th-sky' }, topbar({ title: '叫醒字宝宝' }),
        h('div', { class: 'wake-body one' }, emptyBox('cheer', mode === 'fuzzy' ? '没有迷糊的字宝宝' : '没有要叫醒的字宝宝', '都记得很牢，真棒！去玩个小游戏，或者认识几个新字吧。',
          [h('button', { class: 'btn coral', onclick: tap(function () { MZ.go('games', {}, { replace: true }); }) }, '去玩游戏'), h('button', { class: 'btn ghost', onclick: tap(function () { MZ.go('learn', {}, { replace: true }); }) }, '去学新字')]))) };
    }
    list = MZ.shuffle(list);
    var pool = MZ.pool('learned', 12).chars;
    function build(c) {
      var r = S.get().rev[c], b = r ? r.b : 0, fz = !!(r && r.w);
      var t = (fz || b <= 1) ? MZ.pick(['listen', 'pinyin', 'listen']) : b <= 3 ? MZ.pick(['wordfill', 'pinyin', 'wordfill', 'listen']) : MZ.pick(['sentfill', 'wordfill', 'sentfill', 'listen']);
      return MZ.Q[t](c, pool, { sim: fz || b >= 3 });
    }
    var qs = list.map(build), got = [], cured = 0;
    return MZ.qrun({
      qs: qs, color: 'sky', title: mode === 'fuzzy' ? '迷糊字宝' : '叫醒字宝宝', exitText: '现在退出，这一轮的进度会丢掉哦。', noScore: false,
      requeue: function (q) { return q.c ? build(q.c) : null; },
      onAnswer: function (q, ok, retry) {
        if (retry || !q.c) return;
        var res = MZ.rev.grade(q.c, ok);
        got.push({ c: q.c, ok: ok });
        if (res && res.cured) { cured++; }
      },
      onFinish: function (cx) {
        var area = cx.area, right = got.filter(function (g) { return g.ok; }).length, n = got.length;
        var gain = mode === 'free' ? 1 : 1 + Math.floor(right / 4) + (right === n && n >= 4 ? 1 : 0);
        var st = S.get(); st.wakeRounds++; st.wakeCards += (mode === 'free' ? 0 : right);
        S.save();
        if (mode !== 'free') MZ.adv.event('wake');
        MZ.reward(gain, mode === 'free' ? '复习一轮' : '叫醒字宝宝');
        var moreDue = MZ.rev.dueList().length;
        area.appendChild(h('div', { class: 'result wk-res' }, MZ.mascot(right === n ? 'cheer' : 'happy', 110),
          h('h2', null, mode === 'free' ? '复习完成！' : '叫醒了 ' + right + ' 个字宝宝！'),
          h('div', { class: 'wk-tiles' }, got.map(function (g) {
            return h('button', { class: 'wk-tile ' + (g.ok ? 'ok' : 'no'), onclick: tap(function () { MZ.speakChar(g.c); }) }, h('span', { class: 'face' }, g.ok ? '😊' : '😵'), h('b', null, g.c), h('i', null, D.chars[g.c].p));
          })),
          h('p', null, right === n ? '全都醒啦，太厉害了！' : (n - right) + ' 个字宝宝有点迷糊，已经放进“迷糊字宝本”，多见几次就记住啦。'),
          cured ? h('p', { class: 'good' }, '🎉 有 ' + cured + ' 个迷糊字宝恢复清醒了！') : null,
          h('div', { class: 'racts' },
            moreDue > 0 && mode === 'due' ? h('button', { class: 'btn sky', onclick: tap(function () { MZ.go('wakeplay', { mode: 'due' }, { replace: true }); }) }, '再叫醒 ' + Math.min(8, moreDue) + ' 个', icon('next')) : null,
            n - right > 0 ? h('button', { class: 'btn ghost', onclick: tap(function () { MZ.go('fuzzy', {}, { replace: true }); }) }, '迷糊字宝本') : null,
            h('button', { class: 'btn ghost', onclick: tap(function () { MZ.back(); }) }, '回去'))));
        MZ.sfx.win(); MZ.confetti(right === n ? 130 : 60);
        MZ.afterActivity();
      },
    });
  };

  /* ================= 迷糊字宝本（错字本） ================= */
  V.fuzzy = function () {
    var list = MZ.rev.fuzzyList(), s = S.get();
    var body;
    if (!list.length) {
      body = h('div', { class: 'wake-body one' }, emptyBox('cheer', '没有迷糊的字宝宝！', '大家都很清醒。继续玩游戏、闯关，如果哪个字宝宝答不出来，它会来这里休息。',
        [h('button', { class: 'btn coral', onclick: tap(function () { MZ.go('games', {}, { replace: true }); }) }, '去玩游戏'), h('button', { class: 'btn ghost', onclick: tap(function () { MZ.back(); }) }, '返回')]));
    } else {
      var grid = h('div', { class: 'fz-grid' });
      list.forEach(function (c) {
        var r = s.rev[c], ch = D.chars[c], k = Math.min(3, r.k || 0);
        var hearts = h('span', { class: 'hearts' }, [0, 1, 2].map(function (i) { return h('i', { class: i < k ? 'on' : '' }, '♥'); }));
        grid.appendChild(h('button', { class: 'fz-tile', onclick: tap(function () { MZ.go('char', { c: c, g: MZ.groupOf(c) }); }) },
          ch.e ? h('span', { class: 'te' }, ch.e) : null, h('i', null, ch.p), h('b', null, c), hearts));
      });
      body = h('div', { class: 'fz-body' },
        h('div', { class: 'fz-top' }, MZ.mascot('think', 84),
          h('div', { class: 'fz-say' }, h('b', null, list.length + ' 个字宝宝有点迷糊'), h('p', null, '它们只是还没记牢。连续答对 3 次（♥♥♥），就恢复清醒啦！点一点字宝宝，可以重新看看它。')),
          h('button', { class: 'btn sky lg', onclick: tap(function () { MZ.go('wakeplay', { mode: 'fuzzy' }); }) }, '叫醒它们', icon('next'))),
        h('div', { class: 'pin-scroll' }, grid));
    }
    return { node: h('section', { class: 'screen fuzzy th-sky' }, topbar({ title: '迷糊字宝本' }), body) };
  };

  /* ================= 字宝册：收集册 ================= */
  V.album = function (p) {
    var s = S.get(), bi = p.b != null ? p.b : (s.book || 0), flt = p.f || 'all';
    if (bi >= D.books.length) bi = 0;
    var FILTERS = [{ k: 'all', t: '全部' }, { k: 'got', t: '已收集' }, { k: 'zz', t: '睡着了' }, { k: 'fz', t: '迷糊' }, { k: 's3', t: '牢记' }];
    function pass(c) {
      if (flt === 'all') return true;
      if (flt === 'got') return !!s.learned[c];
      if (flt === 'zz') return MZ.rev.isDue(c);
      if (flt === 'fz') return MZ.rev.isFuzzy(c);
      return MZ.rev.stage(c) === 3;
    }
    var total = S.learnedCount();
    var strip = h('nav', { class: 'bookstrip sm' });
    D.books.forEach(function (b, k) {
      var st = MZ.bookStat(k), nm = b.name.split(' · ');
      strip.appendChild(h('button', { class: 'bk' + (k === bi ? ' on' : '') + (st.got === st.total ? ' full' : ''), onclick: tap(function () { s.book = k; S.save(); MZ.go('album', { b: k, f: flt }, { replace: true }); }) },
        h('span', { class: 'bk-ic' }, b.icon), h('span', { class: 'bk-t' }, h('i', null, nm[0]), h('b', null, nm[1] || nm[0])), h('em', null, st.got + '/' + st.total), bar(st.got, st.total)));
    });
    var filters = h('div', { class: 'cats' }, FILTERS.map(function (f) {
      return h('button', { class: 'cat' + (f.k === flt ? ' on' : ''), onclick: tap(function () { MZ.go('album', { b: bi, f: f.k }, { replace: true }); }) }, f.t);
    }));
    var legend = h('div', { class: 'al-legend' }, h('span', { class: 'lg st1' }, '🌱 刚认识'), h('span', { class: 'lg st2' }, '🌿 比较熟'), h('span', { class: 'lg st3' }, '🌟 牢记'));
    var scroll = h('div', { class: 'pin-scroll' }), shown = 0;
    D.books[bi].groups.forEach(function (gk) {
      var g = D.groups[gk], cs = g.chars.filter(pass);
      if (!cs.length) return;
      shown += cs.length;
      var got = g.chars.filter(function (c) { return s.learned[c]; }).length;
      scroll.appendChild(h('div', { class: 'ahead' }, h('b', null, g.name), h('em', null, got + ' / ' + g.chars.length)));
      var grid = h('div', { class: 'agrid' });
      cs.forEach(function (c) {
        var ch = D.chars[c], st = MZ.rev.stage(c), fz = MZ.rev.isFuzzy(c), zz = MZ.rev.isDue(c);
        grid.appendChild(h('button', { class: 'acard st' + st, onclick: tap(function () { MZ.go('char', { c: c, g: gk }); }) },
          st ? (ch.e ? h('span', { class: 'ae' }, ch.e) : h('span', { class: 'ae sp' })) : h('span', { class: 'ae q' }, '？'),
          h('b', null, c), h('i', null, st ? ch.p : ''),
          st && (fz || zz) ? h('span', { class: 'zz' }, fz ? '😵' : '😴') : null));
      });
      scroll.appendChild(grid);
    });
    if (!shown) scroll.appendChild(h('div', { class: 'al-empty' }, MZ.mascot('think', 90), h('p', null, flt === 'all' ? '这一册里还没有字。' : '这里暂时没有字宝宝。')));
    var node = h('section', { class: 'screen album th-teal' }, topbar({ title: '字宝册' }),
      h('div', { class: 'al-body' }, strip,
        h('div', { class: 'al-bar' }, filters, h('div', { class: 'grow' }), legend, h('span', { class: 'al-sum' }, '收集 ' + total + ' / ' + ALL)), scroll));
    return { node: node, after: function () { var on = strip.querySelector('.bk.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' }); } };
  };

  /* ================= 听写练习 ================= */
  function strokeLoader(chr, onLoad, onErr) { var d = window.STROKES[chr]; d ? onLoad(d) : onErr(); }
  V.dictate = function () {
    var s = S.get(), pool = D.order.filter(function (c) { return s.learned[c]; });
    if (!pool.length) {
      return { node: h('section', { class: 'screen dict th-grape' }, topbar({ title: '听写' }),
        h('div', { class: 'wake-body one' }, emptyBox('think', '先认识几个字吧', '听写是“听一听，把字写出来”。学会了字，才能来听写哦。', [h('button', { class: 'btn coral', onclick: tap(function () { MZ.go('learn', {}, { replace: true }); }) }, '去识字')]))) };
    }
    var list = MZ.pickN(pool, Math.min(5, pool.length)), k = 0, token = 0, done = false;
    var writer = null, mistakes = 0, hints = 0, hstage = 0, finished = false, results = [];
    var segs = h('div', { class: 'qsegs' }, list.map(function () { return h('i'); }));
    var hw = h('div', { class: 'hw' }), prog = h('div', { class: 'strk' }, ''), board = h('div', { class: 'board' }, hw, prog);
    var hintLine = h('div', { class: 'hint' }, '');
    var hintBox = h('div', { class: 'dict-hints' });
    var fb = h('div', { class: 'dict-fb' });
    var cardTitle = h('div', { class: 'dict-n' });
    var btnNext = h('button', { class: 'btn teal lg', style: { display: 'none' }, onclick: tap(function () { next(); }) }, '下一个', icon('next'));
    var btnHint = h('button', { class: 'btn sky', onclick: tap(function () { giveHint(); }) }, h('span', { class: 'ic' }, '💡'), '提示一下');
    var btnSkip = h('button', { class: 'btn ghost', onclick: tap(function () { skip(); }) }, '不会，看答案');
    var res = h('div', { class: 'dict-res' });
    var main = h('div', { class: 'char-body dict-body' },
      h('div', { class: 'left' }, board, hintLine),
      h('div', { class: 'info dict-card' },
        cardTitle,
        h('div', { class: 'dict-say' }, h('button', { class: 'icon-btn big', 'aria-label': '再听一遍', onclick: tap(function () { say(); }) }, icon('speaker')),
          h('div', null, h('b', null, '听一听，写出来'), h('p', null, '照着听到的，用手指在左边的格子里写。'))),
        hintBox, fb,
        h('div', { class: 'dict-btns' }, btnHint, btnSkip), btnNext));
    var node = h('section', { class: 'screen dict th-grape' },
      h('header', { class: 'top' },
        h('button', { class: 'icon-btn', 'aria-label': '退出', onclick: tap(function () {
          if (done) { MZ.back(); return; }
          MZ.modal({ title: '要退出吗？', body: '现在退出，这一次听写不会记录哦。', buttons: [{ label: '继续写', kind: 'coral' }, { label: '退出', kind: 'ghost', onClick: function () { MZ.back(); } }] });
        }) }, icon('close')),
        h('div', { class: 'ttl' }, '听写'), segs, h('div', { class: 'grow' }), ui.stats()),
      main);
    function say() { var c = list[k], ch = D.chars[c]; MZ.speak(ch.words[0] + '，' + MZ.say(c)); }
    function giveHint() {
      if (finished || !writer) return;
      var c = list[k], ch = D.chars[c];
      hints++; hstage++;
      if (hstage === 1) { hintBox.appendChild(h('span', { class: 'dh' }, '拼音：' + ch.p)); }
      else if (hstage === 2) { var w = ch.words[0]; hintBox.appendChild(h('span', { class: 'dh' }, '词语：' + w.replace(c, '＿'))); }
      else { try { writer.showOutline(); setTimeout(function () { try { writer.hideOutline(); } catch (e) { /* ignore */ } }, 2600); } catch (e) { /* ignore */ } hintBox.appendChild(h('span', { class: 'dh' }, '偷看一下轮廓～')); }
      if (hstage >= 3) btnHint.disabled = true;
    }
    function setSeg() { Array.prototype.forEach.call(segs.children, function (el, i) { el.className = i < results.length ? (results[i].ok ? 'ok' : 'no') : i === k ? 'cur' : ''; }); }
    function load() {
      var c = list[k], my = ++token;
      mistakes = 0; hints = 0; hstage = 0; finished = false;
      MZ.clear(hintBox); MZ.clear(fb); MZ.clear(hw); btnNext.style.display = 'none'; btnHint.disabled = false; btnSkip.disabled = false;
      cardTitle.textContent = '第 ' + (k + 1) + ' / ' + list.length + ' 个';
      prog.textContent = '写这个字'; hintLine.textContent = '想好了就开始写，一笔一笔来。';
      setSeg();
      var size = Math.max(200, Math.floor(Math.min(board.clientWidth, board.clientHeight)));
      try {
        writer = HanziWriter.create(hw, c, {
          width: size, height: size, padding: Math.round(size * 0.06), charDataLoader: strokeLoader,
          strokeColor: '#2A2748', outlineColor: '#E3D6BA', drawingColor: '#FF7A59', highlightColor: '#2FB9A5',
          showOutline: false, showCharacter: false, strokeAnimationSpeed: 1.3, delayBetweenStrokes: 240, drawingWidth: Math.round(size * 0.07),
        });
        writer.quiz({
          leniency: 1.5, showHintAfterMisses: 3, highlightOnComplete: true, markStrokeCorrectAfterMisses: 5,
          onCorrectStroke: function (d) { MZ.sfx.stroke(); prog.textContent = '已写 ' + (d.strokeNum + 1) + ' / ' + D.chars[c].n + ' 笔'; },
          onMistake: function () { mistakes++; MZ.sfx.bad(); board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake'); },
          onComplete: function () { if (my === token) finishItem(false); },
        });
      } catch (e) { hw.textContent = c; hw.classList.add('fallback'); }
      setTimeout(function () { if (my === token && !done) say(); }, 450);
    }
    function finishItem(skipped) {
      if (finished) return; finished = true;
      var c = list[k], ok = !skipped && mistakes <= 2 && hints <= 1, perfect = !skipped && mistakes === 0 && hints === 0;
      MZ.rev.grade(c, ok);
      results.push({ c: c, ok: ok, perfect: perfect, skipped: skipped });
      setSeg();
      btnHint.disabled = true; btnSkip.disabled = true;
      if (skipped) {
        try { writer.cancelQuiz(); writer.showOutline(); writer.showCharacter(); } catch (e) { /* ignore */ }
        fb.appendChild(h('b', { class: 'dok' }, '没关系，记住它的样子！')); hintLine.textContent = '这个字是“' + c + '”，读 ' + D.chars[c].p + '。'; MZ.sfx.tap();
      } else {
        fb.appendChild(h('b', { class: 'dok' }, perfect ? '一笔一笔都写得真棒！' : ok ? MZ.pick(MZ.PRAISE) : '写出来啦，再多练练就更好了～'));
        hintLine.textContent = '“' + c + '”读 ' + D.chars[c].p;
        MZ.sfx.ok(); MZ.confetti(perfect ? 60 : 25);
      }
      MZ.speak(MZ.say(c));
      btnNext.style.display = '';
      btnNext.firstChild.textContent = k + 1 >= list.length ? '看结果' : '下一个';
    }
    function skip() { if (!finished) finishItem(true); }
    function next() { k++; if (k < list.length) load(); else summary(); }
    function summary() {
      done = true; MZ.stopSpeak(); token++;
      var okN = results.filter(function (r) { return r.ok; }).length, perfect = results.filter(function (r) { return r.perfect; }).length, n = results.length;
      var gain = 1 + (okN * 2 >= n ? 1 : 0) + (okN === n && n >= 3 ? 1 : 0);
      var st = S.get(); st.dict++; S.save();
      MZ.reward(gain, '听写');
      MZ.clear(main);
      main.className = 'dict-resbox';
      main.appendChild(h('div', { class: 'result wk-res' }, MZ.mascot(okN === n ? 'cheer' : 'happy', 110),
        h('h2', null, okN === n ? '全都写出来啦！' : '听写完成！'),
        h('div', { class: 'wk-tiles' }, results.map(function (r) {
          return h('button', { class: 'wk-tile ' + (r.ok ? 'ok' : 'no'), onclick: tap(function () { MZ.go('char', { c: r.c, g: MZ.groupOf(r.c) }); }) },
            h('span', { class: 'face' }, r.perfect ? '🌟' : r.ok ? '😊' : '💪'), h('b', null, r.c), h('i', null, D.chars[r.c].p));
        })),
        h('p', null, perfect + ' 个字一次就写得很棒' + (n - okN > 0 ? '；' + (n - okN) + ' 个字再练练，已经放进“迷糊字宝本”。' : '。')),
        h('div', { class: 'racts' },
          h('button', { class: 'btn ghost', onclick: tap(function () { MZ.go('dictate', {}, { replace: true }); }) }, icon('redo'), '再听写一次'),
          n - okN > 0 ? h('button', { class: 'btn ghost', onclick: tap(function () { MZ.go('fuzzy', {}, { replace: true }); }) }, '迷糊字宝本') : null,
          h('button', { class: 'btn grape', onclick: tap(function () { MZ.back(); }) }, '回首页'))));
      MZ.sfx.win(); MZ.confetti(100);
      MZ.afterActivity();
    }
    return { node: node, after: load, leave: function () { done = true; token++; try { if (writer) writer.cancelQuiz(); } catch (e) { /* ignore */ } } };
  };

  /* ================= 装扮商店 ================= */
  V.shop = function (p) {
    var s = S.get(), slot = p.slot || 'hat';
    var view = { hat: s.wear.hat || '', face: s.wear.face || '', neck: s.wear.neck || '', bg: s.wear.bg || '' };
    var prev = h('div', { class: 'shop-prev' }), act = h('div', { class: 'shop-act' }), grid = h('div', { class: 'items' });
    var wallet = h('div', { class: 'shop-wallet' });
    var sel = null;   // 正在看的那件
    function renderPrev() {
      MZ.clear(prev);
      prev.setAttribute('data-bg', view.bg || 'sky');
      prev.appendChild(MZ.mascot('cheer', 190, { hat: view.hat, face: view.face, neck: view.neck }));
      MZ.clear(wallet);
      wallet.appendChild(h('span', { class: 'pill star' }, icon('star'), h('b', null, String(S.wallet()))));
      wallet.appendChild(h('span', { class: 'wl-t' }, '我的星星'));
    }
    function renderAct() {
      MZ.clear(act);
      if (!sel) { act.appendChild(h('p', { class: 'tip' }, '点一件装扮，就能给墨墨试穿。星星是玩游戏、闯关、开宝箱得来的。')); return; }
      var it = MZ.ITEM[sel], owned = MZ.shop.owned(sel), worn = S.get().wear[it.slot] === sel;
      act.appendChild(h('div', { class: 'sa-name' }, h('span', null, it.emoji), h('b', null, it.name)));
      if (owned) {
        act.appendChild(h('p', { class: 'tip' }, worn ? '墨墨正穿着它呢。' : '已经拥有啦。'));
        act.appendChild(h('button', { class: 'btn ' + (worn ? 'ghost' : 'coral'), onclick: tap(function () { var on = !worn; MZ.shop.wear(it.slot, on ? sel : ''); view[it.slot] = on ? sel : ''; refresh(); }) }, worn ? '摘下来' : '戴上'));
      } else {
        var poor = S.wallet() < it.price;
        act.appendChild(h('p', { class: 'tip' }, poor ? '星星还差 ' + (it.price - S.wallet()) + ' 颗，继续玩游戏攒星星吧！' : '要用 ' + it.price + ' 颗星星买下它吗？'));
        act.appendChild(h('button', { class: 'btn ' + (poor ? 'ghost' : 'coral'), disabled: poor, onclick: tap(function () {
          MZ.modal({ title: '买下“' + it.name + '”？', body: '会用掉 ' + it.price + ' 颗星星。', buttons: [{ label: '再想想', kind: 'ghost' }, { label: '买下', kind: 'coral', onClick: function () {
            var r = MZ.shop.buy(sel);
            if (r === 'ok') { MZ.sfx.coin(); MZ.confetti(70); MZ.shop.wear(it.slot, sel); view[it.slot] = sel; MZ.toast('买到啦！墨墨戴上了～'); MZ.afterActivity(); refresh(); }
            else MZ.toast(r === 'poor' ? '星星不够哦' : '已经有啦');
          } }] });
        }) }, '⭐ ' + it.price + ' 买下'));
      }
    }
    function renderGrid() {
      MZ.clear(grid);
      grid.appendChild(h('button', { class: 'item none' + (!view[slot] ? ' on' : ''), onclick: tap(function () { MZ.shop.wear(slot, ''); view[slot] = ''; sel = null; refresh(); }) }, h('span', { class: 'ie' }, '🚫'), h('b', null, '不戴'), h('i', null, '')));
      MZ.ITEMS.filter(function (it) { return it.slot === slot; }).forEach(function (it) {
        var owned = MZ.shop.owned(it.id), worn = S.get().wear[slot] === it.id;
        grid.appendChild(h('button', { class: 'item' + (owned ? ' own' : '') + (view[slot] === it.id ? ' on' : '') + (sel === it.id ? ' sel' : ''), onclick: tap(function () {
          sel = it.id;
          if (owned) { MZ.shop.wear(slot, it.id); view[slot] = it.id; }
          else view[slot] = it.id;       // 没买的只是试穿，不保存
          refresh();
        }) }, h('span', { class: 'ie' }, it.emoji), h('b', null, it.name), h('i', null, owned ? (worn ? '穿戴中' : '已拥有') : '⭐ ' + it.price)));
      });
    }
    function refresh() { renderPrev(); renderAct(); renderGrid(); MZ.refreshChrome(); }
    var tabs = MZ.SLOTS.map(function (sl) { return { k: sl.k, label: sl.label }; });
    var tabBar = ui.seg(tabs, slot, function (k) { MZ.go('shop', { slot: k }, { replace: true }); });
    var node = h('section', { class: 'screen shop th-sun' }, topbar({ title: '给墨墨换装扮' }),
      h('div', { class: 'shop-body' },
        h('div', { class: 'shop-left' }, prev, wallet, act),
        h('div', { class: 'shop-right' }, tabBar, h('div', { class: 'pin-scroll' }, grid))));
    refresh();
    return { node: node };
  };
})();
