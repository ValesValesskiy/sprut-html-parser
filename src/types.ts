export type RootNode = {
    type: 'root';
    root: true;
    children: Array<HTMLNode | TextNode | RawTextNode | DirectiveNode | CommentNode>;
    parent: null;
};

export type HTMLNode = {
    tag: string;
    children: Array<HTMLNode | TextNode | RawTextNode | DirectiveNode | CommentNode>;
    attributes: HTMLNodeAttribute[];
    parent: HTMLNode | RootNode;
    isVoid?: boolean;
    type: 'html';
};

export type TextNode = {
    type: 'text';
    text: string;
    parent: HTMLNode | RootNode;
}

export type RawTextNode = {
    type: 'rawText';
    text: string;
    parent: HTMLNode | RootNode;
}

export type HTMLNodeAttribute = {
    type: 'attribute';
    name: string;
    value: string | boolean;
    parent: HTMLNode;
};

export type DirectiveNode = {
    directiveBody: string;
    parent: HTMLNode | RootNode;
    type: 'directive';
};

export type CommentNode = {
    comment: string;
    parent: HTMLNode | RootNode;
    type: 'comment';
};

export type AllNodes = RootNode | HTMLNode | DirectiveNode | CommentNode | HTMLNodeAttribute | TextNode | RawTextNode;