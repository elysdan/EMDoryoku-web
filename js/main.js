(function () {
      'use strict';
      var $ = function (s, c) { return (c || document).querySelector(s); };
      var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

      /* Año del footer */
      var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

      /* Menú móvil */
      var menuBtn = $('#menu-btn'), menu = $('#mobile-menu');
      function setMenu(open) {
        menu.classList.toggle('hidden', !open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      }
      menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
      $$('#mobile-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
      window.matchMedia('(min-width:1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

      /* Toast */
      var toastEl = $('#toast'), toastTimer;
      function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
      }
      $$('a[download]').forEach(function (a) {
        a.addEventListener('click', function () { toast('Descargando EMDoryoku-v1.0.apk…'); });
      });

      /* Reveal al hacer scroll */
      var reveals = $$('.reveal');
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            var el = en.target, delay = (reveals.indexOf(el) % 3) * 90;
            el.style.transitionDelay = delay + 'ms';
            el.classList.add('is-visible');
            io.unobserve(el);
            /* Al terminar, se retira .reveal para no interferir con los hover (card-lift) */
            setTimeout(function () { el.classList.remove('reveal', 'is-visible'); el.style.transitionDelay = ''; }, 1000 + delay);
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(function (el) { io.observe(el); });
      } else {
        reveals.forEach(function (el) { el.classList.add('is-visible'); });
      }

      /* FAQ acordeón (una pregunta abierta a la vez) */
      var faqs = $$('[data-faq]');
      function setFaq(item, open) {
        $('button', item).setAttribute('aria-expanded', String(open));
        $('.faq-panel', item).setAttribute('data-open', String(open));
        item.classList.toggle('is-open', open);
      }
      faqs.forEach(function (item) {
        $('button', item).addEventListener('click', function () {
          var wasOpen = $('button', item).getAttribute('aria-expanded') === 'true';
          faqs.forEach(function (o) { setFaq(o, false); });
          setFaq(item, !wasOpen);
        });
      });

      /* Diálogos */
      $$('[data-dialog]').forEach(function (b) {
        b.addEventListener('click', function () {
          var d = document.getElementById(b.getAttribute('data-dialog'));
          if (!d) return;
          if (d.showModal) { d.showModal(); document.documentElement.style.overflow = 'hidden'; } else { d.setAttribute('open', ''); }
        });
      });
      $$('dialog').forEach(function (d) {
        d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
        d.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
        $$('[data-close]', d).forEach(function (b) { b.addEventListener('click', function () { d.close(); }); });
      });

      /* Copiar hash SHA-256 */
      var copyBtn = $('#copy-sha'), copyLabel = $('#copy-label');
      copyBtn.addEventListener('click', function () {
        var text = $('#sha-value').textContent.trim();
        function done() {
          copyLabel.textContent = 'Copiado ✓';
          toast('Hash SHA-256 copiado');
          setTimeout(function () { copyLabel.textContent = 'Copiar'; }, 2000);
        }
        function fallback() {
          var ta = document.createElement('textarea');
          ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); done(); } catch (err) { toast('No se pudo copiar'); }
          document.body.removeChild(ta);
        }
        if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); }
      });

      /* Enlace activo del menú según la sección visible */
      var links = $$('header nav a[href^="#"]');
      if ('IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            links.forEach(function (l) {
              if (l.getAttribute('href') === '#' + en.target.id) l.setAttribute('aria-current', 'true');
              else l.removeAttribute('aria-current');
            });
          });
        }, { rootMargin: '-45% 0px -50% 0px' });
        $$('main section[id]').forEach(function (s) { spy.observe(s); });
      }
    })();
