# KEALEX — Design System e Paleta de Cores

> Versão 1.0 · Referência visual para o site institucional e o sistema jurídico KEALEX.
> **Status:** proposta de identidade visual baseada no logotipo fornecido; valores HEX sugeridos, não extraídos com precisão colorimétrica.

## 1. Princípios da marca

A interface deve comunicar **segurança jurídica, credibilidade, clareza, inovação e sofisticação**. O azul-marinho é a base institucional; o azul-petróleo é a cor de interação; o verde sinaliza evolução e sucesso; o laranja destaca ações pontuais. Use fundos claros e bastante espaço em branco.

## 2. Paleta principal

| Token | Nome | HEX | Uso recomendado |
|---|---|---|---|
| `brand.primary` | Azul institucional | `#102B46` | Sidebar, cabeçalho, botões principais |
| `brand.secondary` | Azul tecnológico | `#087E96` | Links, seleção, ícones e ações secundárias |
| `brand.green` | Verde inovação | `#20B987` | Destaques de progresso, gráficos e identidade |
| `brand.orange` | Laranja energia | `#F58220` | Destaques comerciais, avisos e CTA pontual |
| `brand.silver` | Prata digital | `#A7B3C5` | Elementos decorativos e detalhes |
| `brand.ice` | Branco gelo | `#F5F8FC` | Fundo principal |

## 3. Cores semânticas e neutras

| Token | HEX | Aplicação |
|---|---|---|
| `surface.default` | `#FFFFFF` | Cards, modais e campos |
| `surface.page` | `#F5F8FC` | Fundo de páginas |
| `text.primary` | `#1E293B` | Texto principal |
| `text.secondary` | `#64748B` | Legendas e descrições |
| `border.default` | `#E2E8F0` | Bordas e separadores |
| `state.success` | `#16835F` | Texto e ícones de sucesso |
| `state.warning` | `#B85A08` | Texto e ícones de atenção |
| `state.danger` | `#DC3545` | Erros e exclusão |
| `state.info` | `#087E96` | Informações e links |
| `focus.ring` | `#087E96` | Contorno de foco de teclado |

**Acessibilidade:** em fundos brancos, use `#16835F` para texto de sucesso e `#B85A08` para texto de alerta, em vez dos tons vibrantes da marca. Verifique contraste WCAG AA (4,5:1 para texto normal; 3:1 para texto grande e componentes relevantes). Nunca use cor como único indicador de status.

## 4. Regras de aplicação

- **Sidebar:** fundo `brand.primary`; textos brancos; item ativo com `brand.secondary` e indicador visual adicional.
- **Header:** fundo branco ou `brand.primary`, conforme a área; mantenha consistência por produto.
- **Botão primário:** fundo `brand.primary`, texto branco; hover em azul mais escuro `#0B2035`.
- **Botão secundário:** fundo `brand.secondary`, texto branco; hover `#06677C`.
- **Botão de destaque:** laranja `brand.orange`, preferencialmente com texto `#102B46` e contraste validado.
- **Cards:** fundo branco, borda sutil, raio 12px e sombra discreta.
- **Links:** `brand.secondary`; acrescentar sublinhado quando necessário para distinguir de texto comum.
- **Indicadores:** verde para sucesso, laranja para atenção, vermelho para erro; acompanhar com texto/ícone.
- **Gráficos:** usar cores da marca, com legendas e padrões ou rótulos para acessibilidade.
- **Formulários:** fundo branco, borda `border.default`, foco `focus.ring` visível.
- **Densidade:** priorizar leitura de tabelas jurídicas, processos, prazos, documentos e agendas.

## 5. Tokens CSS prontos para uso

```css
:root {
  /* Marca */
  --kealex-primary: #102B46;
  --kealex-secondary: #087E96;
  --kealex-green: #20B987;
  --kealex-orange: #F58220;
  --kealex-silver: #A7B3C5;

  /* Superfícies e tipografia */
  --background: #F5F8FC;
  --surface: #FFFFFF;
  --text-primary: #1E293B;
  --text-secondary: #64748B;
  --border: #E2E8F0;

  /* Estados */
  --success: #16835F;
  --warning: #B85A08;
  --danger: #DC3545;
  --info: #087E96;
  --focus-ring: #087E96;

  /* Interações */
  --button-primary-hover: #0B2035;
  --button-secondary-hover: #06677C;

  /* Gradientes decorativos */
  --gradient-primary: linear-gradient(135deg, #102B46, #087E96);
  --gradient-innovation: linear-gradient(135deg, #087E96, #20B987);

  /* Forma e elevação */
  --radius-card: 12px;
  --radius-button: 8px;
  --shadow-card: 0 4px 20px rgba(16, 43, 70, 0.08);
}
```

## 6. Exemplos de componentes

```css
body { background: var(--background); color: var(--text-primary); }
.sidebar { background: var(--kealex-primary); color: #fff; }
.sidebar .active { background: var(--kealex-secondary); }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-card); box-shadow: var(--shadow-card); }
.btn-primary { background: var(--kealex-primary); color: #fff; border-radius: var(--radius-button); }
.btn-primary:hover { background: var(--button-primary-hover); }
.btn-secondary { background: var(--kealex-secondary); color: #fff; border-radius: var(--radius-button); }
.btn-secondary:hover { background: var(--button-secondary-hover); }
:where(button, a, input, select, textarea):focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
```

## 7. Recomendações para implementação

1. Centralizar tokens em um arquivo CSS global, evitando cores HEX espalhadas nos componentes.
2. Utilizar os nomes semânticos (`--success`, `--border`, etc.) nas telas e os tokens de marca para branding.
3. Validar contraste real em botões, badges, links, tabelas e estados de foco antes da publicação.
4. Manter a identidade consistente entre home institucional, login, dashboard, gestão de processos e agenda jurídica.
5. Tratar a paleta acima como **tema claro oficial proposto**. Criar tokens próprios para um eventual tema escuro, sem inverter cores automaticamente.
6. Preservar o logotipo original; não recriar ou recolorir o arquivo sem uma versão vetorial autorizada.

## 8. Checklist de aceite visual

- [ ] Sidebar e navegação usam azul institucional.
- [ ] Botões seguem hierarquia primário/secundário/destaque.
- [ ] Cards e formulários usam neutros consistentes.
- [ ] Mensagens de sucesso, atenção e erro incluem texto ou ícone.
- [ ] Contraste e foco de teclado foram verificados.
- [ ] Gráficos, tabelas e badges têm legendas compreensíveis.
- [ ] As cores são consumidas de tokens globais.
