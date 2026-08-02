(function () {
  'use strict';

  var DATA = window.PRESIDENTS;

  /* ---------- answer normalisation ---------------------------------------
   * Strict match, but only after case, spaces and punctuation are collapsed:
   *   "Dwight David Eisenhower" -> "dwightdavideisenhower"
   *   "2009 – 2017"             -> "20092017"
   * Generational suffixes are optional, so "James Earl Carter" is accepted
   * alongside "James Earl Carter Jr."
   */
  function norm(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function dropSuffix(key) {
    return key.replace(/(jr|sr|ii|iii|iv)$/, '');
  }

  function nameKeys(p) {
    var keys = [];
    [p.name, p.givenName].forEach(function (n) {
      if (!n) return;
      var k = norm(n);
      keys.push(k, dropSuffix(k));
    });
    return keys;
  }

  function yearKeys(p) {
    if (p.end !== null) return [norm(p.start + '' + p.end)];
    // Ongoing term: accept the open form or the scheduled end year.
    return [
      norm(p.start + 'present'),
      norm(p.start + ''),
      norm(p.start + '' + (p.start + 4))
    ];
  }

  function yearsText(p) {
    return p.start + '–' + (p.end === null ? 'present' : p.end);
  }

  /* ---------- the three pieces of data ----------------------------------- */

  var FIELDS = {
    no: {
      label: 'Number',
      placeholder: 'e.g. 44',
      inputmode: 'numeric',
      show: function (p) { return '#' + p.no; },
      check: function (p, v) { return norm(v) === norm(p.no); }
    },
    name: {
      label: 'Full name',
      placeholder: 'e.g. Barack Hussein Obama II',
      show: function (p) { return p.name; },
      check: function (p, v) {
        var k = norm(v), keys = nameKeys(p);
        return keys.indexOf(k) !== -1 || keys.indexOf(dropSuffix(k)) !== -1;
      }
    },
    years: {
      label: 'Years in office',
      placeholder: 'e.g. 2009-2017',
      inputmode: 'numeric',
      show: yearsText,
      check: function (p, v) { return yearKeys(p).indexOf(norm(v)) !== -1; }
    }
  };

  var ORDER = ['no', 'name', 'years'];

  var MODES = {
    no:    { title: 'Given the number', blurb: 'Every question shows a presidency number.' },
    name:  { title: 'Given the name',   blurb: 'Every question shows a full name.' },
    years: { title: 'Given the years',  blurb: 'Every question shows a term.' },
    mixed: { title: 'Mixed',            blurb: 'The given piece changes each question.' }
  };

  var MODE_KEYS = ['no', 'name', 'years', 'mixed'];

  /* ---------- number range ----------------------------------------------
   * Which presidency numbers are in play. Kept in localStorage so the choice
   * survives navigation, and mirrored into the quiz URL (#/quiz/mixed/1-20)
   * so a round is shareable and reloadable.
   */

  var NO_MIN = Math.min.apply(null, DATA.map(function (p) { return p.no; }));
  var NO_MAX = Math.max.apply(null, DATA.map(function (p) { return p.no; }));
  var STORE_KEY = 'usq.range';

  var PRESETS = [
    { label: 'All',      lo: NO_MIN, hi: NO_MAX },
    { label: 'Founding', lo: 1,      hi: 8      },
    { label: '19th c.',  lo: 6,      hi: 25     },
    { label: 'Modern',   lo: 32,     hi: NO_MAX }
  ];

  function clampNo(n) {
    n = Math.round(Number(n));
    if (!isFinite(n)) return NO_MIN;
    return Math.min(NO_MAX, Math.max(NO_MIN, n));
  }

  function makeRange(lo, hi) {
    lo = clampNo(lo);
    hi = clampNo(hi);
    return lo <= hi ? { lo: lo, hi: hi } : { lo: hi, hi: lo };
  }

  function parseRange(str) {
    var m = /^(\d+)-(\d+)$/.exec(str || '');
    return m ? makeRange(m[1], m[2]) : null;
  }

  function rangeSlug(r) { return r.lo + '-' + r.hi; }

  function rangeText(r) {
    return r.lo === NO_MIN && r.hi === NO_MAX
      ? 'All presidents'
      : '#' + r.lo + '–#' + r.hi;
  }

  function storedRange() {
    var saved;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) { saved = null; }
    return parseRange(saved) || { lo: NO_MIN, hi: NO_MAX };
  }

  function storeRange(r) {
    try { localStorage.setItem(STORE_KEY, rangeSlug(r)); } catch (e) { /* private mode */ }
  }

  function pool(r) {
    return DATA.filter(function (p) { return p.no >= r.lo && p.no <= r.hi; });
  }

  /* ---------- shell ------------------------------------------------------ */

  var view    = document.getElementById('view');
  var scoreEl = document.getElementById('score');
  var rightEl = document.getElementById('right');
  var askedEl = document.getElementById('asked');

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Cleveland and Trump each hold two presidency numbers. When the name is the
   * prompt, either term is a valid answer. */
  function candidates(rec, given) {
    if (given !== 'name') return [rec];
    return DATA.filter(function (p) { return p.name === rec.name; });
  }

  /* ---------- range picker ------------------------------------------------
   * Two overlaid range inputs make the twin-thumb control. The inputs ignore
   * pointer events except on their thumbs (see styles.css), so whichever thumb
   * is under the cursor is the one that moves.
   */

  function renderRangePicker(range, onChange) {
    var box = el('section', 'range');
    box.innerHTML =
      '<div class="range-head">' +
        '<span class="range-title">Presidents in play</span>' +
        '<span class="range-value"></span>' +
      '</div>' +
      '<div class="slider">' +
        '<div class="slider-rail"></div>' +
        '<div class="slider-fill"></div>' +
        '<input type="range" class="thumb lo" aria-label="Lowest presidency number">' +
        '<input type="range" class="thumb hi" aria-label="Highest presidency number">' +
      '</div>' +
      '<div class="presets"></div>' +
      '<p class="range-count"></p>';

    var lo    = box.querySelector('.lo');
    var hi    = box.querySelector('.hi');
    var fill  = box.querySelector('.slider-fill');
    var value = box.querySelector('.range-value');
    var count = box.querySelector('.range-count');

    [lo, hi].forEach(function (input) {
      input.min = NO_MIN;
      input.max = NO_MAX;
      input.step = 1;
    });

    var presets = box.querySelector('.presets');
    var chips = PRESETS.map(function (p) {
      var b = el('button', 'chip', p.label);
      b.type = 'button';
      b.addEventListener('click', function () { apply(makeRange(p.lo, p.hi), true); });
      presets.appendChild(b);
      return b;
    });

    function paint() {
      var span = NO_MAX - NO_MIN;
      var a = (range.lo - NO_MIN) / span * 100;
      var b = (range.hi - NO_MIN) / span * 100;
      fill.style.left = a + '%';
      fill.style.right = (100 - b) + '%';

      // With both thumbs parked at the top, the upper input would swallow every
      // grab; lifting the lower one keeps it reachable.
      lo.style.zIndex = range.lo === NO_MAX ? 5 : 3;

      var list = pool(range);
      value.textContent = rangeText(range);
      count.textContent = list.length + (list.length === 1 ? ' term' : ' terms') +
        ' — ' + list[0].name + ' to ' + list[list.length - 1].name;

      chips.forEach(function (b, i) {
        var p = PRESETS[i];
        b.classList.toggle('on', p.lo === range.lo && p.hi === range.hi);
      });
    }

    function apply(next, syncInputs) {
      range = next;
      if (syncInputs) { lo.value = range.lo; hi.value = range.hi; }
      paint();
      onChange(range);
    }

    // Thumbs may be dragged past one another; the pair is re-sorted on release.
    lo.addEventListener('input', function () {
      apply({ lo: Math.min(clampNo(lo.value), range.hi), hi: range.hi }, false);
    });
    hi.addEventListener('input', function () {
      apply({ lo: range.lo, hi: Math.max(clampNo(hi.value), range.lo) }, false);
    });
    [lo, hi].forEach(function (input) {
      input.addEventListener('change', function () { lo.value = range.lo; hi.value = range.hi; });
    });

    lo.value = range.lo;
    hi.value = range.hi;
    paint();
    return box;
  }

  /* ---------- menu ------------------------------------------------------- */

  function renderMenu() {
    scoreEl.hidden = true;
    view.innerHTML = '';

    var range = storedRange();

    var intro = el('p', 'lede',
      'Every round gives you one piece of a presidency and asks for the other two. ' +
      'Questions keep coming until you stop.');
    view.appendChild(intro);

    var grid = el('div', 'modes');
    var links = MODE_KEYS.map(function (key) {
      var m = MODES[key];
      var a = el('a', 'mode');
      a.href = '#/quiz/' + key + '/' + rangeSlug(range);
      a.innerHTML =
        '<span class="mode-title">' + m.title + '</span>' +
        '<span class="mode-blurb">' + m.blurb + '</span>';
      grid.appendChild(a);
      return a;
    });

    view.appendChild(renderRangePicker(range, function (next) {
      range = next;
      storeRange(range);
      links.forEach(function (a, i) {
        a.href = '#/quiz/' + MODE_KEYS[i] + '/' + rangeSlug(range);
      });
    }));

    view.appendChild(grid);

    var browse = el('a', 'browse', 'Browse all ' + DATA.length + ' terms →');
    browse.href = '#/list';
    view.appendChild(browse);
  }

  /* ---------- list ------------------------------------------------------- */

  function renderList() {
    scoreEl.hidden = true;
    view.innerHTML = '';

    view.appendChild(el('p', 'lede',
      DATA.length + ' terms, ' + new Set(DATA.map(function (p) { return p.name; })).size +
      ' people. Cleveland and Trump each appear twice — nonconsecutive terms get ' +
      'separate numbers.'));

    var ul = el('ul', 'rows');
    DATA.forEach(function (p) {
      var li = el('li', 'row');
      li.innerHTML =
        '<span class="row-no">' + p.no + '</span>' +
        '<span class="row-name">' + p.name +
          (p.givenName ? '<span class="row-given">born ' + p.givenName + '</span>' : '') +
        '</span>' +
        '<span class="row-years">' + yearsText(p) + '</span>';
      ul.appendChild(li);
    });
    view.appendChild(ul);

    var back = el('a', 'browse', '← Back to modes');
    back.href = '#/';
    view.appendChild(back);
  }

  /* ---------- quiz ------------------------------------------------------- */

  function renderQuiz(mode, range) {
    var picks = pool(range);
    var deck = [];
    var asked = 0, right = 0;
    var current = null;

    scoreEl.hidden = false;
    rightEl.textContent = '0';
    askedEl.textContent = '0';

    view.innerHTML = '';
    view.appendChild(el('p', 'mode-tag',
      MODES[mode].title + ' <span class="tag-range">' + rangeText(range) + '</span>'));

    var card = el('section', 'card');
    card.innerHTML =
      '<p class="given-label"></p>' +
      '<p class="given-value"></p>' +
      '<form class="fields" autocomplete="off" novalidate></form>' +
      '<div class="reveal" hidden></div>' +
      '<div class="actions">' +
        '<button type="submit" class="btn primary check">Check</button>' +
        '<button type="button" class="btn primary next" hidden>Next question</button>' +
      '</div>';
    view.appendChild(card);

    view.appendChild(el('p', 'hint',
      'Full names only — birth names accepted where they differ.'));

    var back = el('a', 'browse', '← Back to modes');
    back.href = '#/';
    view.appendChild(back);

    var q = {
      label:  card.querySelector('.given-label'),
      value:  card.querySelector('.given-value'),
      form:   card.querySelector('.fields'),
      reveal: card.querySelector('.reveal'),
      check:  card.querySelector('.check'),
      next:   card.querySelector('.next')
    };

    // The submit button lives outside the form element, so wire it directly.
    q.check.addEventListener('click', function (e) { e.preventDefault(); grade(); });
    q.form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!q.check.hidden) grade();
    });
    q.next.addEventListener('click', nextQuestion);

    function draw() {
      if (!deck.length) deck = shuffle(picks);
      return deck.pop();
    }

    function nextQuestion() {
      var rec = draw();
      var given = mode === 'mixed'
        ? ORDER[Math.floor(Math.random() * ORDER.length)]
        : mode;

      current = {
        rec: rec,
        given: given,
        answers: ORDER.filter(function (f) { return f !== given; })
      };

      q.label.textContent = FIELDS[given].label;
      q.value.textContent = FIELDS[given].show(rec);
      q.value.classList.toggle('numeric', given !== 'name');

      q.form.innerHTML = '';
      current.answers.forEach(function (f, i) {
        var spec = FIELDS[f];
        var wrap = el('label', 'field');
        wrap.innerHTML =
          '<span class="field-label">' + spec.label + '</span>' +
          '<input type="text" name="' + f + '" placeholder="' + spec.placeholder + '"' +
          (spec.inputmode ? ' inputmode="' + spec.inputmode + '"' : '') + '>';
        q.form.appendChild(wrap);
        if (i === 0) wrap.querySelector('input').focus();
      });

      q.reveal.hidden = true;
      q.reveal.className = 'reveal';
      q.reveal.innerHTML = '';
      q.check.hidden = false;
      q.next.hidden = true;
    }

    function grade() {
      var inputs = {};
      current.answers.forEach(function (f) {
        inputs[f] = q.form.elements[f].value.trim();
      });

      // Score every candidate term, keep the best fit.
      var best = null;
      candidates(current.rec, current.given).forEach(function (p) {
        var marks = {}, hits = 0;
        current.answers.forEach(function (f) {
          marks[f] = inputs[f] !== '' && FIELDS[f].check(p, inputs[f]);
          if (marks[f]) hits++;
        });
        if (!best || hits > best.hits) best = { rec: p, marks: marks, hits: hits };
      });

      var allRight = best.hits === current.answers.length;
      asked++;
      if (allRight) right++;
      askedEl.textContent = asked;
      rightEl.textContent = right;

      current.answers.forEach(function (f) {
        var input = q.form.elements[f];
        input.readOnly = true;
        input.parentNode.classList.add(best.marks[f] ? 'ok' : 'bad');
      });

      var lines = candidates(current.rec, current.given).map(function (p) {
        return '<li><span class="rv-no">#' + p.no + '</span>' +
               '<span class="rv-name">' + p.name + '</span>' +
               '<span class="rv-years">' + yearsText(p) + '</span></li>';
      }).join('');

      q.reveal.className = 'reveal ' + (allRight ? 'ok' : 'bad');
      q.reveal.innerHTML =
        '<p class="verdict">' + (allRight ? 'Correct' : 'Not quite') + '</p>' +
        '<ul class="terms">' + lines + '</ul>' +
        (current.rec.givenName
          ? '<p class="born">Born <strong>' + current.rec.givenName + '</strong> — ' +
            'either full name is accepted.</p>'
          : '');
      q.reveal.hidden = false;

      q.check.hidden = true;
      q.next.hidden = false;
      q.next.focus();
    }

    nextQuestion();
  }

  /* ---------- routing ---------------------------------------------------- */

  function route() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    window.scrollTo(0, 0);

    if (parts[0] === 'quiz' && MODES[parts[1]]) {
      var range = parseRange(parts[2]) || storedRange();
      storeRange(range);
      return renderQuiz(parts[1], range);
    }
    if (parts[0] === 'list') return renderList();
    renderMenu();
  }

  window.addEventListener('hashchange', route);
  route();
})();
