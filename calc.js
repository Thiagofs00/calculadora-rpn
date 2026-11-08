/*
 * Motor da Calculadora RPN.
 * Pilha de 4 níveis (X, Y, Z, T), com "stack lift" no estilo das calculadoras RPN clássicas.
 * Lógica escrita do zero, tomando como referência o comportamento documentado no
 * simulador HP-15C de Greg Hewgill (https://github.com/ghewgill/hp15c, licença zlib).
 * Não contém código copiado desse projeto.
 */
(function (root) {
  'use strict';

  function createCalc(saved) {
    var s = {
      stack: [0, 0, 0, 0], // [X, Y, Z, T]
      lastX: 0,
      lift: true,          // se o próximo número digitado empurra a pilha
      entry: null,         // texto sendo digitado, ou null
      regs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      angle: 'DEG',
      fix: 4,
      shift: false,
      pending: null,       // 'STO' | 'RCL' | 'FIX' aguardando um dígito
      error: null
    };
    if (saved) {
      ['stack', 'lastX', 'regs', 'angle', 'fix'].forEach(function (k) {
        if (saved[k] !== undefined) s[k] = saved[k];
      });
    }

    var X = function () { return s.stack[0]; };

    function push(v) {
      s.stack = [v, s.stack[0], s.stack[1], s.stack[2]];
    }
    function liftIfEnabled() {
      if (s.lift) push(s.stack[0]);
    }
    function endEntry() { s.entry = null; }

    function check(v) {
      if (typeof v !== 'number' || !isFinite(v)) throw new Error('Erro');
      return v;
    }
    function trig(f) { // elimina resíduos como sen(180°) = 1,2e-16
      return function (x) { var r = f(toRad(x)); return Math.abs(r) < 1e-12 ? 0 : r; };
    }
    function toRad(v) { return s.angle === 'DEG' ? v * Math.PI / 180 : v; }
    function fromRad(v) { return s.angle === 'DEG' ? v * 180 / Math.PI : v; }

    function unary(f) {
      endEntry();
      var r = check(f(X()));
      s.lastX = X();
      s.stack[0] = r;
      s.lift = true;
    }
    function binary(f) {
      endEntry();
      var r = check(f(s.stack[1], s.stack[0]));
      s.lastX = X();
      s.stack = [r, s.stack[2], s.stack[3], s.stack[3]];
      s.lift = true;
    }
    function pushValue(v) {
      endEntry();
      liftIfEnabled();
      s.stack[0] = v;
      s.lift = true;
    }

    function factorial(n) {
      if (n < 0 || n !== Math.floor(n) || n > 170) return NaN;
      var r = 1;
      for (var i = 2; i <= n; i++) r *= i;
      return r;
    }

    function setEntry(text) {
      s.entry = text;
      var t = text;
      if (t === '' || t === '-') t = '0';
      if (/e-?$/.test(t)) t = t.replace(/e-?$/, '');
      if (t.charAt(0) === '.') t = '0' + t;
      t = t.replace('-.', '-0.');
      s.stack[0] = parseFloat(t) || 0;
    }

    function digit(d) {
      if (s.entry === null) {
        liftIfEnabled();
        s.lift = true;
        setEntry('');
      }
      var e = s.entry;
      if (d === '.') {
        if (e.indexOf('.') >= 0 || e.indexOf('e') >= 0) return;
      } else if (e.indexOf('e') >= 0) {
        var exp = e.split('e')[1].replace('-', '');
        if (exp.length >= 2) return;
      } else if (e.replace(/[-.]/g, '').length >= 10) {
        return;
      }
      setEntry(e + d);
    }

    var ops = {
      enter: function () { endEntry(); push(X()); s.lift = false; },
      clx: function () { endEntry(); s.stack[0] = 0; s.lift = false; },
      back: function () {
        if (s.entry === null) return ops.clx();
        var e = s.entry.slice(0, -1);
        if (e === '' || e === '-') { s.entry = null; s.stack[0] = 0; s.lift = false; }
        else setEntry(e);
      },
      clearAll: function () {
        s.stack = [0, 0, 0, 0]; s.lastX = 0; s.entry = null; s.lift = true;
      },
      eex: function () {
        if (s.entry === null) { digit('1'); }
        if (s.entry.indexOf('e') < 0) setEntry(s.entry + 'e');
      },
      chs: function () {
        if (s.entry !== null) {
          var e = s.entry;
          var i = e.indexOf('e');
          if (i >= 0) {
            e = e.charAt(i + 1) === '-' ? e.slice(0, i + 1) + e.slice(i + 2)
                                        : e.slice(0, i + 1) + '-' + e.slice(i + 1);
          } else {
            e = e.charAt(0) === '-' ? e.slice(1) : '-' + e;
          }
          setEntry(e);
        } else {
          s.stack[0] = -X();
        }
      },
      add: function () { binary(function (y, x) { return y + x; }); },
      sub: function () { binary(function (y, x) { return y - x; }); },
      mul: function () { binary(function (y, x) { return y * x; }); },
      div: function () { binary(function (y, x) { return x === 0 ? NaN : y / x; }); },
      pow: function () { binary(function (y, x) { return Math.pow(y, x); }); },
      root: function () { binary(function (y, x) { return x === 0 ? NaN : Math.pow(y, 1 / x); }); },
      sqrt: function () { unary(function (x) { return x < 0 ? NaN : Math.sqrt(x); }); },
      sq: function () { unary(function (x) { return x * x; }); },
      inv: function () { unary(function (x) { return x === 0 ? NaN : 1 / x; }); },
      fact: function () { unary(factorial); },
      ln: function () { unary(function (x) { return x <= 0 ? NaN : Math.log(x); }); },
      exp: function () { unary(Math.exp); },
      log: function () { unary(function (x) { return x <= 0 ? NaN : Math.log10(x); }); },
      tenx: function () { unary(function (x) { return Math.pow(10, x); }); },
      sin: function () { unary(trig(Math.sin)); },
      cos: function () { unary(trig(Math.cos)); },
      tan: function () { unary(trig(Math.tan)); },
      asin: function () { unary(function (x) { return Math.abs(x) > 1 ? NaN : fromRad(Math.asin(x)); }); },
      acos: function () { unary(function (x) { return Math.abs(x) > 1 ? NaN : fromRad(Math.acos(x)); }); },
      atan: function () { unary(function (x) { return fromRad(Math.atan(x)); }); },
      pct: function () { // Y fica, X vira X% de Y
        endEntry();
        var r = check(s.stack[1] * X() / 100);
        s.lastX = X(); s.stack[0] = r; s.lift = true;
      },
      dpct: function () { // variação percentual de Y para X
        endEntry();
        var y = s.stack[1];
        var r = check(y === 0 ? NaN : 100 * (X() - y) / y);
        s.lastX = X(); s.stack[0] = r; s.lift = true;
      },
      rdown: function () { endEntry(); var t = s.stack; s.stack = [t[1], t[2], t[3], t[0]]; s.lift = true; },
      rup: function () { endEntry(); var t = s.stack; s.stack = [t[3], t[0], t[1], t[2]]; s.lift = true; },
      swap: function () { endEntry(); var t = s.stack; s.stack = [t[1], t[0], t[2], t[3]]; s.lift = true; },
      lastx: function () { pushValue(s.lastX); },
      pi: function () { pushValue(Math.PI); },
      sto: function () { endEntry(); s.pending = 'STO'; },
      rcl: function () { endEntry(); s.pending = 'RCL'; },
      fixmode: function () { endEntry(); s.pending = 'FIX'; },
      angle: function () { s.angle = s.angle === 'DEG' ? 'RAD' : 'DEG'; }
    };

    function press(key) {
      if (s.error) { // qualquer tecla apenas limpa a mensagem de erro
        s.error = null; s.shift = false; s.pending = null;
        return;
      }
      if (key === 'shift') { s.shift = !s.shift; return; }

      if (s.pending) {
        var p = s.pending;
        s.pending = null;
        s.shift = false;
        if (/^[0-9]$/.test(key)) {
          var n = +key;
          if (p === 'STO') { s.regs[n] = X(); s.lift = true; }
          else if (p === 'RCL') { pushValue(s.regs[n]); }
          else if (p === 'FIX') { s.fix = n; }
        }
        return; // outra tecla cancela a operação pendente
      }

      var shifted = s.shift;
      s.shift = false;
      var name = shifted ? SHIFT_MAP[key] : key;
      if (!name) return;
      try {
        if (/^[0-9.]$/.test(name)) digit(name);
        else if (ops[name]) ops[name]();
      } catch (err) {
        s.entry = null;
        s.error = 'Erro';
      }
    }

    function format(v) {
      if (v === 0) return (0).toFixed(s.fix);
      var a = Math.abs(v);
      if (a >= 1e10 || a < Math.pow(10, -s.fix) / 2) {
        var t = v.toExponential(Math.max(s.fix, 2));
        var parts = t.split('e');
        var ex = parseInt(parts[1], 10);
        return parts[0] + ' ' + (ex < 0 ? '-' : '') + ('0' + Math.abs(ex)).slice(-2);
      }
      return v.toFixed(s.fix);
    }

    function display() {
      if (s.error) return s.error;
      if (s.entry !== null) {
        var e = s.entry === '' ? '0' : s.entry;
        if (e.indexOf('e') >= 0) {
          var parts = e.split('e');
          var ex = parts[1];
          var neg = ex.charAt(0) === '-';
          ex = ex.replace('-', '');
          return (parts[0] || '1') + ' ' + (neg ? '-' : '') + ('00' + ex).slice(-2);
        }
        return e;
      }
      return format(X());
    }

    function save() {
      return { stack: s.stack.slice(), lastX: s.lastX, regs: s.regs.slice(), angle: s.angle, fix: s.fix };
    }

    return { press: press, state: s, display: display, format: format, save: save };
  }

  // Funções que cada tecla executa quando a tecla "f" (shift) está ativa
  var SHIFT_MAP = {
    sqrt: 'sq', pow: 'root', inv: 'fact', pct: 'dpct',
    sin: 'asin', cos: 'acos', tan: 'atan', ln: 'exp', log: 'tenx',
    sto: 'fixmode', rcl: 'angle', rdown: 'rup', swap: 'lastx', chs: 'pi',
    clx: 'clearAll', enter: 'enter', eex: 'eex', back: 'back',
    add: 'add', sub: 'sub', mul: 'mul', div: 'div',
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '.': '.'
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = { createCalc: createCalc };
  else root.createCalc = createCalc;
})(this);
