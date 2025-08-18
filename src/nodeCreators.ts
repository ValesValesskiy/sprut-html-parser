import { CommentNode, DirectiveNode, HTMLNode, HTMLNodeAttribute, RawTextNode, TextNode } from "./types";


export function textNode(txt: string, parent: TextNode['parent']): TextNode {
    return {
        type: 'text',
        text: txt,
        parent
    };
}

export function rawTextNode(txt: string, parent: RawTextNode['parent']): RawTextNode {
    return {
        type: 'rawText',
        text: txt,
        parent
    };
}

export function html({ tag = '', children = [], attributes = [], parent }: Partial<HTMLNode> & Pick<HTMLNode, 'parent'>): HTMLNode {
    return { tag, children, attributes, parent, type: 'html' };
}

export function attribute({ name = '', value = '', parent }: Partial<HTMLNodeAttribute> & Pick<HTMLNodeAttribute, 'parent'>): HTMLNodeAttribute {
    return { name, value, parent, type: 'attribute' };
}

export function directive({ directiveBody = '', parent }: Partial<DirectiveNode> & Pick<DirectiveNode, 'parent'>): DirectiveNode {
    return { directiveBody, parent, type: 'directive' };
}

export function comment({ comment = '', parent }: Partial<CommentNode> & Pick<CommentNode, 'parent'>): CommentNode {
    return { comment, parent, type: 'comment' };
}