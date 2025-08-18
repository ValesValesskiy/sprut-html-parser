import { parserBuilder } from 'sprut-parser-builder';

import { CommentNode, DirectiveNode, HTMLNode, HTMLNodeAttribute, RootNode } from './types';
import { attribute, comment, directive, html, rawTextNode, textNode } from './nodeCreators';
import { IteratorState } from 'sprut-parser-builder/types';

const voidElementTags = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];

const htmlParser = parserBuilder<{ root: RootNode; currentBlock: RootNode | HTMLNode | DirectiveNode | CommentNode | HTMLNodeAttribute; scriptQuoteContext: string; attrValueQuoteContext: string | null; scriptTagContext: string }, 'node' | 'tagName' | 'attributeName' | 'attributeName' | 'booleanAttribute' | 'attributeValue' | 'closeDirective' | 'closeTag' | 'closeInnerTag' | 'closeScript' | 'scriptQuotes' | 'comment' | 'endComment'>({
    node: {
        parseTo: '<',
        handler(substr, finded, str, sym, index) {
            const txt = substr;
            const currentNode = this.currentBlock as RootNode | HTMLNode;
            const block = str[index + 1] === '!' ? directive({ parent: currentNode}) : html({ parent: currentNode,  });

            if (txt.trim()) {
                currentNode.children.push(textNode(txt.trim(), currentNode));
            }

            currentNode.children.push(block);

            this.currentBlock = block;
        },
        find() {
            if (this.currentBlock.type === 'directive') {
                return ['closeDirective']
            } else {
                return ['tagName', 'closeTag'];
            }
        }
    },
    tagName: {
        parseTo: ' ',
        handler(substr) {
            (this.currentBlock as HTMLNode).tag = substr;
        },
        find: ['attributeName', 'booleanAttribute', 'closeTag']
    },
    attributeName: {
        parseTo: '=',
        handler(substr) {
            const newAttr = attribute({ name: substr.trim(), parent: this.currentBlock as HTMLNode });
            (this.currentBlock as HTMLNode).attributes.push(newAttr);
            this.currentBlock = newAttr;
        },
        find: ['attributeValue']
    },
    booleanAttribute: {
        parseTo: ' ',
        handler(substr) {
            if (!substr.trim()) {
                return { continue: true };
            }

            const newAttr = attribute({ name: substr.trim(), parent: this.currentBlock as HTMLNode, value: true });
            (this.currentBlock as HTMLNode).attributes.push(newAttr);
        },
        find: ['attributeName', 'booleanAttribute', 'closeTag']
    },
    attributeValue: {
        parseTo: ["'", '"'],
        handler(substr, finded) {
            if (!this.attrValueQuoteContext) {
                this.attrValueQuoteContext = finded;

                return { continue: true };
            }

            if (this.attrValueQuoteContext === finded) {
                this.attrValueQuoteContext = null;
                (this.currentBlock as HTMLNodeAttribute).value = substr.substring(1);
                this.currentBlock = this.currentBlock.parent as HTMLNode;
            } else {
                return { continue: true };
            }
        },
        find: ['attributeName', 'booleanAttribute', 'closeTag']
    },
    closeDirective: {
        parseTo: '>',
        handler(substr) {
            (this.currentBlock as DirectiveNode).directiveBody = substr.trim().substring(1);

            this.currentBlock = this.currentBlock.parent as HTMLNode;
        },
        find: ['node', 'closeInnerTag', 'comment']
    },
    closeTag: {
        parseTo: ['>', '\/>'],
        handler(substr, finded) {
            const curerntNode = this.currentBlock as HTMLNode;

            if (!curerntNode.tag) {
                curerntNode.tag = substr.trim();
            } else if (substr.trim()) {
                curerntNode.attributes.push(attribute({ name: substr.trim(), value: true, parent: curerntNode }));
            }

            if (finded === '\/>' || voidElementTags.includes(curerntNode.tag)) {
                curerntNode.isVoid = true;
                this.currentBlock = this.currentBlock.parent as HTMLNode;
            }
        },
        find() {
            const curerntNode = this.currentBlock as HTMLNode;

            if (curerntNode.tag === 'script' || curerntNode.tag === 'style') {
                this.scriptTagContext = curerntNode.tag;

                return ['closeScript', 'scriptQuotes']
            } else {
                return ['node', 'closeInnerTag', 'comment'];
            }
        }
    },
    closeInnerTag: {
        parseTo: '<\/',
        handler(substr, finded, str, sym, index) {
            if (this.currentBlock.type === 'root') {
                throw new Error('Неожиданное закрытие тега, ниодного тега не открыто');
            }
            if (str.substring(index + finded.length, index + finded.length + (this.currentBlock as HTMLNode).tag.length) === (this.currentBlock as HTMLNode).tag) {
                const block = this.currentBlock as HTMLNode;

                if (substr.trim()) block.children.push(textNode(substr.trim(), block));

                this.currentBlock = this.currentBlock.parent;

                return { cursorTo: index + finded.length + block.tag.length };
            }
        },
        find: ['node', 'closeInnerTag', 'comment']
    },
    closeScript: {
        parseTo: ['</script>', '</style>'],
        handler(substr, finded) {
            if (`</${this.scriptTagContext}>` === finded) {
                (this.currentBlock as HTMLNode).children.push(rawTextNode(substr, this.currentBlock as HTMLNode));

                this.currentBlock = this.currentBlock.parent as HTMLNode;

                this.scriptQuoteContext = '';
            } else {
                // TODO: По идее это ошибка в коде
                return { continue: true };
            }
        },
        find: ['node', 'closeInnerTag', 'comment']
    },
    scriptQuotes: {
        parseTo: ['"', "'"],
        handler(substr, finded, str, sym, index) {
            if (this.scriptQuoteContext && str[index - 1] === '\\' && str[index - 2] !== '\\') {
                return { continue: true };
            }

            (this.currentBlock as HTMLNode).children.push(rawTextNode(`${substr}${finded}`, this.currentBlock as HTMLNode));
        },
        find(substr, finded) {
            if (!this.scriptQuoteContext) {
                this.scriptQuoteContext = finded;

                return ['scriptQuotes'];
            } else if (this.scriptQuoteContext === finded) {
                return ['closeScript', 'scriptQuotes'];
            }

            return ['scriptQuotes'];
        }
    },
    comment: {
        parseTo: '<!--',
        handler(substr) {
            if (substr.trim()) {
                (this.currentBlock as HTMLNode).children.push(textNode(substr.trim(), this.currentBlock as HTMLNode));
            }

            const block = comment({ parent: this.currentBlock as HTMLNode });

            (this.currentBlock as HTMLNode).children.push(block);
            this.currentBlock = block;
        },
        find: ['endComment']
    },
    endComment: {
        parseTo: '-->',
        handler(substr) {
            (this.currentBlock as CommentNode).comment = substr;

            this.currentBlock = this.currentBlock.parent as HTMLNode;
        },
        find: ['node', 'closeInnerTag', 'comment']
    },

}, ['node', 'comment'], function() {
    this.root = this.currentBlock = { type: 'root', root: true, children: [], parent: null };
    this.attrValueQuoteContext = null;
});

export const parseHTML = (html: string, state?: IteratorState) => {
    const result = htmlParser(html, state);

    return {
        root: result.data.root,
        parserState: state
    };
};