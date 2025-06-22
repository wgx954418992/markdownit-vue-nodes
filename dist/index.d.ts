import type MarkdownIt from 'markdown-it';
import type { Token } from 'markdown-it';
import type { VNode } from 'vue';
/**
 * 将 markdown-it tokens 转换为 VNode 的渲染器。
 * 支持增量更新与 key 优化。
 */
export declare class MarkdownVNodeRenderer {
    /**
     * markdown-it 实例
     */
    private md;
    /**
     * 构造函数
     * @param md markdown-it 实例
     */
    constructor(md: MarkdownIt);
    /**
     * 主渲染函数
     * @param tokens markdown-it 解析结果
     * @param env 渲染环境
     * @returns VNode 或 string 数组
     */
    render(tokens: Token[], env: any): (VNode | string)[];
    /**
     * 将 attributes 数组转换为 props object
     * @param attrs
     */
    private attrsToObject;
    /**
     * 递归将 tokens 转换为 VNodes
     */
    private tokensToVNodes;
    /**
     * DOM Node 转 VNode
     */
    private nodeToVNode;
    /**
     * HTML 字符串转 VNodes
     */
    private htmlToVNodes;
    /**
     * 渲染块级 token
     */
    private renderBlock;
}
