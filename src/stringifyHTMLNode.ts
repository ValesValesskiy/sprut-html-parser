import { AllNodes } from "./types";
import { tab } from "./utils";

export function stringifyHTMLNode({ node, tabCount = 0, tabSpaceCount = 2 }: { node: AllNodes; tabCount?: number; tabSpaceCount?: number; }): string {
	switch(node.type) {
		case 'root': {
			return node.children.map(item => stringifyHTMLNode({ node: item, tabCount, tabSpaceCount })).join('');
		}
		case 'html': {
            const { tag, children, attributes, isVoid} = node;

            return `${tab(tabCount, tabSpaceCount)}<${tag}${attributes.length ? ' ' : ''}${attributes.map(attr => stringifyHTMLNode({ node: attr, tabSpaceCount })).join(' ').trim()}${isVoid ? ' ' : ''}${isVoid ? '/>' : '>'}${tag === 'style' || tag === 'script' ? '' : '\n'}`
            + (children.length ? children.map(child => stringifyHTMLNode({ node: child, tabCount: tabCount + 1, tabSpaceCount })).join('') : '')
            + (isVoid ? '' : `${tab(tabCount, tabSpaceCount)}</${tag}>\n`);
		}
		case 'directive': {
			return `${tab(tabCount, tabSpaceCount)}<!${node.directiveBody}>\n`;
		}
		case 'comment':
			return `${tab(tabCount, tabSpaceCount)}<!-- ${node.comment.trim()} -->\n`;
		case 'attribute': {
			return `${node.name}${node.value !== true ? '="' : ''}${node.value !== true ? node.value : ''}${node.value !== true ? '"' : ''}`;
		}
		case 'text': {
			return `${tab(tabCount, tabSpaceCount)}${node.text.replace(/\n/g, `\n${tab(tabCount, tabSpaceCount)}`)}\n`;
		}
        case 'rawText': {
            return node.text;
        }
		default: {
			throw new Error();
		}
	}
}