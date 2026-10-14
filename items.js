/* 墨点识字 · 装扮商店的商品目录（全部是自己画的原创小图形，画布 120×150，见 avatar.js）
   槽位：hat 帽子 / hair 发饰 / face 脸上 / top 上衣 / bottom 下装 / shoes 鞋子 / neck 脖子 / back 背饰 / hand 手里 / pet 小伙伴 / bg 背景
   上衣 = { t: 躯干, s: 袖子(右臂局部坐标，肩膀在 0,0) }；下装 = { w: 腰和裙摆, l: 右腿上的裤管(髋部在 0,0) }；鞋 = { f: 右脚(脚踝在 0,0) }；手持物 = 右手心在 (0,0)。
   老版本的 20 件装扮编号不变（bow flower cap party straw chef phones wizard crown glasses shades stache bell bowtie scarf meadow sea night candy snow），老存档里买过的还在。 */
(function () {
  'use strict';
  var MZ = window.MZ, AV = MZ.AV, shade = AV.shade;
  var ITEMS = MZ.ITEMS = [];
  MZ.ITEM = {};
  MZ.SLOTS = [
    { k: 'look', label: '形象' }, { k: 'hat', label: '帽子' }, { k: 'hair', label: '发饰' }, { k: 'face', label: '脸上' }, { k: 'top', label: '上衣' }, { k: 'bottom', label: '下装' },
    { k: 'shoes', label: '鞋子' }, { k: 'neck', label: '脖子' }, { k: 'back', label: '背饰' }, { k: 'hand', label: '手里' }, { k: 'pet', label: '小伙伴' }, { k: 'bg', label: '背景' },
  ];
  function add(id, slot, name, price, o) { var it = { id: id, slot: slot, name: name, price: price }; for (var k in o) it[k] = o[k]; ITEMS.push(it); MZ.ITEM[id] = it; return it; }
  function sk(c, w) { return ' stroke="' + shade(c, -0.3) + '" stroke-width="' + (w || 1.8) + '" stroke-linejoin="round" stroke-linecap="round"'; }
  function P(d, c, w) { return '<path d="' + d + '" fill="' + c + '"' + sk(c, w) + '/>'; }
  function C(x, y, r, c, w) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"' + sk(c, w) + '/>'; }
  function E(x, y, rx, ry, c, w) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + c + '"' + sk(c, w) + '/>'; }
  function R(x, y, w, h, rx, c, sw) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + c + '"' + sk(c, sw) + '/>'; }
  function star(cx, cy, r, c) { var d = ''; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); } return P(d + 'Z', c, 1.4); }
  function heart(cx, cy, s, c) { return '<path transform="translate(' + cx + ' ' + cy + ') scale(' + s + ')" d="M0 6 C-9 -1 -7 -9 0 -4 C7 -9 9 -1 0 6Z" fill="' + c + '"' + sk(c, 1.4 / s) + '/>'; }
  // 帽顶弧：从 (xl,yb) 到 (xr,yb)，最高点 yt
  function dome(xl, xr, yb, yt) { var k = (yt - 0.25 * yb) / 0.75; return 'M' + xl + ' ' + yb + ' C' + (xl - 4) + ' ' + k + ' ' + (xr + 4) + ' ' + k + ' ' + xr + ' ' + yb + 'Z'; }

  /* ================= 帽子 ================= */
  function cap(c, c2) { return P(dome(25, 95, 38, 5), c) + '<path d="M60 8 Q56 22 58 36" stroke="' + shade(c, -0.25) + '" stroke-width="1.6" fill="none"/>' + C(60, 8, 3, c2, 1.4) + P('M56 33 Q92 26 106 38 Q82 44 56 40Z', c2); }
  add('cap', 'hat', '蓝色小帽', 10, { svg: cap('#4E9BF5', '#2F78CE') });
  add('cap2', 'hat', '红色棒球帽', 10, { svg: cap('#EF5B5B', '#C94444') });
  add('party', 'hat', '派对帽', 10, { svg: '<g transform="rotate(8 62 30)">' + P('M42 34 L62 -8 L82 34Z', '#FF7A59') + '<path d="M52 14 L72 20 M48 25 L76 32" stroke="#FFE08A" stroke-width="4.2" stroke-linecap="round"/>' + C(62, -8, 5.4, '#FFC83D') + '</g>' });
  add('straw', 'hat', '小草帽', 12, { svg: E(60, 33, 46, 10, '#F2C46B') + P(dome(30, 90, 33, 6), '#F7D78A') + '<path d="M31 27 Q60 36 89 27 L89 22 Q60 31 31 22Z" fill="#E85F3E"/>' });
  add('chef', 'hat', '小厨师帽', 14, { svg: '<g fill="#fff"' + sk('#fff', 2) + '><circle cx="42" cy="18" r="12"/><circle cx="78" cy="18" r="12"/><circle cx="60" cy="8" r="13"/></g>' + R(40, 20, 40, 18, 3, '#fff', 2) + '<path d="M40 31 L80 31" stroke="#D9D3E8" stroke-width="2"/>' });
  add('wizard', 'hat', '魔法帽', 24, { svg: E(60, 36, 44, 9, '#5846C2') + P('M38 36 C46 22 52 8 72 -12 C70 8 76 24 82 36Z', '#6A56D8') + star(62, 17, 7, '#FFC83D') + '<path d="M38 31 Q60 40 82 31" stroke="#FFC83D" stroke-width="3" fill="none"/>' });
  add('crown', 'hat', '小皇冠', 30, { svg: P('M34 36 L30 10 L46 24 L60 4 L74 24 L90 10 L86 36Z', '#FFC83D', 2.4) + C(60, 28, 4.4, '#EF5B5B', 1.4) + C(44, 30, 3, '#5DA9FF', 1.2) + C(76, 30, 3, '#2FB9A5', 1.2) });
  function beanie(c, c2) { return P(dome(25, 95, 36, 4), c) + R(23, 30, 74, 11, 5, c2) + '<path d="M36 30 V41 M48 30 V41 M60 30 V41 M72 30 V41 M84 30 V41" stroke="' + shade(c2, -0.2) + '" stroke-width="1.4"/>' + C(60, 4, 7, '#fff', 1.6); }
  add('beanie', 'hat', '红毛线帽', 12, { svg: beanie('#EF5B5B', '#C94444') });
  add('beanie2', 'hat', '绿毛线帽', 12, { svg: beanie('#3DB88C', '#2A9A72') });
  add('fire', 'hat', '消防小头盔', 18, { svg: P('M60 -8 L68 6 L52 6Z', '#EF5B5B') + P(dome(24, 96, 38, 4), '#EF5B5B') + R(20, 34, 80, 8, 4, '#C94444') + '<path d="M56 -2 Q60 -10 64 -2" fill="#fff"/>' + P('M50 20 L60 10 L70 20 L66 30 L54 30Z', '#FFC83D', 1.6) });
  add('astro', 'hat', '宇航头盔', 30, { svg: '<circle cx="60" cy="50" r="46" fill="#BFE3FF" fill-opacity=".28" stroke="#fff" stroke-width="3.4"/><path d="M26 26 Q36 8 56 6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/><ellipse cx="60" cy="90" rx="38" ry="7" fill="#EDEBFA" stroke="#B7B1DB" stroke-width="2"/><circle cx="26" cy="90" r="3" fill="#EF5B5B"/><circle cx="94" cy="90" r="3" fill="#5DA9FF"/>' });
  add('cowboy', 'hat', '牛仔帽', 20, { svg: P('M10 34 Q22 44 40 36 L80 36 Q98 44 110 34 Q104 24 94 30 L26 30 Q16 24 10 34Z', '#C98B4E') + P('M32 33 C30 12 42 6 60 12 C78 6 90 12 88 33Z', '#D9A066') + '<path d="M33 27 Q60 33 87 27" stroke="#8D5A2B" stroke-width="4" fill="none"/>' });
  add('beret', 'hat', '画家贝雷帽', 16, { svg: P('M22 34 C14 14 50 2 80 8 C98 12 104 26 96 34 C80 40 40 40 22 34Z', '#8E6AE0') + '<path d="M60 8 Q64 2 70 4" stroke="#6A4CC0" stroke-width="3" fill="none" stroke-linecap="round"/>' });
  add('bunny', 'hat', '兔耳帽', 22, { svg: P('M38 18 C30 -6 38 -12 45 -8 C52 -2 52 8 52 18Z', '#fff') + P('M82 18 C90 -6 82 -12 75 -8 C68 -2 68 8 68 18Z', '#fff') + '<path d="M42 10 C38 -2 40 -6 44 -4 M78 10 C82 -2 80 -6 76 -4" stroke="#FFB3C9" stroke-width="4" fill="none" stroke-linecap="round"/>' + P(dome(25, 95, 36, 6), '#fff') });
  add('panda', 'hat', '熊猫帽', 22, { svg: C(34, 14, 11, '#2A2748') + C(86, 14, 11, '#2A2748') + P(dome(25, 95, 36, 5), '#fff') + '<ellipse cx="46" cy="32" rx="2" ry="0" />' });
  add('dino', 'hat', '小恐龙帽', 22, { svg: P('M44 8 L50 -4 L56 6 L62 -8 L68 6 L74 -4 L78 8Z', '#7DD36B') + P(dome(25, 95, 36, 6), '#3DB88C') + C(44, 18, 6, '#fff', 1.4) + C(76, 18, 6, '#fff', 1.4) + C(45, 19, 2.6, '#2A2748', 0.5) + C(77, 19, 2.6, '#2A2748', 0.5) + '<circle cx="34" cy="26" r="2" fill="#2A9A72"/><circle cx="86" cy="26" r="2" fill="#2A9A72"/>' });
  add('tiger', 'hat', '虎头帽', 26, { svg: C(34, 14, 10, '#F5B81E') + C(86, 14, 10, '#F5B81E') + C(34, 14, 4.4, '#FFE7A8', 0.5) + C(86, 14, 4.4, '#FFE7A8', 0.5) + P(dome(25, 95, 36, 6), '#F5B81E') + '<path d="M52 12 H68 M60 12 V26 M54 19 H66 M52 26 H68" stroke="#2A2748" stroke-width="3" stroke-linecap="round"/><path d="M32 22 L40 24 M88 22 L80 24 M32 30 L40 30 M88 30 L80 30" stroke="#2A2748" stroke-width="2.4" stroke-linecap="round"/>' });
  add('grad', 'hat', '博士帽', 28, { svg: P('M60 4 L104 18 L60 32 L16 18Z', '#3B3670') + P('M38 26 L38 38 Q60 46 82 38 L82 26 L60 33Z', '#4A4590') + '<path d="M96 20 V38" stroke="#FFC83D" stroke-width="2.6"/>' + C(96, 40, 3.4, '#FFC83D', 1.2) });
  add('phones', 'hat', '大耳机', 16, { svg: '<path d="M22 62 C14 -12 106 -12 98 62" fill="none" stroke="#3B3670" stroke-width="6" stroke-linecap="round"/>' + R(12, 46, 16, 28, 8, '#FF7A59', 2.2) + R(92, 46, 16, 28, 8, '#FF7A59', 2.2) });
  add('sun', 'hat', '粉色遮阳帽', 14, { svg: E(60, 33, 52, 12, '#FF9CC4') + P(dome(32, 88, 33, 6), '#FFB8D6') + '<path d="M33 27 Q60 36 87 27 L87 22 Q60 31 33 22Z" fill="#fff"/>' });

  /* ================= 发饰 ================= */
  function bow(c) { return '<g transform="translate(84 26) rotate(16)">' + P('M0 0 L-17 -11 L-17 11Z M0 0 L17 -11 L17 11Z', c) + C(0, 0, 4.6, shade(c, 0.3), 1.6) + '</g>'; }
  add('bow', 'hair', '粉红蝴蝶结', 6, { svg: bow('#FF6FA5') });
  add('bow2', 'hair', '蓝色蝴蝶结', 6, { svg: bow('#5DA9FF') });
  add('flower', 'hair', '小红花', 8, { svg: '<g transform="translate(86 28)"><g fill="#FF5C7A"' + sk('#FF5C7A', 1.4) + '>' + [0, 72, 144, 216, 288].map(function (a) { return '<circle cx="' + (8 * Math.sin(a * Math.PI / 180)).toFixed(1) + '" cy="' + (-8 * Math.cos(a * Math.PI / 180)).toFixed(1) + '" r="6.2"/>'; }).join('') + '</g>' + C(0, 0, 4.6, '#FFC83D', 1.2) + '</g>' });
  add('starclip', 'hair', '星星发夹', 6, { svg: '<g transform="rotate(-14 84 32)">' + star(84, 32, 10, '#FFC83D') + '</g>' });
  add('heartclip', 'hair', '爱心发夹', 6, { svg: heart(34, 32, 1.5, '#FF5C7A') });
  add('band', 'hair', '红发带', 8, { svg: '<path d="M26 40 C24 6 96 6 94 40" fill="none" stroke="#EF5B5B" stroke-width="6.5" stroke-linecap="round"/><path d="M26 40 C24 6 96 6 94 40" fill="none" stroke="#FF9C9C" stroke-width="1.6" stroke-dasharray="1 6" stroke-linecap="round"/>' });
  add('wreath', 'hair', '花环', 14, { svg: '<path d="M27 40 C24 8 96 8 93 40" fill="none" stroke="#3DB88C" stroke-width="4" stroke-linecap="round"/>' + [[30, 30, '#FF6FA5'], [38, 16, '#FFC83D'], [52, 10, '#fff'], [66, 10, '#FF6FA5'], [82, 16, '#FFC83D'], [90, 30, '#fff']].map(function (a) { return C(a[0], a[1], 5.4, a[2], 1.2) + C(a[0], a[1], 1.8, '#E8A90C', 0.2); }).join('') });
  add('butterfly', 'hair', '蝴蝶发饰', 12, { svg: '<g transform="translate(88 24) rotate(20)">' + P('M0 0 C-4 -14 -18 -16 -16 -4 C-15 4 -6 6 0 0Z', '#9A7BEF') + P('M0 0 C4 -14 18 -16 16 -4 C15 4 6 6 0 0Z', '#C0A8FF') + P('M0 1 C-8 4 -12 12 -6 12 C-2 12 0 6 0 1Z', '#C0A8FF') + P('M0 1 C8 4 12 12 6 12 C2 12 0 6 0 1Z', '#9A7BEF') + '<path d="M0 0 L-3 -10 M0 0 L3 -10" stroke="#4A3CAE" stroke-width="1.4" stroke-linecap="round"/></g>' });
  add('cherry', 'hair', '樱桃发夹', 10, { svg: '<g transform="translate(34 28)"><path d="M4 -6 C10 -16 18 -14 20 -12 M10 -4 C14 -14 16 -14 20 -12" stroke="#3DB88C" stroke-width="2" fill="none"/>' + C(2, 2, 6, '#EF3B4D', 1.4) + C(14, 4, 6, '#EF3B4D', 1.4) + '<circle cx="0" cy="0" r="1.6" fill="#fff" opacity=".7"/><circle cx="12" cy="2" r="1.6" fill="#fff" opacity=".7"/></g>' });
  add('catband', 'hair', '猫耳发箍', 14, { svg: '<path d="M30 28 C34 4 86 4 90 28" fill="none" stroke="#3B3670" stroke-width="4" stroke-linecap="round"/>' + P('M30 20 L34 -4 L48 12Z', '#3B3670') + P('M90 20 L86 -4 L72 12Z', '#3B3670') + P('M35 14 L36 4 L42 12Z', '#FF9CC4', 0.6) + P('M85 14 L84 4 L78 12Z', '#FF9CC4', 0.6) });
  add('bunnyband', 'hair', '兔耳发箍', 14, { svg: '<path d="M32 26 C36 6 84 6 88 26" fill="none" stroke="#FF9CC4" stroke-width="4" stroke-linecap="round"/>' + P('M38 14 C30 -8 36 -14 44 -10 C50 -4 50 4 48 12Z', '#fff') + P('M82 14 C90 -8 84 -14 76 -10 C70 -4 70 4 72 12Z', '#fff') + '<path d="M40 8 C37 -2 39 -6 42 -4 M80 8 C83 -2 81 -6 78 -4" stroke="#FFB3C9" stroke-width="3.4" fill="none" stroke-linecap="round"/>' });
  add('antenna', 'hair', '小触角', 14, { svg: '<path d="M28 26 C32 6 88 6 92 26" fill="none" stroke="#5DA9FF" stroke-width="3.4" stroke-linecap="round"/><path d="M42 12 Q38 -4 32 -8 M78 12 Q82 -4 88 -8" stroke="#5DA9FF" stroke-width="3" fill="none" stroke-linecap="round"/>' + C(32, -8, 5.4, '#FF7A59', 1.4) + C(88, -8, 5.4, '#FFC83D', 1.4) });
  add('sprout', 'hair', '头顶小嫩芽', 10, { svg: '<path d="M60 12 C60 4 60 -2 60 -6" stroke="#2A9A72" stroke-width="3" fill="none" stroke-linecap="round"/>' + P('M60 -2 C48 -10 40 -2 44 4 C50 6 58 4 60 -2Z', '#7DD36B') + P('M60 -6 C72 -16 82 -8 76 -2 C70 2 62 0 60 -6Z', '#5CC24E') });
  add('rainclip', 'hair', '彩虹发卡', 8, { svg: '<g transform="translate(86 28) rotate(-10)"><path d="M-14 4 A14 14 0 0 1 14 4" fill="none" stroke="#EF5B5B" stroke-width="3"/><path d="M-10 4 A10 10 0 0 1 10 4" fill="none" stroke="#FFC83D" stroke-width="3"/><path d="M-6 4 A6 6 0 0 1 6 4" fill="none" stroke="#5DA9FF" stroke-width="3"/></g>' });

  /* ================= 脸上 ================= */
  add('glasses', 'face', '圆眼镜', 12, { svg: '<g fill="#fff" fill-opacity=".22" stroke="' + '#2A2748' + '" stroke-width="2.8"><circle cx="46" cy="60" r="13"/><circle cx="74" cy="60" r="13"/></g><path d="M59 58 Q60 55 61 58 M33 57 L26 54 M87 57 L94 54" stroke="#2A2748" stroke-width="2.6" fill="none" stroke-linecap="round"/>' });
  add('glasses2', 'face', '方框眼镜', 12, { svg: '<g fill="#fff" fill-opacity=".22" stroke="#E85F3E" stroke-width="3"><rect x="32" y="49" width="26" height="22" rx="6"/><rect x="62" y="49" width="26" height="22" rx="6"/></g><path d="M58 56 H62 M32 54 L25 52 M88 54 L95 52" stroke="#E85F3E" stroke-width="2.6" fill="none" stroke-linecap="round"/>' });
  add('shades', 'face', '酷酷墨镜', 16, { svg: R(31, 49, 27, 21, 8, '#1d1b3a', 1) + R(62, 49, 27, 21, 8, '#1d1b3a', 1) + '<path d="M58 55 H62 M31 54 L25 52 M89 54 L95 52" stroke="#1d1b3a" stroke-width="3" stroke-linecap="round"/><path d="M36 54 L43 54 M67 54 L74 54" stroke="#8C88C9" stroke-width="2.6" stroke-linecap="round"/>' });
  add('stache', 'face', '小胡子', 14, { svg: '<path d="M44 74 Q51 66 60 71 Q69 66 76 74 Q69 79 60 75 Q51 79 44 74Z" fill="#4A3828" stroke="#2f2418" stroke-width="1.4"/>' });
  add('starglass', 'face', '星星眼镜', 18, { svg: '<g fill="#FFD76A" fill-opacity=".55" stroke="#E8A90C" stroke-width="2.4" stroke-linejoin="round">' + star(46, 60, 15, 'none').replace('fill="none"', 'fill="#FFD76A" fill-opacity=".55"') + star(74, 60, 15, 'none').replace('fill="none"', 'fill="#FFD76A" fill-opacity=".55"') + '</g><path d="M60 58 Q61 56 62 58" stroke="#E8A90C" stroke-width="2.4" fill="none"/>' });
  add('goggles', 'face', '泳镜', 16, { svg: '<path d="M22 54 Q60 44 98 54" stroke="#2F78CE" stroke-width="5" fill="none" stroke-linecap="round"/>' + R(31, 49, 27, 21, 10, '#9AD4FF', 2.2).replace('fill="#9AD4FF"', 'fill="#9AD4FF" fill-opacity=".6"') + R(62, 49, 27, 21, 10, '#9AD4FF', 2.2).replace('fill="#9AD4FF"', 'fill="#9AD4FF" fill-opacity=".6"') + '<path d="M58 59 H62" stroke="#2F78CE" stroke-width="4"/>' });
  add('nose', 'face', '红鼻头', 8, { svg: C(60, 69, 6.4, '#EF3B4D', 1.4) + '<circle cx="58" cy="67" r="1.8" fill="#fff" opacity=".7"/>' });
  add('whisk', 'face', '猫胡须', 8, { svg: '<path d="M22 68 L40 71 M22 75 L40 74 M98 68 L80 71 M98 75 L80 74" stroke="#2A2748" stroke-width="2" stroke-linecap="round"/><path d="M57 67 L63 67 L60 70Z" fill="#FF8FA3"/>' });
  add('hearttag', 'face', '爱心脸贴', 6, { svg: heart(34, 72, 1.15, '#FF5C7A') });
  add('startag', 'face', '星星脸贴', 6, { svg: star(86, 72, 7, '#FFC83D') });
  add('freckle', 'face', '小雀斑', 6, { svg: '<g fill="#B8734A" opacity=".7"><circle cx="35" cy="68" r="1.2"/><circle cx="40" cy="71" r="1.2"/><circle cx="33" cy="73" r="1.2"/><circle cx="85" cy="68" r="1.2"/><circle cx="80" cy="71" r="1.2"/><circle cx="87" cy="73" r="1.2"/></g>' });
  add('glass3d', 'face', '3D 眼镜', 12, { svg: '<rect x="31" y="49" width="27" height="21" rx="3" fill="#FF5C5C" fill-opacity=".55" stroke="#fff" stroke-width="3"/><rect x="62" y="49" width="27" height="21" rx="3" fill="#4E9BF5" fill-opacity=".55" stroke="#fff" stroke-width="3"/><path d="M58 56 H62 M31 54 L25 52 M89 54 L95 52" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>' });

  /* ================= 上衣 ================= */
  var TORSO = 'M43 93 Q60 89 77 93 L79 124 Q60 128 41 124Z';
  var SLV = 'M-4 -2 Q4 -5 8 -1 L9 11 Q3 14 -3 11Z', SLVL = 'M-4 -2 Q4 -5 8 -1 L9.5 21 Q3 24 -3.5 21Z';
  function collar(c) { return '<path d="M52 91 Q60 100 68 91" fill="none" stroke="' + shade(c, -0.3) + '" stroke-width="1.8" stroke-linecap="round"/>'; }
  function tee(id, name, price, c, o) {
    o = o || {};
    add(id, 'top', name, price, { t: P(TORSO, c) + collar(c) + (o.t || ''), s: P(o.long ? SLVL : SLV, o.sc || c) + (o.cuff ? '<path d="M-3.5 19 Q3 22 9.5 19" stroke="' + o.cuff + '" stroke-width="3" fill="none"/>' : '') + (o.s || '') });
  }
  tee('tee1', '白T恤', 8, '#FFFFFF');
  tee('tee2', '红T恤', 8, '#EF5B5B', { t: star(60, 108, 7, '#FFE08A') });
  tee('tee3', '蓝条纹衫', 12, '#FFFFFF', { long: true, t: '<path d="M42 100 H78 M42 108 H78 M42 116 H78" stroke="#4E9BF5" stroke-width="3.4"/>', s: '<path d="M-4 4 H9 M-4 11 H9 M-4 18 H9" stroke="#4E9BF5" stroke-width="3.4"/>' });
  tee('hoodie', '黄卫衣', 14, '#FFC83D', { long: true, cuff: '#E8A90C', t: R(48, 109, 24, 11, 4, '#F5B81E', 1.4) + '<path d="M54 92 L53 102 M66 92 L67 102" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' });
  tee('dinotee', '恐龙衫', 14, '#3DB88C', { t: P('M50 112 Q54 102 60 106 Q66 98 70 110 Q60 118 50 112Z', '#7DD36B', 1.4) + C(63, 105, 1.4, '#2A2748', 0.2) });
  add('uniform', 'top', '校服衬衫', 14, { t: P(TORSO, '#fff') + P('M52 91 L60 102 L68 91 L64 90 L60 95 L56 90Z', '#E9E4F5', 1.4) + P('M58 98 L62 98 L63 118 L60 121 L57 118Z', '#EF5B5B', 1.4), s: P(SLV, '#fff') });
  add('vest', 'top', '小背心', 10, { t: P('M45 93 Q60 100 75 93 L78 124 Q60 128 42 124Z', '#5DA9FF') + '<path d="M60 100 V126" stroke="' + shade('#5DA9FF', -0.3) + '" stroke-width="1.6"/>' + C(60, 108, 1.6, '#fff', 0.2) + C(60, 116, 1.6, '#fff', 0.2), s: '' });
  add('chefcoat', 'top', '厨师服', 18, { t: P(TORSO, '#fff') + '<path d="M60 93 V126" stroke="#D9D3E8" stroke-width="1.6"/>' + C(55, 104, 1.8, '#9A96C8', 0.2) + C(55, 114, 1.8, '#9A96C8', 0.2) + C(65, 104, 1.8, '#9A96C8', 0.2) + C(65, 114, 1.8, '#9A96C8', 0.2), s: P(SLV, '#fff') });
  add('suit', 'top', '小西装', 22, { t: P(TORSO, '#3B3670') + P('M52 91 L60 108 L68 91 L64 90 L60 97 L56 90Z', '#fff', 1.4) + P('M58 98 L62 98 L63 112 L60 115 L57 112Z', '#EF5B5B', 1.4) + '<path d="M60 108 L50 120 M60 108 L70 120" stroke="' + shade('#3B3670', -0.3) + '" stroke-width="1.6"/>', s: P(SLVL, '#3B3670') });
  add('spacesuit', 'top', '宇航服', 26, { t: P(TORSO, '#F2F0FA') + R(50, 100, 20, 13, 3, '#5DA9FF', 1.4) + C(55, 106, 2, '#EF5B5B', 0.2) + C(61, 106, 2, '#FFC83D', 0.2) + C(67, 106, 2, '#2FB9A5', 0.2) + '<path d="M44 119 H76" stroke="#B7B1DB" stroke-width="2"/>', s: P(SLVL, '#F2F0FA') + '<path d="M-3.5 17 Q3 20 9.5 17" stroke="#EF5B5B" stroke-width="3" fill="none"/>' });
  add('tang', 'top', '红色唐装', 24, { t: P(TORSO, '#E8453C') + '<path d="M60 92 V126" stroke="#C0302A" stroke-width="1.6"/>' + [[60, 98], [60, 108], [60, 118]].map(function (a) { return '<path d="M' + (a[0] - 4) + ' ' + a[1] + ' q4 -4 8 0 q-4 4 -8 0Z" fill="#FFC83D" stroke="#C0302A" stroke-width="1"/>'; }).join('') + '<path d="M52 91 Q60 97 68 91" stroke="#FFC83D" stroke-width="2.4" fill="none"/>', s: P(SLVL, '#E8453C') + '<path d="M-3.5 19 Q3 22 9.5 19" stroke="#FFC83D" stroke-width="2.6" fill="none"/>' });
  add('hanfu', 'top', '浅蓝汉服', 26, { t: P(TORSO, '#8CC5F5') + '<path d="M52 91 L66 126 M68 91 L60 108" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>' + '<path d="M43 112 H77" stroke="#FFC83D" stroke-width="4"/>', s: P('M-4 -2 Q4 -5 8 -1 L11 22 Q3 26 -5 22Z', '#8CC5F5') + '<path d="M-5 20 Q3 24 11 20" stroke="#fff" stroke-width="2.6" fill="none"/>' });
  add('rain', 'top', '黄雨衣', 16, { t: P(TORSO, '#FFC83D') + '<path d="M60 93 V126" stroke="#E8A90C" stroke-width="2"/>' + C(60, 104, 1.8, '#E8A90C', 0.2) + C(60, 114, 1.8, '#E8A90C', 0.2), s: P(SLVL, '#FFC83D') });
  add('sport', 'top', '运动服', 16, { t: P(TORSO, '#EF5B5B') + '<path d="M44 96 L46 124 M76 96 L74 124" stroke="#fff" stroke-width="3"/>', s: P(SLVL, '#EF5B5B') + '<path d="M-3 0 L-3 21 M7 0 L8 21" stroke="#fff" stroke-width="2"/>' });
  add('sailor', 'top', '海魂衫', 14, { t: P(TORSO, '#fff') + '<path d="M42 100 H78 M42 108 H78 M42 116 H78" stroke="#2F78CE" stroke-width="3"/>' + P('M50 91 L60 100 L70 91 L66 94 L60 97 L54 94Z', '#2F78CE', 1.4), s: P(SLV, '#fff') + '<path d="M-4 5 H9" stroke="#2F78CE" stroke-width="3"/>' });
  add('sweater', 'top', '小熊毛衣', 18, { t: P(TORSO, '#FFB84D') + C(60, 109, 8, '#8D5A2B', 1.4) + C(54, 102, 3.4, '#8D5A2B', 1) + C(66, 102, 3.4, '#8D5A2B', 1) + C(60, 111, 3.4, '#E7C08C', 0.6) + '<circle cx="57.4" cy="107.6" r="1" fill="#2A2748"/><circle cx="62.6" cy="107.6" r="1" fill="#2A2748"/>', s: P(SLVL, '#FFB84D') + '<path d="M-3.5 19 Q3 22 9.5 19" stroke="#E8A90C" stroke-width="3" fill="none"/>' });
  add('princess', 'top', '公主上衣', 22, { t: P(TORSO, '#FF9CC4') + heart(60, 108, 1.5, '#fff') + '<path d="M52 91 Q60 98 68 91" stroke="#fff" stroke-width="2.6" fill="none"/>', s: P('M-5 -3 Q4 -8 9 -2 L9 8 Q2 12 -5 8Z', '#FFB8D6') });

  /* ================= 下装 ================= */
  function shorts(id, name, price, c, o) { o = o || {}; add(id, 'bottom', name, price, { w: P('M41 118 L79 118 L80 128 Q60 133 40 128Z', c) + '<path d="M60 119 V129" stroke="' + shade(c, -0.3) + '" stroke-width="1.6"/>' + (o.w || ''), l: '' }); }
  function pants(id, name, price, c, o) { o = o || {}; add(id, 'bottom', name, price, { w: P('M41 117 L79 117 L80 127 L40 127Z', c) + '<path d="M60 118 V127" stroke="' + shade(c, -0.3) + '" stroke-width="1.6"/>' + (o.w || ''), l: '<rect x="-5.6" y="-3" width="11.2" height="19.5" rx="4" fill="' + c + '"' + sk(c, 1.6) + '/>' + (o.l || '') }); }
  function skirt(id, name, price, c, o) { o = o || {}; add(id, 'bottom', name, price, { w: P('M42 116 L78 116 L90 137 Q60 144 30 137Z', c) + (o.w || ''), l: '' }); }
  shorts('shorts2', '牛仔短裤', 10, '#5B84D6');
  shorts('shorts3', '红短裤', 8, '#EF5B5B');
  shorts('shorts4', '绿短裤', 8, '#3DB88C');
  pants('jeans', '牛仔裤', 14, '#4B6FD8', { w: '<path d="M48 119 L52 123 M72 119 L68 123" stroke="#FFC83D" stroke-width="1.4"/>' });
  pants('sportpants', '运动长裤', 14, '#3B3670', { l: '<path d="M-5 0 V16" stroke="#fff" stroke-width="2.2"/>' });
  pants('rainpants', '黄雨裤', 12, '#FFC83D');
  pants('overall', '背带裤', 18, '#5B84D6', { w: P('M47 101 L73 101 L74 118 L46 118Z', '#5B84D6') + '<path d="M48 101 L50 91 M72 101 L70 91" stroke="#5B84D6" stroke-width="4.4" stroke-linecap="round"/>' + C(48, 103, 2, '#FFC83D', 0.2) + C(72, 103, 2, '#FFC83D', 0.2) + R(54, 106, 12, 8, 2, '#4668B8', 1.2) });
  pants('pumpkin', '灯笼裤', 14, '#9A7BEF');
  skirt('skirt1', '粉粉百褶裙', 14, '#FF9CC4', { w: '<path d="M42 126 L38 136 M52 128 L50 140 M62 128 L62 140 M72 128 L74 140 M80 126 L84 136" stroke="' + shade('#FF9CC4', -0.22) + '" stroke-width="1.4"/>' });
  skirt('skirt2', '蓝色格子裙', 14, '#5DA9FF', { w: '<path d="M38 126 H82 M34 132 H86 M52 117 L50 140 M68 117 L70 140" stroke="#fff" stroke-width="1.6" opacity=".7"/>' });
  skirt('tutu', '芭蕾蓬蓬裙', 20, '#FFC2DE', { w: '<path d="M32 134 Q46 126 60 134 Q74 126 88 134" stroke="#fff" stroke-width="2.2" fill="none" opacity=".8"/>' });

  /* ================= 鞋子 ================= */
  function shoe(id, name, price, c, o) { o = o || {}; add(id, 'shoes', name, price, { f: o.f || (P('M-7 1 Q-8 11 1 11 L9 11 Q11 5 6 1Z', c) + '<path d="M-6 8 L9 8" stroke="' + (o.sole || '#fff') + '" stroke-width="2.4" stroke-linecap="round"/>' + (o.x || '')) }); }
  shoe('shoe_r', '红运动鞋', 8, '#EF5B5B');
  shoe('shoe_b', '蓝运动鞋', 8, '#4E9BF5');
  shoe('shoe_p', '粉色小鞋', 8, '#FF8FB8');
  shoe('shoe_g', '黑皮鞋', 10, '#3B3670', { sole: '#6C67A8', x: '<path d="M-3 3 H4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>' });
  shoe('shoe_rb', '黄雨靴', 12, '', { f: P('M-6 -9 L6 -9 L7 2 Q11 3 11 10 L-8 11 L-6 -9Z', '#FFC83D') + '<path d="M-6 -4 H7" stroke="#E8A90C" stroke-width="2"/>' });
  shoe('shoe_boot', '棕色小靴', 14, '', { f: P('M-6 -8 L6 -8 L7 2 Q11 3 11 10 L-8 11 L-6 -8Z', '#A87A4D') + '<path d="M-6 -3 H7 M-6 1 H7" stroke="#7B5632" stroke-width="1.4"/>' });
  shoe('shoe_sand', '小凉鞋', 8, '', { f: P('M-7 4 Q-6 11 1 11 L9 11 Q11 8 8 5Z', '#F2C46B') + '<path d="M-5 4 L2 -2 L6 4" stroke="#D6A23F" stroke-width="2" fill="none" stroke-linecap="round"/>' });
  shoe('shoe_skate', '溜冰鞋', 18, '', { f: P('M-6 -6 L6 -6 L7 4 L9 9 L-8 9 L-6 -6Z', '#FF7A59') + '<path d="M-8 9 H9" stroke="#fff" stroke-width="3"/>' + C(-4, 12, 2.8, '#2A2748', 0.4) + C(6, 12, 2.8, '#2A2748', 0.4) });
  shoe('shoe_space', '宇航靴', 18, '', { f: P('M-6 -8 L6 -8 L7 2 Q11 3 11 10 L-8 11 L-6 -8Z', '#F2F0FA') + '<path d="M-6 -2 H7" stroke="#EF5B5B" stroke-width="2.4"/>' + '<path d="M-7 8 H10" stroke="#8D88B5" stroke-width="3"/>' });
  shoe('shoe_rain', '彩虹运动鞋', 14, '', { f: P('M-7 1 Q-8 11 1 11 L9 11 Q11 5 6 1Z', '#fff') + '<path d="M-6 3 L8 3" stroke="#EF5B5B" stroke-width="2"/><path d="M-6 6 L9 6" stroke="#FFC83D" stroke-width="2"/><path d="M-6 9 L9 9" stroke="#5DA9FF" stroke-width="2"/>' });
  shoe('shoe_bunny', '兔兔拖鞋', 12, '', { f: P('M-8 2 Q-9 11 1 11 L10 11 Q12 5 7 2Z', '#FFD0E0') + P('M-2 0 L-4 -9 L1 -2Z', '#fff', 1.2) + P('M3 0 L5 -9 L7 -1Z', '#fff', 1.2) });

  /* ================= 脖子 ================= */
  add('bell', 'neck', '小铃铛', 8, { svg: '<path d="M44 88 Q60 100 76 88" fill="none" stroke="#EF5B5B" stroke-width="5" stroke-linecap="round"/>' + C(60, 98, 5.6, '#FFC83D', 1.8) + '<path d="M58 99 h4" stroke="#E8A90C" stroke-width="1.6"/>' });
  add('bowtie', 'neck', '蓝领结', 10, { svg: '<g transform="translate(60 92)">' + P('M0 0 L-14 -8 L-14 8Z M0 0 L14 -8 L14 8Z', '#5DA9FF') + R(-4, -5, 8, 10, 3, '#7FBBFF', 1.6) + '</g>' });
  add('bowtie2', 'neck', '粉色蝴蝶结', 10, { svg: '<g transform="translate(60 92)">' + P('M0 0 L-14 -8 L-14 8Z M0 0 L14 -8 L14 8Z', '#FF6FA5') + R(-4, -5, 8, 10, 3, '#FF9CC4', 1.6) + '</g>' });
  add('scarf', 'neck', '红围巾', 12, { svg: P('M41 87 Q60 100 79 87 L81 97 Q60 110 39 97Z', '#EF5B5B', 2) + P('M68 100 L74 122 L84 118 L80 98Z', '#EF5B5B', 2) + '<path d="M72 112 H82 M71 118 H83" stroke="#FFD0C9" stroke-width="2"/>' });
  add('necklace', 'neck', '星星项链', 12, { svg: '<path d="M46 89 Q60 108 74 89" fill="none" stroke="#E8A90C" stroke-width="2" stroke-linecap="round"/>' + star(60, 104, 6.4, '#FFC83D') });
  add('medal', 'neck', '金牌', 20, { svg: '<path d="M48 88 L58 108 M72 88 L62 108" stroke="#EF5B5B" stroke-width="4" stroke-linecap="round"/>' + C(60, 112, 8, '#FFC83D', 2) + '<path d="M56 112 L59 115 L65 108" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>' });
  add('bib', 'neck', '小围兜', 8, { svg: P('M46 88 Q60 100 74 88 L78 112 Q60 122 42 112Z', '#fff', 2) + '<path d="M50 102 H70" stroke="#FFB8D6" stroke-width="3" stroke-dasharray="3 3"/>' });
  add('lei', 'neck', '花朵项圈', 14, { svg: '<path d="M42 89 Q60 106 78 89" fill="none" stroke="#3DB88C" stroke-width="3"/>' + [[46, 94, '#FF6FA5'], [53, 99, '#FFC83D'], [60, 101, '#fff'], [67, 99, '#FF6FA5'], [74, 94, '#FFC83D']].map(function (a) { return C(a[0], a[1], 4.4, a[2], 1.1); }).join('') });
  add('scarf2', 'neck', '黄色小围脖', 10, { svg: P('M42 87 Q60 99 78 87 L80 98 Q60 108 40 98Z', '#FFC83D', 2) + '<path d="M44 94 Q60 104 76 94" stroke="#fff" stroke-width="1.8" stroke-dasharray="4 4" fill="none"/>' });
  add('stetho', 'neck', '小听诊器', 16, { svg: '<path d="M46 88 C46 112 74 112 74 88" fill="none" stroke="#3B3670" stroke-width="2.6"/><path d="M60 106 V114" stroke="#3B3670" stroke-width="2.6"/>' + C(60, 116, 4.4, '#C9C5E8', 1.6) });

  /* ================= 背饰（画在身体后面） ================= */
  add('bag', 'back', '小书包', 14, { svg: R(30, 90, 18, 34, 7, '#FF7A59', 2) + R(72, 90, 18, 34, 7, '#FF7A59', 2) + R(34, 92, 52, 30, 8, '#FF8F6E', 2) });
  add('wing1', 'back', '天使翅膀', 28, { svg: P('M44 96 C14 70 2 88 8 104 C12 116 30 118 44 110Z', '#fff', 2) + P('M76 96 C106 70 118 88 112 104 C108 116 90 118 76 110Z', '#fff', 2) + '<path d="M20 90 Q28 98 38 100 M100 90 Q92 98 82 100" stroke="#DCD6F0" stroke-width="2" fill="none"/>' });
  add('wing2', 'back', '蝴蝶翅膀', 28, { svg: P('M44 96 C20 66 -2 80 6 100 C8 112 30 112 44 106Z', '#FFB347') + P('M76 96 C100 66 122 80 114 100 C112 112 90 112 76 106Z', '#FFB347') + C(16, 88, 5, '#fff', 1) + C(104, 88, 5, '#fff', 1) + P('M44 106 C26 108 14 118 22 126 C34 130 44 118 44 106Z', '#FF7A59') + P('M76 106 C94 108 106 118 98 126 C86 130 76 118 76 106Z', '#FF7A59') });
  add('cape', 'back', '红披风', 20, { svg: P('M42 92 L78 92 L96 140 Q60 150 24 140Z', '#EF5B5B', 2) + '<path d="M60 96 V146" stroke="#C94444" stroke-width="1.6"/>' });
  add('rainbowcape', 'back', '彩虹披风', 26, { svg: P('M42 92 L78 92 L96 140 Q60 150 24 140Z', '#9A7BEF', 2) + '<path d="M36 124 Q60 134 84 124" stroke="#5DA9FF" stroke-width="4" fill="none"/><path d="M32 132 Q60 142 88 132" stroke="#3DB88C" stroke-width="4" fill="none"/><path d="M29 139 Q60 149 91 139" stroke="#FFC83D" stroke-width="4" fill="none"/>' });
  add('jet', 'back', '火箭背包', 30, { svg: R(30, 92, 16, 34, 8, '#B7B1DB', 2) + R(74, 92, 16, 34, 8, '#B7B1DB', 2) + P('M33 126 L43 126 L38 140Z', '#FF7A59', 1.4) + P('M77 126 L87 126 L82 140Z', '#FF7A59', 1.4) + '<path d="M38 98 V112 M82 98 V112" stroke="#EF5B5B" stroke-width="3" stroke-linecap="round"/>' });
  add('dinotail', 'back', '恐龙背刺', 22, { svg: P('M60 84 L52 66 L60 74 L66 60 L70 74 L80 64 L76 86Z', '#7DD36B') + P('M44 112 Q16 116 14 138 Q30 136 44 126Z', '#3DB88C') });
  add('shell', 'back', '乌龟壳', 20, { svg: E(60, 108, 36, 30, '#6FB26B', 2.2) + '<path d="M44 94 L60 88 L76 94 L76 112 L60 124 L44 112Z M60 88 V124 M44 103 H76" stroke="#3E8A48" stroke-width="2" fill="none" stroke-linejoin="round"/>' });

  /* ================= 手里拿的（右手心 = 0,0） ================= */
  add('pencil', 'hand', '大铅笔', 10, { svg: '<g transform="rotate(24)">' + R(-3, -26, 6, 30, 1.4, '#FFC83D', 1.4) + P('M-3 4 L3 4 L0 11Z', '#F2C9A0', 1.2) + P('M-1.2 8.5 L1.2 8.5 L0 11Z', '#2A2748', 0.6) + R(-3, -29, 6, 5, 1.4, '#FF8FA3', 1.2) + '</g>' });
  add('balloon', 'hand', '红气球', 10, { svg: '<path d="M0 0 C-2 -10 4 -20 0 -34" stroke="#8D88B5" stroke-width="1.2" fill="none"/>' + E(0, -46, 11, 13, '#EF5B5B', 1.8) + '<path d="M-3 -34 L3 -34 L0 -31Z" fill="#C94444"/><ellipse cx="-4" cy="-51" rx="2.6" ry="4" fill="#fff" opacity=".5"/>' });
  add('wand', 'hand', '魔法棒', 16, { svg: '<g transform="rotate(30)"><path d="M0 4 L0 -22" stroke="#9A7BEF" stroke-width="3.4" stroke-linecap="round"/>' + star(0, -28, 10, '#FFC83D') + '</g>' });
  add('lens', 'hand', '放大镜', 14, { svg: '<g transform="rotate(30)"><path d="M0 4 L0 -12" stroke="#8D5A2B" stroke-width="4.4" stroke-linecap="round"/><circle cx="0" cy="-22" r="10" fill="#BFE3FF" fill-opacity=".5" stroke="#E8A90C" stroke-width="3"/><path d="M-5 -26 Q-3 -29 0 -29" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></g>' });
  add('icecream', 'hand', '冰淇淋', 12, { svg: '<g transform="rotate(14)">' + P('M-5 -14 L5 -14 L0 6Z', '#E7B97A', 1.4) + C(0, -18, 7, '#FFB8D6', 1.6) + C(0, -25, 5.4, '#fff', 1.4) + C(0, -30, 2.2, '#EF3B4D', 0.8) + '</g>' });
  add('book', 'hand', '小书本', 10, { svg: '<g transform="rotate(-8)">' + R(-9, -22, 18, 24, 2.4, '#4E9BF5', 1.8) + '<path d="M-5 -18 H5 M-5 -13 H5" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>' });
  add('pinwheel', 'hand', '小风车', 12, { svg: '<path d="M0 2 L0 -22" stroke="#8D5A2B" stroke-width="2.4"/><g transform="translate(0 -26)">' + P('M0 0 L-12 -4 L-8 -12Z', '#EF5B5B', 1.2) + P('M0 0 L12 -4 L8 -12Z', '#FFC83D', 1.2) + P('M0 0 L-12 4 L-8 12Z', '#5DA9FF', 1.2) + P('M0 0 L12 4 L8 12Z', '#3DB88C', 1.2) + C(0, 0, 2, '#fff', 1) + '</g>' });
  add('tanghulu', 'hand', '糖葫芦', 14, { svg: '<path d="M0 4 L0 -36" stroke="#C9A27A" stroke-width="2.4" stroke-linecap="round"/>' + C(0, -10, 6.4, '#E8453C', 1.4) + C(0, -20, 6.4, '#E8453C', 1.4) + C(0, -30, 6.4, '#E8453C', 1.4) + '<circle cx="-2" cy="-11" r="1.6" fill="#fff" opacity=".6"/><circle cx="-2" cy="-21" r="1.6" fill="#fff" opacity=".6"/><circle cx="-2" cy="-31" r="1.6" fill="#fff" opacity=".6"/>' });
  add('net', 'hand', '捕虫网', 12, { svg: '<g transform="rotate(20)"><path d="M0 4 L0 -22" stroke="#8D5A2B" stroke-width="2.6"/><ellipse cx="0" cy="-32" rx="11" ry="12" fill="#fff" fill-opacity=".4" stroke="#3DB88C" stroke-width="2.2"/><path d="M-8 -36 L8 -28 M-9 -30 L9 -34 M-5 -41 V-23 M5 -41 V-23" stroke="#3DB88C" stroke-width="1" opacity=".7"/></g>' });
  add('bouquet', 'hand', '小花束', 12, { svg: P('M-5 -6 L5 -6 L0 6Z', '#fff', 1.4) + C(-6, -12, 5, '#FF6FA5', 1.2) + C(6, -12, 5, '#FFC83D', 1.2) + C(0, -17, 5, '#FF5C5C', 1.2) + '<path d="M0 -6 V-12" stroke="#2A9A72" stroke-width="2"/>' });
  add('lantern', 'hand', '红灯笼', 16, { svg: '<path d="M0 0 V-12" stroke="#8D5A2B" stroke-width="1.6"/>' + R(-8, -15, 16, 4, 1, '#E8A90C', 1) + E(0, -24, 11, 10, '#E8453C', 1.8) + R(-8, -35, 16, 4, 1, '#E8A90C', 1) + '<path d="M0 -34 V-14 M-6 -33 Q-8 -24 -6 -15 M6 -33 Q8 -24 6 -15" stroke="#C0302A" stroke-width="1.2" fill="none"/>' + '<path d="M0 -35 V-13" stroke="none"/><path d="M-1.4 -13 L-1.4 -4 M1.4 -13 L1.4 -4" stroke="#FFC83D" stroke-width="1.6"/>' });
  add('brush', 'hand', '大画笔', 12, { svg: '<g transform="rotate(26)">' + R(-2.6, -22, 5.2, 24, 2, '#8D5A2B', 1.2) + P('M-4 -22 L4 -22 L3 -30 Q0 -36 -3 -30Z', '#FF6FA5', 1.2) + '</g>' });

  /* ================= 小伙伴（站在右下角，宠物自己的局部坐标，中心在 (106,134)） ================= */
  function petg(inner) { return '<g transform="translate(106 133)">' + inner + '</g>'; }
  add('inkdot', 'pet', '小墨点', 12, { svg: petg('<path d="M0 -17 C0 -17 -13 -3 -13 5 C-13 12 -7 15 0 15 C7 15 13 12 13 5 C13 -3 0 -17 0 -17Z" fill="#4A468F" stroke="#2F2C5C" stroke-width="1.6"/><path d="M0 -17 C-3 -12 -6 -8 -8 -6 C-4 -9 -1 -13 0 -17Z" fill="#fff" opacity=".25"/><circle cx="-4.4" cy="3" r="2.8" fill="#fff"/><circle cx="4.4" cy="3" r="2.8" fill="#fff"/><circle cx="-4" cy="3.4" r="1.4" fill="#1d1b3a"/><circle cx="4.8" cy="3.4" r="1.4" fill="#1d1b3a"/><path d="M-3 9 Q0 12 3 9" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cx="-8" cy="8" rx="2.4" ry="1.4" fill="#FF8F7A" opacity=".8"/><ellipse cx="8" cy="8" rx="2.4" ry="1.4" fill="#FF8F7A" opacity=".8"/>') });
  add('cat', 'pet', '小花猫', 20, { svg: petg(P('M-11 -2 L-10 -14 L-3 -8Z M11 -2 L10 -14 L3 -8Z', '#F5B357', 1.4) + E(0, 4, 12, 11, '#F5B357', 1.6) + '<path d="M-4 -6 L-4 -1 M0 -7 V-2 M4 -6 V-1" stroke="#C98B2B" stroke-width="1.4" stroke-linecap="round"/><circle cx="-5" cy="3" r="1.8" fill="#2A2748"/><circle cx="5" cy="3" r="1.8" fill="#2A2748"/><path d="M-1.6 7 L1.6 7 L0 9Z" fill="#FF8FA3"/><path d="M-12 6 L-20 4 M-12 9 L-20 10 M12 6 L20 4 M12 9 L20 10" stroke="#2A2748" stroke-width="1" stroke-linecap="round"/>') });
  add('dog', 'pet', '小黄狗', 20, { svg: petg(P('M-12 -4 Q-18 8 -10 12 L-6 0Z M12 -4 Q18 8 10 12 L6 0Z', '#A8753F', 1.4) + E(0, 3, 12, 12, '#F2C46B', 1.6) + E(0, 8, 6, 4.4, '#FFF1CC', 1) + '<circle cx="-5" cy="1" r="1.8" fill="#2A2748"/><circle cx="5" cy="1" r="1.8" fill="#2A2748"/><ellipse cx="0" cy="6" rx="2.4" ry="1.6" fill="#2A2748"/><path d="M0 8 Q-3 12 -5 10 M0 8 Q3 12 5 10" stroke="#2A2748" stroke-width="1" fill="none"/><path d="M-3 12 Q0 16 3 12Z" fill="#FF8FA3"/>') });
  add('bunnypet', 'pet', '小白兔', 20, { svg: petg(P('M-7 -4 C-12 -22 -4 -26 -3 -16 C-2 -10 -3 -6 -3 -4Z', '#fff', 1.4) + P('M7 -4 C12 -22 4 -26 3 -16 C2 -10 3 -6 3 -4Z', '#fff', 1.4) + E(0, 4, 12, 11, '#fff', 1.6) + '<circle cx="-5" cy="3" r="1.8" fill="#2A2748"/><circle cx="5" cy="3" r="1.8" fill="#2A2748"/><path d="M-1.6 7 L1.6 7 L0 9Z" fill="#FF8FA3"/><ellipse cx="-8" cy="7" rx="2.4" ry="1.4" fill="#FFB3C9"/><ellipse cx="8" cy="7" rx="2.4" ry="1.4" fill="#FFB3C9"/>') });
  add('bird', 'pet', '小黄鸟', 16, { svg: petg(E(0, 4, 11, 10, '#FFD54A', 1.6) + P('M-2 -4 C-2 -12 4 -12 6 -8 C2 -8 0 -6 -2 -4Z', '#FFD54A', 1.2) + P('M-4 6 C-12 4 -16 12 -8 12Z', '#F5B81E', 1.2) + '<circle cx="3" cy="1" r="1.8" fill="#2A2748"/><path d="M7 3 L13 5 L7 7Z" fill="#FF8F3D" stroke="#E86F1A" stroke-width="0.8"/>') });
  add('bear', 'pet', '小棕熊', 22, { svg: petg(C(-8, -6, 4.6, '#A8753F', 1.4) + C(8, -6, 4.6, '#A8753F', 1.4) + E(0, 3, 12, 11, '#C98F57', 1.6) + E(0, 7, 5.6, 4, '#F2D3A8', 0.8) + '<circle cx="-5" cy="1" r="1.8" fill="#2A2748"/><circle cx="5" cy="1" r="1.8" fill="#2A2748"/><ellipse cx="0" cy="5.6" rx="2" ry="1.5" fill="#2A2748"/>') });
  add('panda2', 'pet', '小熊猫', 26, { svg: petg(C(-9, -6, 4.8, '#2A2748', 1) + C(9, -6, 4.8, '#2A2748', 1) + E(0, 3, 12, 11, '#fff', 1.6) + E(-5.4, 1, 3.6, 4.4, '#2A2748', 0.4) + E(5.4, 1, 3.6, 4.4, '#2A2748', 0.4) + '<circle cx="-5" cy="1.4" r="1.2" fill="#fff"/><circle cx="5" cy="1.4" r="1.2" fill="#fff"/><ellipse cx="0" cy="5.6" rx="2" ry="1.5" fill="#2A2748"/>') });
  add('dinopet', 'pet', '小恐龙', 26, { svg: petg(P('M-12 8 Q-24 12 -20 2 Q-16 8 -10 4Z', '#3DB88C', 1.2) + E(0, 5, 12, 10, '#5CC24E', 1.6) + P('M-6 -4 L-4 -10 L-1 -5 L2 -11 L5 -4Z', '#2A9A72', 1.2) + E(5, -1, 7.4, 6.4, '#5CC24E', 1.4) + '<circle cx="7" cy="-3" r="1.6" fill="#2A2748"/><path d="M5 1 Q8 3 11 1" stroke="#2A2748" stroke-width="1" fill="none"/><path d="M-6 14 V16 M4 14 V16" stroke="#2A9A72" stroke-width="3" stroke-linecap="round"/>') });
  add('duck', 'pet', '小黄鸭', 16, { svg: petg(E(0, 6, 13, 9, '#FFD54A', 1.6) + C(6, -5, 7.4, '#FFD54A', 1.6) + '<circle cx="8" cy="-6" r="1.5" fill="#2A2748"/><path d="M12 -3 Q19 -2 18 1 Q13 2 11 0Z" fill="#FF8F3D" stroke="#E86F1A" stroke-width="0.8"/><path d="M-8 4 Q-2 10 6 6" stroke="#F5B81E" stroke-width="1.4" fill="none"/>') });
  add('ladybug', 'pet', '小瓢虫', 12, { svg: petg(C(8, 0, 5, '#2A2748', 1) + E(-2, 3, 12, 10, '#EF3B4D', 1.6) + '<path d="M-2 -7 V13" stroke="#2A2748" stroke-width="1.4"/><circle cx="-8" cy="1" r="2" fill="#2A2748"/><circle cx="4" cy="1" r="2" fill="#2A2748"/><circle cx="-7" cy="8" r="1.8" fill="#2A2748"/><circle cx="3" cy="8" r="1.8" fill="#2A2748"/><circle cx="9" cy="-1" r=".9" fill="#fff"/><path d="M10 -5 L14 -10 M7 -5 L7 -11" stroke="#2A2748" stroke-width="1" stroke-linecap="round"/>') });
  add('turtle', 'pet', '小乌龟', 18, { svg: petg(E(0, 4, 13, 9, '#6FB26B', 1.6) + P('M-18 4 L-6 8 L-8 -2Z', '#9ED08A', 0) + E(12, 3, 5, 4.4, '#9ED08A', 1.2) + '<circle cx="14" cy="2" r="1.2" fill="#2A2748"/><path d="M-6 0 L-2 -4 L4 -4 L8 0 L4 7 L-2 7Z" stroke="#3E8A48" stroke-width="1.2" fill="none"/><path d="M-8 12 V14 M6 12 V14" stroke="#9ED08A" stroke-width="3" stroke-linecap="round"/>') });

  /* ================= 背景（用渐变色画，放在小主人身后） ================= */
  var BG = AV.BG = {};
  function bg(id, name, price, css) { BG[id] = css; add(id, 'bg', name, price, { css: css }); }
  AV.BG_SKY = 'linear-gradient(180deg, #CDEBFF 0%, #F2FAFF 60%, #FFF7E8 100%)';
  bg('meadow', '绿草地', 10, 'linear-gradient(180deg, #C9EBFF 0%, #E9F8DA 58%, #A9DB84 100%)');
  bg('sea', '蓝色海边', 16, 'linear-gradient(180deg, #B9E3FF 0%, #E3F6FF 56%, #F4DFA6 57%, #F0D182 100%)');
  bg('night', '星星夜空', 16, 'radial-gradient(circle at 12% 30%, #fff 0 .12rem, transparent .16rem), radial-gradient(circle at 36% 70%, #fff 0 .1rem, transparent .14rem), radial-gradient(circle at 70% 24%, #fff 0 .14rem, transparent .18rem), radial-gradient(circle at 88% 62%, #fff 0 .1rem, transparent .14rem), linear-gradient(180deg, #2B2A66 0%, #5A56A8 100%)');
  bg('candy', '糖果乐园', 20, 'linear-gradient(135deg, #FFD3E6 0%, #FFF1C9 55%, #D5F1FF 100%)');
  bg('snow', '雪山小屋', 20, 'linear-gradient(180deg, #D8E8FF 0%, #F3F8FF 70%, #FFFFFF 100%)');
  bg('forest', '小森林', 14, 'linear-gradient(180deg, #D9F2C6 0%, #A8DB8E 55%, #5FB567 100%)');
  bg('space', '太空漫游', 24, 'radial-gradient(circle at 20% 24%, #FFE08A 0 .5rem, transparent .55rem), radial-gradient(circle at 78% 70%, #9AD4FF 0 .8rem, transparent .85rem), radial-gradient(circle at 60% 20%, #fff 0 .1rem, transparent .14rem), radial-gradient(circle at 30% 80%, #fff 0 .1rem, transparent .14rem), linear-gradient(180deg, #15123F 0%, #3B2F8C 100%)');
  bg('rainbow', '彩虹天空', 18, 'linear-gradient(180deg, #BDE6FF 0%, #E8F7FF 100%)');
  bg('sunset', '晚霞', 18, 'linear-gradient(180deg, #FFB48A 0%, #FFD9A0 45%, #FFF1CF 100%)');
  bg('garden', '开花的花园', 16, 'linear-gradient(180deg, #FFE3F0 0%, #FFF4DA 50%, #C8EAA0 100%)');
  AV.bgCss = function (id) { return BG[id] || AV.BG_SKY; };
  MZ.SLOT_DEFAULT = { top: '', bottom: '', shoes: '' };
})();
