/* Animación del mockup: esqueleto de pose estimation (vista lateral), cinemática de 2 segmentos para el brazo */
    (function () {
      'use strict';
      var $ = function (s) { return document.querySelector(s); };
      var body = $('#sk-body'), arm = $('#sk-arm'), head = $('#sk-head'), grp = $('#sk');
      var arc = $('#sk-arc'), ang = $('#sk-ang'), cnt = $('#rep-count'), stat = $('#rep-status'), bar = $('#rep-bar');
      if (!body || !arm || !head || !grp || !arc || !ang || !cnt || !stat || !bar) return;
      var J = {};
      Array.prototype.forEach.call(document.querySelectorAll('#sk [data-j]'), function (c) { J[c.getAttribute('data-j')] = c; });

      var A = { x: 22, y: 308 };                          /* tobillo (fijo) */
      var W = { x: 98, y: 308 };                          /* muñeca (fija) */
      var SEG = 24;                                       /* largo de brazo y antebrazo */
      var L = Math.hypot(98 - 22, 260 - 308);             /* largo del cuerpo: tobillo → hombro */
      var TH_TOP = Math.atan2(48, 76), TH_BOT = 21.5 * Math.PI / 180;
      var GOAL = 20, GREEN = '#00E676', RED = '#FF1744', AMBER = '#FFB300';

      var count = 7, lastStatus = '', lastBad = null;
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var set = function (el, k, v) { el.setAttribute(k, v); };
      var pt = function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); };

      function setStatus(text, bad) {
        if (text === lastStatus && bad === lastBad) return;
        lastStatus = text; lastBad = bad;
        stat.textContent = text;
        stat.className = 'st rounded-2xl border px-3 py-2 text-center font-mono text-[11px] font-bold uppercase tracking-wider backdrop-blur ' + (bad ? 'st-bad' : 'st-ok');
      }
      function setCount(n, animate) {
        count = n;
        cnt.textContent = pad(n);
        bar.style.transition = 'width .4s ease';
        bar.style.width = Math.min(100, n / GOAL * 100) + '%';
        if (animate) { cnt.classList.remove('pop'); void cnt.offsetWidth; cnt.classList.add('pop'); }
      }

      /* depth: 0 = brazos extendidos, 1 = 90° de codo · sag: hundimiento de cadera (unidades SVG) */
      function draw(depth, sag, bad) {
        var th = TH_TOP - depth * (TH_TOP - TH_BOT);
        var S = { x: A.x + L * Math.cos(th), y: A.y - L * Math.sin(th) };
        var u = { x: Math.cos(th), y: -Math.sin(th) };
        var n = { x: -u.y, y: u.x };                       /* normal hacia el suelo */
        var K = { x: A.x + (S.x - A.x) * 0.38 + n.x * sag * 0.35, y: A.y + (S.y - A.y) * 0.38 + n.y * sag * 0.35 };
        var H = { x: A.x + (S.x - A.x) * 0.64 + n.x * sag, y: A.y + (S.y - A.y) * 0.64 + n.y * sag };

        var vx = W.x - S.x, vy = W.y - S.y, d = Math.min(Math.hypot(vx, vy), 2 * SEG - 0.001);
        var h = Math.sqrt(Math.max(0, SEG * SEG - d * d / 4));
        var E = { x: (S.x + W.x) / 2 + (-vy / d) * h, y: (S.y + W.y) / 2 + (vx / d) * h };   /* codo hacia atrás */
        var elbow = Math.acos(Math.max(-1, Math.min(1, (2 * SEG * SEG - d * d) / (2 * SEG * SEG)))) * 180 / Math.PI;

        set(body, 'points', [pt(A), pt(K), pt(H), pt(S)].join(' '));
        set(arm, 'points', [pt(S), pt(E), pt(W)].join(' '));
        set(head, 'cx', (S.x + u.x * 16).toFixed(1)); set(head, 'cy', (S.y + u.y * 16).toFixed(1));
        [['a', A], ['k', K], ['h', H], ['s', S], ['e', E], ['w', W]].forEach(function (j) {
          if (!J[j[0]]) return;
          set(J[j[0]], 'cx', j[1].x.toFixed(1)); set(J[j[0]], 'cy', j[1].y.toFixed(1));
        });

        var col = bad ? RED : GREEN, ac = bad ? RED : AMBER;
        grp.style.color = col; set(arc, 'stroke', ac); set(ang, 'fill', ac);

        if (elbow < 172) {
          var r = 8, a1 = Math.atan2(S.y - E.y, S.x - E.x), a2 = Math.atan2(W.y - E.y, W.x - E.x);
          var cross = (S.x - E.x) * (W.y - E.y) - (S.y - E.y) * (W.x - E.x);
          set(arc, 'd', 'M' + (E.x + r * Math.cos(a1)).toFixed(1) + ' ' + (E.y + r * Math.sin(a1)).toFixed(1) +
            ' A' + r + ' ' + r + ' 0 0 ' + (cross > 0 ? 1 : 0) + ' ' + (E.x + r * Math.cos(a2)).toFixed(1) + ' ' + (E.y + r * Math.sin(a2)).toFixed(1));
        } else { set(arc, 'd', ''); }
        set(ang, 'x', (E.x + 16).toFixed(1)); set(ang, 'y', (E.y + 4).toFixed(1));
        ang.textContent = Math.round(elbow) + '°';
      }

      /* Ciclo de repeticiones: válidas, una con cadera hundida y una a medias (esas no suman) */
      var ease = function (p) { return (1 - Math.cos(Math.PI * p)) / 2; };
      var TYPES = ['ok', 'ok', 'ok', 'sag', 'ok', 'ok', 'half', 'ok'];
      var DOWN = 950, HOLD = 250, UP = 950, REST = 550, TOTAL = DOWN + HOLD + UP + REST;
      var elapsed = 0, last = null, running = false, curRep = -1, scored = -1, raf = 0;

      function tick(ts) {
        if (!running) return;
        if (last === null) last = ts;
        elapsed += Math.min(ts - last, 100); last = ts;

        var rep = Math.floor(elapsed / TOTAL), t = elapsed % TOTAL, type = TYPES[rep % TYPES.length];
        if (rep !== curRep) { curRep = rep; if (count >= GOAL) setCount(0, false); }

        var target = type === 'half' ? 0.55 : 1, depth, phase;
        if (t < DOWN) { depth = target * ease(t / DOWN); phase = 'down'; }
        else if (t < DOWN + HOLD) { depth = target; phase = 'hold'; }
        else if (t < DOWN + HOLD + UP) { depth = target * (1 - ease((t - DOWN - HOLD) / UP)); phase = 'up'; }
        else { depth = 0; phase = 'rest'; }

        var sag = type === 'sag' ? 12 * depth : 0;
        var bad = type !== 'ok' && (phase !== 'down' || sag > 5);
        draw(depth, sag, bad);

        if (phase === 'rest' && scored !== rep && type === 'ok') { scored = rep; setCount(count + 1, true); }

        var msg;
        if (phase === 'down') msg = sag > 5 ? '✗ Cadera hundida' : 'Bajando…';
        else if (type === 'ok') msg = phase === 'rest' ? (count >= GOAL ? '🔥 Pacto cumplido' : '+1 · Rep válida') : '✓ 90° alcanzado';
        else msg = type === 'sag' ? '✗ Cadera hundida · no cuenta' : '✗ Sin 90° · no cuenta';
        setStatus(msg, bad);

        raf = requestAnimationFrame(tick);
      }

      function start() { if (running) return; running = true; last = null; raf = requestAnimationFrame(tick); }
      function stop() { running = false; cancelAnimationFrame(raf); }

      setCount(7, false);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        draw(1, 0, false); setStatus('✓ 90° alcanzado', false);
        return;
      }
      draw(0, 0, false);
      var stage = $('.phone-stage');
      if ('IntersectionObserver' in window && stage) {
        new IntersectionObserver(function (es) { if (es[0].isIntersecting) start(); else stop(); }, { threshold: 0.05 }).observe(stage);
      } else { start(); }
    })();
