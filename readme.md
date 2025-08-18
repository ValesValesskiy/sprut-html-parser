```
> npm i sprut-html-parser
```

# Sprut-html-parser

Простой html-парсер, средства обработки узлов и перевод узлов в строку.

---

Экспортируются `htmlParser`, `stringifyHTMLNode` и `nodeTreeHandler` для перебора узлов в дереве с возможностью выхода из обработки. `nodeTreeHandler` нужен для написания любых дополнительных инструментов для работы с деревом, например для функции выбора с помощью селектора.

---

<br>

## <span id="contents">Оглавление</span>

- [Использование htmlParser и stringifyHTMLNode](#html-parser)
- [Использование nodeTreeHandler](#node-tree-handler)
- [Тесты и результаты](#test-results)

<br>

## <span id="html-parser">Использование htmlParser:</span>

- [К оглавлению](#contents)

<br>

Функция `htmlParser` получает на вход стркоу и, опционально, состояние парсинга, с помощью которого можно продолжить ранее прерванный парсинг. Возвращает дерево узлов и последнее состояние парсинга.

Контекст `handler` и `find` - это внутренний пустой объект, который можно предзаполнить в стартовом обработчике или закинуть с данными предыдущего состояния.
Возвращает функция парсинга тот самый объект данных и своё состояние парсинга.

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

Так можно обрабатывать различные этапы парсинга и возвращать из `find` то, что искать в строке дальше.

<br>

## <span id="node-tree-handler">Использование nodeTreeHandler:</span>

- [К оглавлению](#contents)

<br>

`nodeTreeHandler` перебирает каждый узел в дереве и углубляется в дочерние узлы. В любой момент обход можно остановить из обработчика узла. По мере обхода можно выполнять какие-либо действия с узлами, изменять оригинальные нузлы не стоит. Это можно использовать например для поиска. Для примера напишу функцию поиска по тегу.

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

<br>Перевод строки `html` в дерево и обратно в строку с удалением пробелов, проверка на эквивалентность:

```js
Результат для строки html `<!DOCTYPE html>`: "<!DOCTYPE html>"
Время выполнения: 0мс
```
```js
Результат для строки html `<p attr="value" attr_2><a href="./link" />Some Text</p>`: "<p attr="value" attr_2><a href="./link" />Some Text</p>"
Время выполнения: 1мс
```
```js
Результат для строки html `<div><p>Some Text</p></div>`: "<div><p>Some Text</p></div>"
Время выполнения: 0мс
```
```js
Результат для строки html `<!DOCTYPE html><div><p>Some Text</p></div>`: "<!DOCTYPE html><div><p>Some Text</p></div>"
Время выполнения: 0мс
```
```js
Результат для строки html `<!DOCTYPE html><div><!-- Comment --></div>`: "<!DOCTYPE html><div><!-- Comment --></div>"
Время выполнения: 0мс
```
```js
Результат для строки html `<style>
	.selector {color: red;}
</style>
`: "<style>
	.selector {color: red;}
</style>
"
Время выполнения: 0мс
```


<br>



<br>

