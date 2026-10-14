/* 墨点识字 · 小主人：原创漫画小男孩 / 小女孩（全部是自己画的 SVG 小图形，没有用任何外部素材）
   画布 120×150：头在上（大头娃娃比例），身体和小短腿在下。
   画法：一层一层叠——背景 → 背饰 → 后发 → 腿和鞋 → 身体和衣服 → 脖子饰品 → 头和脸 → 前发 → 发饰 → 脸饰 → 帽子 → 手里的东西 → 宠物。
   手臂、腿单独成组，跑酷游戏里用 CSS 让它们摆动。 */
(function () {
  'use strict';
  var MZ = window.MZ, S = MZ.S, h = MZ.h;
  var AV = MZ.AV = {};

  /* ---------- 颜色工具 ---------- */
  function hex2rgb(x) { x = x.replace('#', ''); return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)]; }
  function rgb2hex(r) { return '#' + r.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  // 往黑色（f<0）或白色（f>0）靠近
  function shade(x, f) { var c = hex2rgb(x), t = f < 0 ? 0 : 255, a = Math.abs(f); return rgb2hex(c.map(function (v) { return v + (t - v) * a; })); }
  AV.shade = shade;
  var INK = '#2A2748';

  /* ---------- 可选的“长相”（免费，随时可改） ---------- */
  AV.SKINS = [{ n: '粉白', c: '#FFE3CF' }, { n: '浅米', c: '#FBD0AD' }, { n: '小麦', c: '#EDB488' }, { n: '蜜糖', c: '#D49A6A' }, { n: '古铜', c: '#B07548' }, { n: '巧克力', c: '#85553A' }];
  AV.HAIRC = [{ n: '乌黑', c: '#2E2833' }, { n: '深棕', c: '#5A3B2B' }, { n: '栗色', c: '#8B5A36' }, { n: '金黄', c: '#F1C45A' }, { n: '橘红', c: '#EE8442' },
              { n: '樱红', c: '#DB4A5A' }, { n: '粉红', c: '#FF8FB8' }, { n: '天蓝', c: '#4F8EF0' }, { n: '紫罗兰', c: '#8E6AE0' }, { n: '银白', c: '#DCD8EA' }];
  AV.EYEC = [{ n: '黑棕', c: '#3A2A24' }, { n: '棕色', c: '#8A5226' }, { n: '海蓝', c: '#3E7BE0' }, { n: '翠绿', c: '#2E9E6A' }, { n: '葡萄', c: '#7E5BD6' }, { n: '琥珀', c: '#D08A1E' }];

  /* ---------- 发型：back 画在脸后面，front 画在脸前面（刘海），top 画在最上面（丸子头、呆毛）。c 发色 d 深一点的描边/暗部 l 高光 ---------- */
  function hl(c, l) { return '<path d="M44 20 C52 14 66 14 74 18" stroke="' + l + '" stroke-width="3.2" stroke-linecap="round" fill="none" opacity=".55"/>'; }
  var CAP = 'M23 52 C20 24 38 8 60 8 C82 8 100 24 97 52 C93 42 88 35 82 31 C76 38 64 38 58 31 C52 39 38 37 32 31 C27 36 24 44 23 52Z';
  function stroke(d) { return ' stroke="' + d + '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"'; }
  var HAIRS = AV.HAIRS = [
    { id: 'b1', n: '清爽短发', g: 'b', back: function () { return ''; },
      front: function (c, d, l) { return '<path d="M23 54 C19 24 38 7 61 8 C84 9 101 25 97 54 C95 44 92 38 87 34 C80 40 70 38 62 30 C58 36 50 40 40 40 C34 40 28 44 23 54Z" fill="' + c + '"' + stroke(d) + '/>' + hl(c, l); } },
    { id: 'b2', n: '小刺猬', g: 'b', back: function () { return ''; },
      front: function (c, d, l) { return '<path d="M23 54 C19 40 20 30 24 22 L30 28 L33 12 L42 20 L48 6 L56 17 L64 5 L70 17 L79 8 L82 20 L92 14 L93 28 L99 26 C101 36 99 46 97 54 C94 44 90 38 84 36 C76 42 66 38 60 32 C54 38 44 42 36 36 C30 40 25 46 23 54Z" fill="' + c + '"' + stroke(d) + '/>'; } },
    { id: 'b3', n: '蘑菇头', g: 'b', back: function () { return ''; },
      front: function (c, d, l) { return '<path d="M20 62 C14 28 36 6 60 6 C84 6 106 28 100 62 C98 64 94 62 93 56 C92 44 90 38 84 33 L36 33 C30 38 28 44 27 56 C26 62 22 64 20 62Z" fill="' + c + '"' + stroke(d) + '/>' + hl(c, l); } },
    { id: 'b4', n: '卷卷毛', g: 'b', back: function () { return ''; },
      front: function (c, d, l) {
        var s = '';
        [[30, 28, 11], [44, 17, 12], [60, 13, 12], [76, 17, 12], [90, 28, 11], [24, 44, 9], [96, 44, 9], [38, 33, 9], [82, 33, 9]].forEach(function (a) { s += '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="' + a[2] + '"/>'; });
        return '<g fill="' + c + '"' + stroke(d) + '>' + s + '</g><g fill="' + c + '">' + s + '</g>'; } },
    { id: 'b5', n: '小马尾', g: 'b', back: function (c, d) { return '<path d="M84 28 C106 24 112 44 104 62 C100 54 98 48 92 44Z" fill="' + c + '"' + stroke(d) + '/>'; },
      front: function (c, d, l) { return '<path d="M23 54 C19 24 38 7 61 8 C84 9 101 25 97 54 C94 46 90 40 84 36 C78 42 68 40 60 32 C54 40 44 42 36 38 C29 40 25 46 23 54Z" fill="' + c + '"' + stroke(d) + '/>' + hl(c, l) + '<circle cx="88" cy="30" r="4" fill="#FF7A59"/>'; } },
    { id: 'b6', n: '三七分', g: 'b', back: function () { return ''; },
      front: function (c, d, l) { return '<path d="M23 54 C19 24 38 7 61 8 C84 9 101 25 97 54 C96 46 94 40 90 36 C74 36 54 34 44 24 C42 34 34 42 28 42 C25 46 24 50 23 54Z" fill="' + c + '"' + stroke(d) + '/>' + hl(c, l); } },
    { id: 'g1', n: '波波头', g: 'g', back: function (c, d) { return '<path d="M19 66 C12 28 34 6 60 6 C86 6 108 28 101 66 C100 80 96 86 90 86 L30 86 C24 86 20 80 19 66Z" fill="' + c + '"' + stroke(d) + '/>'; },
      front: function (c, d, l) { return '<path d="M23 50 C22 28 38 10 60 10 C82 10 98 28 97 50 C90 38 78 32 60 32 C42 32 30 38 23 50Z" fill="' + c + '"' + stroke(d) + '/>' + hl(c, l); } },
    { id: 'g2', n: '双马尾', g: 'g', back: function (c, d) { return '<path d="M26 40 C6 44 2 76 12 106 C22 98 28 80 28 62Z" fill="' + c + '"' + stroke(d) + '/><path d="M94 40 C114 44 118 76 108 106 C98 98 92 80 92 62Z" fill="' + c + '"' + stroke(d) + '/>'; },
      front: function (c, d, l) { return '<path d="M23 54 C19 24 38 7 61 8 C84 9 101 25 97 54 C93 44 88 38 82 35 C72 42 66 36 60 30 C54 38 44 42 36 36 C30 40 25 46 23 54Z" fill="' + c + '"' + stroke(d) + '/>' + hl(c, l) +
        '<rect x="22" y="38" width="7" height="9" rx="3" fill="#FF6FA5"/><rect x="91" y="38" width="7" height="9" rx="3" fill="#FF6FA5"/>'; } },
    { id: 'g3', n: '高马尾', g: 'g', back: function (c, d) { return '<path d="M62 12 C96 -4 118 22 104 58 C100 66 94 70 90 76 C96 52 92 34 66 24Z" fill="' + c + '"' + stroke(d) + '/>'; },
      front: function (c, d, l) { return '<path d="M23 54 C19 24 38 7 61 8 C84 9 101 25 97 54 C93 44 88 38 82 35 C72 42 66 36 60 30 C54 38 44 42 36 36 C30 40 25 46 23 54Z" fill="' + c + '"' + stroke(d) + '/>' + hl(c, l) + '<rect x="58" y="6" width="10" height="7" rx="3" fill="#FF7A59"/>'; } },
    { id: 'g4', n: '丸子头', g: 'g', back: function () { return ''; },
      front: function (c, d, l) { return '<circle cx="34" cy="10" r="13" fill="' + c + '"' + stroke(d) + '/><circle cx="86" cy="10" r="13" fill="' + c + '"' + stroke(d) + '/><path d="M23 54 C19 24 38 7 61 8 C84 9 101 25 97 54 C93 44 88 38 82 35 C72 42 66 36 60 30 C54 38 44 42 36 36 C30 40 25 46 23 54Z" fill="' + c + '"' + stroke(d) + '/>' + hl(c, l) +
        '<circle cx="34" cy="10" r="4" fill="' + l + '" opacity=".5"/><circle cx="86" cy="10" r="4" fill="' + l + '" opacity=".5"/>'; } },
    { id: 'g5', n: '长直发', g: 'g', back: function (c, d) { return '<path d="M18 56 C12 20 36 4 60 4 C84 4 108 20 102 56 C104 82 106 112 98 124 L22 124 C14 112 16 82 18 56Z" fill="' + c + '"' + stroke(d) + '/>'; },
      front: function (c, d, l) { return '<path d="M22 56 C20 26 38 9 60 9 C82 9 100 26 98 56 C94 42 86 34 74 32 C70 40 62 42 56 34 C50 40 38 42 30 38 C26 44 23 50 22 56Z" fill="' + c + '"' + stroke(d) + '/>' + hl(c, l); } },
    { id: 'g6', n: '大卷发', g: 'g', back: function (c, d) { return '<path d="M16 54 C10 18 36 2 60 2 C84 2 110 18 104 54 C112 70 108 86 114 100 C112 116 98 124 92 120 C88 126 74 126 72 118 L48 118 C46 126 32 126 28 120 C22 124 8 116 6 100 C12 86 8 70 16 54Z" fill="' + c + '"' + stroke(d) + '/>'; },
      front: function (c, d, l) { return '<path d="M22 56 C20 26 38 9 60 9 C82 9 100 26 98 56 C92 42 86 36 72 34 C68 42 60 42 56 34 C50 40 38 42 30 38 C26 44 23 50 22 56Z" fill="' + c + '"' + stroke(d) + '/>' + hl(c, l); } },
    { id: 'g7', n: '麻花辫', g: 'g', back: function (c, d) {
        var s = '';
        for (var i = 0; i < 4; i++) s += '<ellipse cx="' + (i % 2 ? 22 : 18) + '" cy="' + (66 + i * 12) + '" rx="8.5" ry="7" transform="rotate(' + (i % 2 ? 20 : -20) + ' ' + (i % 2 ? 22 : 18) + ' ' + (66 + i * 12) + ')"/>';
        var s2 = s.replace(/cx="(\d+)"/g, function (m, x) { return 'cx="' + (120 - x) + '"'; }).replace(/rotate\((-?\d+) (\d+)/g, function (m, r, x) { return 'rotate(' + (-r) + ' ' + (120 - x); });
        return '<g fill="' + c + '"' + stroke(d) + '>' + s + s2 + '</g><circle cx="20" cy="112" r="4" fill="#FF6FA5"/><circle cx="100" cy="112" r="4" fill="#FF6FA5"/>'; },
      front: function (c, d, l) { return '<path d="M23 54 C19 24 38 7 61 8 C84 9 101 25 97 54 C93 44 88 38 82 35 C72 42 66 36 60 30 C54 38 44 42 36 36 C30 40 25 46 23 54Z" fill="' + c + '"' + stroke(d) + '/>' + hl(c, l); } },
  ];
  var HAIR = {}; HAIRS.forEach(function (x) { HAIR[x.id] = x; });

  /* ---------- 这个孩子现在的长相 ---------- */
  AV.DEFAULT = { g: 'b', skin: 1, hair: 'b1', hc: 0, eye: 0 };
  AV.has = function () { return !!S.get().av; };
  AV.look = function () { var a = S.get().av; return a ? a : AV.DEFAULT; };
  AV.setLook = function (patch) {
    var s = S.get(); s.av = Object.assign({}, AV.look(), patch || {}); S.save(); return s.av;
  };

  /* ---------- 画脸 ---------- */
  function eyesSvg(mood, look, girl, skinD) {
    var E = AV.EYEC[look.eye].c, ed = shade(E, -0.35), el = shade(E, 0.4);
    var L = 46, R = 74, Y = 60;
    function eye(cx, dx, dy) {
      var px = cx + (dx || 0), py = Y + 1.5 + (dy || 0);
      return '<ellipse cx="' + cx + '" cy="' + Y + '" rx="8.2" ry="9.6" fill="#fff"/>' +
        '<ellipse cx="' + px + '" cy="' + py + '" rx="6" ry="7.8" fill="' + E + '"/>' +
        '<ellipse cx="' + px + '" cy="' + (py + 2.4) + '" rx="4.6" ry="4.4" fill="' + el + '" opacity=".75"/>' +
        '<ellipse cx="' + px + '" cy="' + (py - 0.3) + '" rx="3.1" ry="4.4" fill="' + ed + '"/>' +
        '<circle cx="' + (px + 2.2) + '" cy="' + (py - 3.2) + '" r="2.3" fill="#fff"/><circle cx="' + (px - 2.4) + '" cy="' + (py + 3.2) + '" r="1.1" fill="#fff"/>';
    }
    function lid(cx, flip) {
      var t = '<path d="M' + (cx - 9) + ' ' + (Y - 1) + ' Q' + cx + ' ' + (Y - 13) + ' ' + (cx + 9) + ' ' + (Y - 1) + '" stroke="' + INK + '" stroke-width="2.8" fill="none" stroke-linecap="round"/>';
      if (girl) {
        var o = flip ? 1 : -1;
        t += '<path d="M' + (cx + o * 8.6) + ' ' + (Y - 2) + ' l' + (o * 3.6) + ' -2.6 M' + (cx + o * 8) + ' ' + (Y + 1.4) + ' l' + (o * 3.8) + ' -0.6" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>';
      }
      return t;
    }
    if (mood === 'cheer') {
      return '<path d="M37 62 Q46 50 55 62 M65 62 Q74 50 83 62" stroke="' + INK + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
    }
    if (mood === 'sleep') {
      return '<path d="M37 59 Q46 67 55 59 M65 59 Q74 67 83 59" stroke="' + INK + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
        (girl ? '<path d="M37 59 l-3 2 M83 59 l3 2" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' : '');
    }
    var dx = 0, dy = 0;
    if (mood === 'think') { dx = 2.4; dy = -2.4; }
    var g = '<g class="av-eyes">' + eye(L, dx, dy) + eye(R, dx, dy) + lid(L, false) + lid(R, true) + '</g>';
    return g;
  }
  function browsSvg(mood, hairD) {
    var c = shade(hairD, 0.0);
    if (mood === 'oops') return '<path d="M36 49 L54 43 M84 49 L66 43" stroke="' + c + '" stroke-width="2.8" stroke-linecap="round"/>';
    if (mood === 'think') return '<path d="M37 46 Q46 41 55 46" stroke="' + c + '" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M65 41 Q74 36 83 42" stroke="' + c + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    if (mood === 'sleep') return '<path d="M37 48 Q46 44 55 48 M65 48 Q74 44 83 48" stroke="' + c + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    return '<path d="M37 46 Q46 41 55 46 M65 46 Q74 41 83 46" stroke="' + c + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  }
  function mouthSvg(mood) {
    var m = '#B8454F';
    switch (mood) {
      case 'cheer': return '<path d="M50 71 Q60 90 70 71 Z" fill="#8A2B3A" stroke="#8A2B3A" stroke-width="1.6" stroke-linejoin="round"/><path d="M54 79 Q60 74 66 79 Q60 86 54 79Z" fill="#FF8F8F"/>';
      case 'think': return '<ellipse cx="62" cy="76" rx="3.6" ry="4.4" fill="#8A2B3A"/>';
      case 'oops': return '<path d="M52 79 Q56 74 60 78 Q64 74 68 79" stroke="' + m + '" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
      case 'sleep': return '<path d="M55 75 Q60 79 65 75" stroke="' + m + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      default: return '<path d="M52 73 Q60 82 68 73" stroke="' + m + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    }
  }
  function effectSvg(mood) {
    if (mood === 'cheer') return '<g fill="#FFC83D" stroke="#fff" stroke-width="1"><path d="M108 20 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M10 34 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z"/></g>';
    if (mood === 'sleep') return '<g fill="#8C7BEA" font-family="sans-serif" font-weight="900"><text x="92" y="22" font-size="20">z</text><text x="104" y="8" font-size="14">z</text></g>';
    if (mood === 'oops') return '<path d="M98 30 C102 36 105 40 102 44 C99 48 94 46 94 42 C94 38 96 34 98 30Z" fill="#7EC8FF" stroke="#4E9BF5" stroke-width="1.4"/>';
    if (mood === 'think') return '<g fill="#fff" stroke="#BFB8E0" stroke-width="1.4"><circle cx="100" cy="30" r="3"/><circle cx="108" cy="20" r="4.4"/><circle cx="114" cy="8" r="5.6"/></g>';
    return '';
  }

  /* ---------- 衣服的默认款（没买衣服也不会光着） ---------- */
  function defTop(girl) { var c = girl ? '#FF8FB8' : '#5DA9FF'; return { t: '<path d="M43 93 Q60 89 77 93 L79 124 Q60 128 41 124Z" fill="' + c + '"' + stroke(shade(c, -0.25)) + '/><path d="M53 92 Q60 98 67 92" fill="none" stroke="' + shade(c, -0.25) + '" stroke-width="1.8" stroke-linecap="round"/>', s: '<path d="M-4 -2 Q4 -5 8 -1 L9 12 Q3 15 -3 12Z" fill="' + c + '"' + stroke(shade(c, -0.25)) + '/>' }; }
  function defBottom(girl) { var c = girl ? '#FFB84D' : '#4B6FD8'; return { w: '<path d="M41 118 L79 118 L80 128 Q60 133 40 128Z" fill="' + c + '"' + stroke(shade(c, -0.25)) + '/>', l: '' }; }
  function defShoe() { var c = '#fff'; return '<path d="M-7 1 Q-8 11 1 11 L9 11 Q11 5 6 1Z" fill="' + c + '"' + stroke('#8D88B5') + '/><path d="M-6 8 L9 8" stroke="#FF7A59" stroke-width="2.4" stroke-linecap="round"/>'; }

  /* ---------- 总装：返回一整段 <svg> 字符串 ----------
     opt: { mood, look, wear, bare, run(给手脚加摆动用的 class), noPet, bgless } */
  AV.render = function (opt) {
    opt = opt || {};
    var mood = opt.mood || 'happy';
    var look = Object.assign({}, AV.look(), opt.look || {});
    var wear = Object.assign({}, opt.bare ? {} : (S.get().wear || {}), opt.wear || {});
    var girl = look.g === 'g';
    var skin = AV.SKINS[look.skin].c, skinD = shade(skin, -0.14), skinL = shade(skin, 0.5);
    var hc = AV.HAIRC[look.hc].c, hd = shade(hc, -0.42), hlc = shade(hc, 0.5);
    var hs = HAIR[look.hair] || HAIR[girl ? 'g1' : 'b1'];
    function it(slot) { var id = wear[slot]; var x = id && MZ.ITEM[id]; return x && x.slot === slot ? x : null; }
    var top = it('top') || defTop(girl), bot = it('bottom') || defBottom(girl), shoe = it('shoes');
    var hat = it('hat'), hair = it('hair'), face = it('face'), neck = it('neck'), back = it('back'), hand = it('hand'), pet = it('pet');
    var cls = opt.run ? ' av-run' : '';
    var o = '<svg viewBox="' + (opt.view === 'head' ? '6 -14 108 108' : '0 -12 120 162') + '" preserveAspectRatio="xMidYMax meet" overflow="' + (opt.view === 'head' ? 'hidden' : 'visible') + '" width="100%" height="100%" aria-hidden="true" class="av' + cls + '" xmlns="http://www.w3.org/2000/svg">';
    o += '<ellipse cx="60" cy="146" rx="28" ry="3.6" fill="#000" opacity=".1"/>';
    if (back) o += '<g class="av-back">' + back.svg + '</g>';
    if (!opt.noPet && pet) o += '<g class="av-pet">' + pet.svg + '</g>';
    o += '<g class="av-hairback">' + hs.back(hc, hd, hlc) + '</g>';
    // 腿 + 鞋（右腿以 (67,122) 为轴，左腿镜像）
    function leg(mirror) {
      var t = mirror ? 'translate(53 122) scale(-1 1)' : 'translate(67 122)';
      var lc = bot.l || '';
      return '<g transform="' + t + '"><g class="av-leg ' + (mirror ? 'l' : 'r') + '"><rect x="-5" y="0" width="10" height="19" rx="4" fill="' + skin + '"' + stroke(skinD) + '/>' + lc +
        '<g transform="translate(0 18)">' + (shoe ? shoe.f : defShoe()) + '</g></g></g>';
    }
    o += leg(true) + leg(false);
    // 身体
    o += '<g class="av-torso">' + top.t + '</g>';
    o += '<g class="av-bottom">' + (bot.w || '') + '</g>';
    // 手臂（右臂轴 (77,95)；左臂镜像）。手里拿的东西跟着右手
    function arm(mirror) {
      var t = mirror ? 'translate(43 95) scale(-1 1)' : 'translate(77 95)';
      return '<g transform="' + t + '"><g class="av-arm ' + (mirror ? 'l' : 'r') + '"><rect x="-3.4" y="-2" width="8.4" height="25" rx="4.2" fill="' + skin + '"' + stroke(skinD) + '/><circle cx="1" cy="24" r="4.6" fill="' + skin + '"' + stroke(skinD) + '/>' +
        (top.s || '') + (!mirror && hand ? '<g transform="translate(1 24)">' + hand.svg + '</g>' : '') + '</g></g>';
    }
    o += arm(true) + arm(false);
    // 脖子
    o += '<rect x="53" y="80" width="14" height="14" rx="4" fill="' + skinD + '"/>';
    if (neck) o += '<g class="av-neck">' + neck.svg + '</g>';
    // 头
    o += '<g class="av-head">';
    o += '<ellipse cx="25" cy="57" rx="5" ry="6.5" fill="' + skin + '"' + stroke(skinD) + '/><ellipse cx="95" cy="57" rx="5" ry="6.5" fill="' + skin + '"' + stroke(skinD) + '/>';
    o += '<path d="M24 50 C24 27 40 16 60 16 C80 16 96 27 96 50 C96 71 81 85 60 85 C39 85 24 71 24 50Z" fill="' + skin + '"' + stroke(skinD) + '/>';
    o += '<ellipse cx="35" cy="71" rx="7" ry="4.4" fill="#FF8F8F" opacity=".45"/><ellipse cx="85" cy="71" rx="7" ry="4.4" fill="#FF8F8F" opacity=".45"/>';
    o += eyesSvg(mood, look, girl, skinD) + browsSvg(mood, hd);
    o += '<path d="M58.5 68 Q60 70 61.5 68" stroke="' + skinD + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    o += mouthSvg(mood);
    o += '<g class="av-hairfront">' + hs.front(hc, hd, hlc) + '</g>';
    if (hair) o += '<g class="av-hairacc">' + hair.svg + '</g>';
    if (face) o += '<g class="av-face">' + face.svg + '</g>';
    if (hat) o += '<g class="av-hat">' + hat.svg + '</g>';
    o += '</g>';
    o += effectSvg(mood);
    o += '</svg>';
    return o;
  };

  var uid = 0;
  /* 吉祥物/小主人：size 是宽度（和老版本一样的用法）。opt：{ bare, look, wear, run, noPet } */
  MZ.mascot = function (mood, size, opt) {
    mood = mood || 'happy'; opt = opt || {};
    var s = size || 120;
    var d = {}; for (var k in opt) d[k] = opt[k];
    d.mood = mood;
    var ratio = opt.ratio || (opt.view === 'head' ? 1 : 1.25);
    return h('span', { class: 'mascot m-' + mood + (opt.still ? ' still' : ''), style: { width: (s / 17).toFixed(2) + 'rem', height: (s * ratio / 17).toFixed(2) + 'rem' }, html: AV.render(d) });
  };

  /* ---------- 选形象：小男孩 / 小女孩 + 肤色 + 发型 + 发色 + 眼睛（第一次打开会弹出来；商店里“形象”页也是它） ---------- */
  AV.editor = function (onChange) {
    var root = h('div', { class: 'av-ed' });
    function swatches(list, key, cur) {
      var row = h('div', { class: 'av-sws' });
      list.forEach(function (x, i) {
        row.appendChild(h('button', { class: 'av-sw' + (cur === i ? ' on' : ''), 'aria-label': x.n, title: x.n, style: { background: x.c }, onclick: function () { MZ.sfx.tap(); var p = {}; p[key] = i; AV.setLook(p); draw(); } }));
      });
      return row;
    }
    function row(label, body) { return h('div', { class: 'av-row' }, h('div', { class: 'av-lb' }, label), body); }
    function draw() {
      var L = AV.look();
      MZ.clear(root);
      var gen = h('div', { class: 'av-gen' });
      [['b', '小男孩'], ['g', '小女孩']].forEach(function (g) {
        var first = HAIRS.filter(function (x) { return x.g === g[0]; })[0].id;
        var look = Object.assign({}, L, { g: g[0], hair: L.g === g[0] ? L.hair : first });
        gen.appendChild(h('button', { class: 'av-g' + (L.g === g[0] ? ' on' : ''), onclick: function () { MZ.sfx.tap(); AV.setLook({ g: g[0], hair: look.hair }); draw(); } },
          MZ.mascot('happy', 56, { look: look, bare: true, still: true, view: 'head' }), h('b', null, g[1])));
      });
      root.appendChild(gen);
      var rest = h('div', { class: 'av-rest' });
      root.appendChild(rest);
      rest.appendChild(row('肤色', swatches(AV.SKINS, 'skin', L.skin)));
      var hr = h('div', { class: 'av-hairs' });
      HAIRS.filter(function (x) { return x.g === L.g; }).forEach(function (x) {
        hr.appendChild(h('button', { class: 'av-h' + (L.hair === x.id ? ' on' : ''), onclick: function () { MZ.sfx.tap(); AV.setLook({ hair: x.id }); draw(); } },
          MZ.mascot('happy', 52, { look: Object.assign({}, L, { hair: x.id }), bare: true, still: true, view: 'head' }), h('i', null, x.n)));
      });
      rest.appendChild(row('发型', hr));
      rest.appendChild(row('发色', swatches(AV.HAIRC, 'hc', L.hc)));
      rest.appendChild(row('眼睛', swatches(AV.EYEC, 'eye', L.eye)));
      if (onChange) onChange();
    }
    draw();
    return root;
  };
  // 第一次打开（或老存档升级后第一次打开）：请小朋友选自己的形象
  AV.chooser = function (after) {
    var prev = h('div', { class: 'av-pv' });
    function refreshPrev() { MZ.clear(prev); prev.appendChild(MZ.mascot('cheer', 150, { bare: true })); }
    var ed = AV.editor(refreshPrev);
    var body = h('div', { class: 'av-pick' }, prev, ed);
    MZ.modal({ title: '来选一个自己的样子吧！墨墨就是你', wide: true, body: body, buttons: [{ label: '就是我啦！', kind: 'coral', onClick: function () { AV.setLook({}); MZ.sfx.win(); if (after) after(); } }] });
  };
})();
