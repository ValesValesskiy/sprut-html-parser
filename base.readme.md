```
> npm i sprut-html-parser
```

# Sprut-html-parser

Простой html-парсер, средства обработки узлов и перевод узлов в строку.

---

Экспортируются `parseHTML`, `stringifyHTMLNode` и `nodeTreeHandler` для перебора узлов в дереве с возможностью выхода из обработки. `nodeTreeHandler` нужен для написания любых дополнительных инструментов для работы с деревом, например для функции выбора с помощью селектора.

---

<br>

## <span id="contents">Оглавление</span>

- [Использование parseHTML и stringifyHTMLNode](#parse-html)
- [Использование nodeTreeHandler](#node-tree-handler)
- [Тесты и результаты](#test-results)

<br>

## <span id="parse-html">Использование parseHTML:</span>

- [К оглавлению](#contents)

<br>

Функция `parseHTML` получает на вход стркоу и, опционально, состояние парсинга, с помощью которого можно продолжить ранее прерванный парсинг. Возвращает дерево узлов и последнее состояние парсинга.

Контекст `handler` и `find` - это внутренний пустой объект, который можно предзаполнить в стартовом обработчике или закинуть с данными предыдущего состояния.

Функция `parseHTML` возвращает `root` с узлами html и своё состояние парсинга.

<br>

Ниже будет приведён код парсинга и перевода в строку обратно кода `html`:

<br>

```js
import { parseHTML, stringifyHTMLNode } from 'sprut-html-parser';

const html = '<p attr="value" attr_2><a href="./link" />Some Text</p>';
const minify = (s) => s.replace(/\n/g, '').replace(/>\s{1,}/g, '>').replace(/\s{1,}</g, '<').replace(/\s+/g, ' ');
const { root } = parseHTML(html);

console.log(minify(stringifyHTMLNode({ node: root })));
// <p attr="value" attr_2><a href="./link" />Some Text</p>
```

<br>

## <span id="node-tree-handler">Использование nodeTreeHandler:</span>

- [К оглавлению](#contents)

<br>

`nodeTreeHandler` перебирает каждый узел в дереве и углубляется в дочерние узлы. В любой момент обход можно остановить из обработчика узла. По мере обхода можно выполнять какие-либо действия с узлами. Это можно использовать например для поиска. Для примера напишу функцию поиска по тегу.

<br>

```js
import { parseHTML, nodeTreeHandler } from 'sprut-html-parser';
import { AllNodes } from 'sprut-html-parser/types';

const html = '<p attr="value" attr_2><a href="./link" />Some Text</p>';
const { root } = parseHTML(html);

const getByTag = (tag: string, tree: AllNodes) => {
    let result = null;

    nodeTreeHandler(tree, (node, stop) => {
        if (node.type === 'html' && node.tag === tag) {
            result = node;
            stop();
        }
    });

    return result;
}

console.log(getByTag('a', root));
/*
<ref *1> {
  tag: 'a',
  children: [],
  attributes: [
    {
      name: 'href',
      value: './link',
      parent: [Circular *1],
      type: 'attribute'
    }
  ],
  parent: {
    tag: 'p',
    children: [ [Circular *1], [Object] ],
    attributes: [ [Object], [Object] ],
    parent: { type: 'root', root: true, children: [Array], parent: null },
    type: 'html'
  },
  type: 'html',
  isVoid: true
}
*/
```

<br>

## <span id="test-results">Тесты и результаты:</span>

- [К оглавлению](#contents)

<br>