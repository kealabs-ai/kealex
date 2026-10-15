# Identidade Visual Kealex

Este documento registra os padrões visuais do produto a partir do logotipo oficial e da interface atual. O arquivo de referência é `src/assets/logotipo_kealex.png`.

## Marca

O logotipo combina o nome **KEALEX** com um símbolo jurídico formado por elementos de coluna/balança e formas curvas. A marca comunica tecnologia jurídica, confiança e modernidade.

- Preserve proporções, contornos, cores e transparência do arquivo original.
- Não redesenhe, distorça, rotacione, aplique sombras ou substitua as cores do logotipo.
- Mantenha espaço livre ao redor da marca; como referência, use ao menos a altura do símbolo.
- Evite reduzir a ponto de perder a leitura do nome ou os detalhes do símbolo.
- Use o texto alternativo `Kealex` quando o logotipo for uma imagem informativa.
- Em fundos escuros, escolha uma versão de alto contraste. O app atualmente aplica inversão visual do logo na sidebar em modo escuro; valide o resultado em telas reais para preservar legibilidade e não exporte a versão invertida como novo arquivo da marca.

## Paleta

As cores abaixo são os tokens de marca definidos em `src/index.css`. O Navy e o Teal são as cores principais da interface; laranja é um acento pontual presente na marca.

| Token | Hex | Uso recomendado |
| --- | --- | --- |
| Kealex Navy | `#081B33` | Sidebar, títulos, texto de alta ênfase e ações principais |
| Kealex Teal | `#00C2A8` | Destaques, estados ativos, foco e interação principal |
| Kealex Orange | `#F96313` | Acentos pontuais; não usar como cor dominante nem para grandes áreas de texto |
| Kealex Slate | `#596B82` | Texto secundário, ícones e elementos de apoio |
| Fundo claro | `#F8FAFC` | Fundo padrão do app no tema claro |
| Branco | `#FFFFFF` | Cards, modais e superfícies sobre o fundo claro |
| Fundo escuro | `#070514` | Superfícies principais no tema escuro |

Use cores semânticas (sucesso, alerta, erro e informação) para comunicar estados funcionais. Não substitua essas cores por cores de marca quando isso prejudicar o significado ou o contraste.

## Tipografia

- A família sans-serif de interface definida no tema é `Plus Jakarta Sans`, com fallback para `Inter`, `system-ui` e `sans-serif`.
- Reserve pesos mais fortes para títulos, rótulos de seção e ações; use pesos regulares para leitura contínua.
- Mantenha hierarquia clara entre título da página, título de seção, texto auxiliar e metadados.
- Evite textos longos em caixa alta e não use tipografia decorativa que concorra com o logotipo.

## Interface e componentes

- A interface deve permanecer limpa, profissional e legível, adequada a um produto jurídico SaaS.
- Use Navy em áreas estruturais e Teal para indicar seleção, foco e ações de destaque. Preserve superfícies claras e espaçamento consistente no tema claro.
- Componentes seguem cantos arredondados, bordas discretas e elevação sutil; não acumule sombras, gradientes ou efeitos decorativos.
- Animações devem ser breves e funcionais, reforçando navegação e feedback sem atrasar tarefas.
- Mantenha suporte aos temas claro e escuro. Verifique contraste de texto, foco visível e estados interativos em ambos.
- Use ícones da biblioteca Lucide React de forma consistente; evite misturar estilos de ícones no mesmo contexto.

## Aplicação da marca

- Reutilize `src/assets/logotipo_kealex.png` em vez de criar cópias ou versões improvisadas.
- O logotipo pode aparecer na navegação e em pontos institucionais, mantendo área de respiro e proporção original.
- Em favicon, avatar ou espaços muito pequenos, prefira uma versão oficial do símbolo isolado, caso exista. Não recorte o arquivo principal sem validar o resultado.
- Não use o Teal ou o laranja como substitutos universais para contraste; valide contraste e legibilidade para cada combinação.

## Referências no código

- Tokens de cor e tipografia: `src/index.css`.
- Logotipo: `src/assets/logotipo_kealex.png`.
- Aplicação do logo e tema na navegação: `src/components/Sidebar.tsx`.
