/* 墨点识字 · 答题器：闯关、叫醒字宝宝共用的“一题一题答”的界面 */
(function () {
  'use strict';
  var MZ = window.MZ, h = MZ.h, ui = MZ.ui, icon = ui.icon, tap = ui.tap, speakBtn = ui.speakBtn;

  /* o：
       qs        题目数组（题目格式见 quiz.js）
       color     页面主题色（coral/teal/sky/sun/grape）
       title     顶栏标题
       exitText  点关闭时的提示文字（有的话会先确认）
       requeue   (q) => 新题|null；答错时可以把这个字再排到最后问一次
       onAnswer  (q, ok, retry) 每答完一题调用
       onFinish  (ctx) 全部答完调用，ctx = { area, sheet, segs, N, score, results }
                 score 只算“第一次就答对”的题；results[k] = { q, ok, retry }
       nextLabel 最后一题的按钮字（默认“看结果”） */
  MZ.qrun = function (o) {
    var qs = o.qs.slice(), N0 = qs.length, i = 0, score = 0, locked = false, done = false, results = [];
    var segs = h('div', { class: 'qsegs' }, qs.map(function () { return h('i'); }));
    var scoreEl = h('span', { class: 'pill star' }, icon('star'), h('b', null, '0'));
    var area = h('div', { class: 'qarea' }), sheet = h('div', { class: 'qsheet' });
    var node = h('section', { class: 'screen quiz th-' + (o.color || 'coral') },
      h('header', { class: 'top' },
        h('button', { class: 'icon-btn', 'aria-label': '退出', onclick: tap(function () {
          if (done || !o.exitText) { MZ.back(); return; }
          MZ.modal({ title: '要退出吗？', body: o.exitText, buttons: [{ label: '继续', kind: 'coral' }, { label: '退出', kind: 'ghost', onClick: function () { MZ.back(); } }] });
        }) }, icon('close')),
        h('div', { class: 'ttl' }, o.title), segs, h('div', { class: 'grow' }), o.noScore ? null : scoreEl), area, sheet);

    function optNode(q, opt, k) {
      var b;
      var click = function () { choose(k, b); };
      if (q.optKind === 'rad') b = h('button', { class: 'opt rad', onclick: tap(click) }, h('b', null, opt.f), h('i', null, opt.n));
      else b = h('button', { class: 'opt ' + (q.optKind === 'char' ? 'char' : q.optKind === 'py' ? 'py' : 'text'), onclick: tap(click) }, String(opt));
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
      Array.prototype.forEach.call(segs.children, function (s, k) { s.className = k < i ? (results[k] && results[k].ok ? 'ok' : 'no') : k === i ? 'cur' : ''; });
      var big = null;
      if (q.big) {
        if (q.big.py && q.big.py.length) big = MZ.ruby(q.big.text, q.big.py, { tap: false, cls: 'xxl' });
        else big = h('div', { class: 'qbig' + (q.big.kai ? ' kai' : '') + (q.big.text.length > 3 ? ' long' : '') }, q.big.text);
      } else if (q.ruby) {
        big = MZ.ruby(q.ruby.text, q.ruby.py, { blank: function (k) { return k === q.ruby.blank; }, tap: false, cls: 'xl' });
      }
      var opts = h('div', { class: 'qopts ' + (q.optKind === 'text' && q.opts.some(function (x) { return String(x).length > 9; }) ? 'one' : 'four') });
      q.opts.forEach(function (x, k) { opts.appendChild(optNode(q, x, k)); });
      var fitBox = h('div', { class: 'qfit' });
      if (q.retry) fitBox.appendChild(h('div', { class: 'qretry' }, '再试一次～'));
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
      results[i] = { q: q, ok: ok, retry: !!q.retry };
      btn.classList.add(ok ? 'right' : 'wrong');
      if (!ok) { opts.children[q.ans].classList.add('right'); btn.classList.add('shake'); }
      if (ok && !q.retry) { score++; scoreEl.querySelector('b').textContent = String(score); }
      if (ok) MZ.sfx.ok(); else MZ.sfx.bad();
      Array.prototype.forEach.call(opts.children, function (x) { x.disabled = true; });
      if (!ok && o.requeue && !q.retry) {
        var nq = o.requeue(q);
        if (nq) { nq.retry = true; qs.push(nq); segs.appendChild(h('i')); }
      }
      if (o.onAnswer) o.onAnswer(q, ok, !!q.retry);
      MZ.clear(sheet);
      sheet.appendChild(MZ.mascot(ok ? 'cheer' : 'oops', 70));
      sheet.appendChild(h('div', { class: 'qfb' }, h('b', null, ok ? MZ.pick(MZ.PRAISE) : MZ.pick(MZ.TRYAGAIN)), h('p', null, q.explain)));
      var last = i + 1 >= qs.length;
      sheet.appendChild(h('button', { class: 'btn ' + (ok ? 'teal' : 'coral') + ' lg', onclick: tap(function () { i++; i < qs.length ? showQ() : finish(); }) }, last ? (o.nextLabel || '看结果') : '下一题', icon('next')));
      sheet.classList.add('on');
      if (q.after) setTimeout(function () { if (!done) MZ.speak(q.after); }, 450);
    }
    function finish() {
      done = true; MZ.stopSpeak();
      MZ.clear(area); MZ.clear(sheet); sheet.classList.remove('on'); area.classList.add('res-on');
      Array.prototype.forEach.call(segs.children, function (x, k) { x.className = results[k] && results[k].ok ? 'ok' : 'no'; });
      o.onFinish({ area: area, sheet: sheet, segs: segs, N: N0, score: score, results: results, node: node });
    }
    return {
      node: node, after: showQ,
      leave: function () { done = true; window.removeEventListener('resize', onResize); },
    };
  };
})();
