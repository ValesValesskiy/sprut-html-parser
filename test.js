const { getResults, test } = require('./utils/test');
const { parseHTML, stringifyHTMLNode, nodeTreeHandler } = require('./dist');

const minify = (s) => s.replace(/\n/g, '').replace(/>\s{1,}/g, '>').replace(/\s{1,}</g, '<').replace(/\s+/g, ' ');

const parseAndStringifyBlock = 'Перевод строки \`html\` в дерево и обратно в строку с удалением пробелов, проверка на эквивалентность:';
const reusltForHTML = 'Результат для строки html \`$1\`:';

const parseStringifyCallback = (str) => {
    const { root } = parseHTML(str);

    return minify(stringifyHTMLNode({ node: root }));
};

let html = '<!DOCTYPE html>';

test(
    parseAndStringifyBlock,
    reusltForHTML,
    minify(html),
    parseStringifyCallback,
    minify(html)
);

html = '<p attr="value" attr_2><a href="./link" />Some Text</p>';

test(
    parseAndStringifyBlock,
    reusltForHTML,
    minify(html),
    parseStringifyCallback,
    minify(html)
);

html = '<div><p>Some Text</p></div>';

test(
    parseAndStringifyBlock,
    reusltForHTML,
    minify(html),
    parseStringifyCallback,
    minify(html)
);

html = '<!DOCTYPE html><div><p>Some Text</p></div>';

test(
    parseAndStringifyBlock,
    reusltForHTML,
    minify(html),
    parseStringifyCallback,
    minify(html)
);

html = '<!DOCTYPE html><div><!-- Comment --></div>';

test(
    parseAndStringifyBlock,
    reusltForHTML,
    minify(html),
    parseStringifyCallback,
    minify(html)
);

html = '<style>\n\t.selector {color: red;}\n</style>\n';

test(
    parseAndStringifyBlock,
    reusltForHTML,
    html,
    (str) => {
        const { root } = parseHTML(str);

        return stringifyHTMLNode({ node: root });
    },
    html
);