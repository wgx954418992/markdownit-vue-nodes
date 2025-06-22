import type MarkdownIt from 'markdown-it'
import type {Token} from 'markdown-it'
import type {VNode} from 'vue'
import {h, Fragment} from 'vue'

/**
 * 将 markdown-it tokens 转换为 VNode 的渲染器。
 * 支持增量更新与 key 优化。
 */
export class MarkdownVNodeRenderer {
    /**
     * markdown-it 实例
     */
    private md: MarkdownIt

    /**
     * 构造函数
     * @param md markdown-it 实例
     */
    constructor(md: MarkdownIt) {
        this.md = md
    }

    /**
     * 主渲染函数
     * @param tokens markdown-it 解析结果
     * @param env 渲染环境
     * @returns VNode 或 string 数组
     */
    public render(tokens: Token[], env: any): (VNode | string)[] {
        return this.tokensToVNodes(tokens, env)
    }

    /**
     * 将 attributes 数组转换为 props object
     * @param attrs
     */
    private attrsToObject(
        attrs: [string, string][] | null | undefined
    ): Record<string, string> | null {
        if (!attrs) return null
        return attrs.reduce((acc, attr) => {
            acc[attr[0]] = attr[1]
            return acc
        }, {} as Record<string, string>)
    }

    /**
     * 递归将 tokens 转换为 VNodes
     */
    private tokensToVNodes(tokens: Token[], env: any): (VNode | string)[] {
        const vnodes: (VNode | string | (VNode | string)[])[] = []

        let i = 0
        const rules = this.md.renderer.rules

        while (i < tokens.length) {
            const token = tokens[i]
            if (token.hidden) {
                i++
                continue
            }

            let vnode: VNode | string | (VNode | string)[] | undefined

            switch (token.type) {
                case 'softbreak':
                    vnode = this.md.options.breaks ? h('br') : '\n'
                    break
                case 'inline':
                    vnode = this.tokensToVNodes(token.children || [], env)
                    break
                case 'text':
                    vnode = token.content
                    break
                default:
                    const rule = rules[token.type]
                    const nodeKey = token.map ? `${token.type}_${token.map[0]}` : i
                    if (typeof rule === 'function') {
                        const renderHTML = rule.call(
                            this.md.renderer.rules,
                            tokens,
                            i,
                            this.md.options,
                            env,
                            this.md.renderer
                        )
                        const childrenVNodes = this.htmlToVNodes(renderHTML)
                        vnode = h(Fragment, {key: nodeKey}, childrenVNodes)
                    }
                    break
            }

            if (vnode) {
                vnodes.push(vnode)
                i++
                continue
            }

            if (token.type.endsWith('_open')) {
                const [blockVNode, endIndex] = this.renderBlock(tokens, i, env)
                vnodes.push(blockVNode)
                i = endIndex + 1
            } else {
                i++
            }
        }

        return vnodes.flat()
    }

    /**
     * DOM Node 转 VNode
     */
    private nodeToVNode(node: Node): VNode | string | null {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent || ''
        if (node.nodeType !== Node.ELEMENT_NODE) return null

        const elementNode = node as Element
        const props: Record<string, any> = {}

        if (elementNode.hasAttributes() && elementNode.attributes) {
            for (const attr of Array.from(elementNode.attributes)) {
                props[attr.name] = attr.value
            }
        }

        const children: (VNode | string)[] = []

        if (elementNode.childNodes.length > 0) {
            elementNode.childNodes.forEach(child => {
                const childVNode = this.nodeToVNode(child)
                if (childVNode) {
                    children.push(childVNode)
                }
            })
        }

        return h(elementNode.tagName.toLowerCase(), props, children)
    }

    /**
     * HTML 字符串转 VNodes
     */
    private htmlToVNodes(htmlString: string): (VNode | string)[] {
        if (!htmlString || !htmlString.trim()) return []

        const parser = new DOMParser()
        const doc = parser.parseFromString(`<body>${htmlString}</body>`, 'text/html')
        const vnodes: (VNode | string)[] = []

        doc.body.childNodes.forEach((node, index) => {
            const vnode = this.nodeToVNode(node)
            if (vnode) {
                if (typeof vnode === 'object') (vnode as any).key = index
                vnodes.push(vnode)
            }
        })

        return vnodes
    }

    /**
     * 渲染块级 token
     */
    private renderBlock(tokens: Token[], startIndex: number, env: any): [VNode, number] {
        const openToken = tokens[startIndex]
        const tag = openToken.tag

        let endIndex = startIndex
        for (let j = startIndex + 1; j < tokens.length; j++) {
            const token = tokens[j]
            if (
                token.type === openToken.type.replace('_open', '_close') &&
                token.level === openToken.level
            ) {
                endIndex = j
                break
            }
        }

        const innerTokens = tokens.slice(startIndex + 1, endIndex)
        const children = this.tokensToVNodes(innerTokens, env)
        const key = openToken.map ? `${openToken.type}_${openToken.map[0]}` : startIndex
        const props = {...this.attrsToObject(openToken.attrs), key}
        const vnode = h(tag, props, children)
        return [vnode, endIndex]
    }
}