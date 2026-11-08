// Testes automáticos do motor da calculadora. Rodar com: node test.js
var createCalc = require('./calc.js').createCalc;
var passed = 0, failed = 0;

function run(keys) {
  var c = createCalc();
  keys.split(' ').forEach(function (k) { c.press(k); });
  return c;
}
function expect(name, keys, value) {
  var c = run(keys);
  var x = c.state.stack[0];
  var ok = typeof value === 'string' ? c.display() === value : Math.abs(x - value) < 1e-9;
  if (ok) { passed++; console.log('  ok   ' + name); }
  else { failed++; console.log('  FALHOU ' + name + ' -> obtido ' + (typeof value === 'string' ? c.display() : x) + ', esperado ' + value); }
}

console.log('Testes da Calculadora RPN');
expect('3 ENTER 4 + = 7', '3 enter 4 add', 7);
expect('Digitação com vários dígitos e ponto', '1 2 . 5 enter 2 mul', 25);
expect('(3+4)×(5+6) = 77', '3 enter 4 add 5 enter 6 add mul', 77);
expect('Subtração usa Y − X', '1 0 enter 3 sub', 7);
expect('Divisão usa Y ÷ X', '1 enter 4 div', 0.25);
expect('Potência 2^10', '2 enter 1 0 pow', 1024);
expect('Raiz cúbica de 27 (f yˣ)', '2 7 enter 3 shift pow', 3);
expect('Raiz quadrada', '8 1 sqrt', 9);
expect('x² (f √x)', '1 2 shift sqrt', 144);
expect('1/x', '8 inv', 0.125);
expect('Fatorial 5! (f 1/x)', '5 shift inv', 120);
expect('sen 30° = 0,5', '3 0 sin', 0.5);
expect('arcsen 0,5 = 30°', '. 5 shift sin', 30);
expect('cos π em RAD = −1', 'shift rcl shift chs cos', -1);
expect('ln(e) = 1', '1 shift ln ln', 1);
expect('log 1000 = 3', '1 0 0 0 log', 3);
expect('EEX: 1,5 × 10³', '1 . 5 eex 3', 1500);
expect('EEX com expoente negativo', '2 eex 3 chs', 0.002);
expect('CHS troca o sinal', '5 chs', -5);
expect('ENTER desliga o lift: 5 ENTER 6 × = 30', '5 enter 6 mul', 30);
expect('ENTER duplica: 7 ENTER × = 49', '7 enter mul', 49);
expect('CLx não empurra a pilha', '9 enter 1 clx 2 add', 11);
expect('x⇄y', '1 enter 2 swap', 1);
expect('R↓ gira a pilha', '1 enter 2 enter 3 enter 4 rdown', 3);
expect('LASTx recupera o X anterior', '2 enter 3 add shift swap', 3);
expect('20% de 150 = 30', '1 5 0 enter 2 0 pct', 30);
expect('Δ% de 80 para 100 = 25', '8 0 enter 1 0 0 shift pct', 25);
expect('STO e RCL', '4 2 sto 1 clx rcl 1', 42);
expect('Resultado fica no topo e cadeia continua', '2 enter 3 mul 4 add', 10);
expect('Divisão por zero mostra Erro', '1 enter 0 div', 'Erro');
expect('Tecla após erro só limpa a mensagem', '1 enter 0 div 5', '0.0000');
expect('sen 180° = 0 exato', '1 8 0 sin', '0.0000');
expect('cos 90° = 0 exato', '9 0 cos', '0.0000');
expect('Formato FIX 2', 'shift sto 2 1 enter 3 div', '0.33');
expect('Backspace apaga um dígito', '1 2 3 back', 12);
expect('Número grande em notação científica', '1 eex 1 2', '1 12');
expect('Resultado grande formatado', '1 eex 1 2 enter 2 mul', '2.0000 12');

console.log('\n' + passed + ' passaram, ' + failed + ' falharam');
process.exit(failed ? 1 : 0);
