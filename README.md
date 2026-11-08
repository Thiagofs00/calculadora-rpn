# Calculadora RPN

Calculadora científica em notação polonesa reversa (RPN), com pilha de 4 níveis (X, Y, Z, T).
Funciona no navegador, sem internet, e pode ser instalada como app no celular e no computador.

**Abrir:** https://thiagofs00.github.io/calculadora-rpn/

## Como usar RPN
Digite o primeiro número, aperte **ENTER**, digite o segundo e aperte a operação.

| Conta | Teclas |
|---|---|
| 3 + 4 | `3` `ENTER` `4` `+` |
| (3 + 4) × (5 + 6) | `3` `ENTER` `4` `+` `5` `ENTER` `6` `+` `×` |
| 2¹⁰ | `2` `ENTER` `10` `yˣ` |
| sen 30° | `30` `SIN` |

A tecla laranja **f** ativa a função escrita acima de cada tecla.

## Instalar no computador com atalho de teclado (Windows)
1. Abra o link no Chrome ou Edge e clique no ícone **Instalar** na barra de endereço.
   Instalada, a calculadora abre numa janela própria, já no tamanho exato dela.
2. Abra o menu Iniciar, procure **Calculadora RPN**, clique com o botão direito e escolha
   **Abrir local do arquivo**.
3. Clique com o botão direito no atalho **Calculadora RPN** → **Propriedades**.
4. Clique no campo **Tecla de atalho** e aperte a letra desejada, por exemplo **R**.
   O Windows completa sozinho para **Ctrl + Alt + R**. Clique em **OK**.

Pronto: **Ctrl + Alt + R** abre a calculadora de qualquer lugar.

## Arquivos
- `calc.js`: motor de cálculo (pilha, operações, formatação)
- `index.html`: tela e teclado
- `manifest.webmanifest`, `sw.js`, ícones: permitem instalar o app e usar offline
- `test.js`: testes automáticos (`node test.js`)

## Créditos
O comportamento da pilha RPN foi estudado no simulador HP-15C de Greg Hewgill
(https://github.com/ghewgill/hp15c, licença zlib). O código deste projeto foi escrito do zero.
Projeto independente, sem vínculo com a HP.
