import { AllNodes } from "./types";

export function nodeTreeHandler(
    node: AllNodes,
    handler: (node: AllNodes, stop: () => {}) => void | boolean
) {
    let isStop = false;

    switch (node.type) {
        case 'root': {
            for(let ch of node.children) {
                const res = nodeTreeHandler(ch, handler);

                if (res) {
                    return;
                }
            }
            
            return;
        }
        case 'html': {
            handler(node, () => isStop = true);

            if (isStop) return true;

            for(let ch of node.children) {
                const res = nodeTreeHandler(ch, handler);

                if (res) {
                    return true;
                }
            }

            return false;
        }
        case 'directive':
        case'comment': {
            handler(node, () => isStop = true);

            return isStop;
        }
    }
}