var m = Object.defineProperty;
var y = (c, e, o) => e in c ? m(c, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : c[e] = o;
var N = (c, e, o) => y(c, typeof e != "symbol" ? e + "" : e, o);
import { h as a, Fragment as T } from "vue";
class V {
  /**
   * 构造函数
   * @param md markdown-it 实例
   */
  constructor(e) {
    /**
     * markdown-it 实例
     */
    N(this, "md");
    this.md = e;
  }
  /**
   * 主渲染函数
   * @param tokens markdown-it 解析结果
   * @param env 渲染环境
   * @returns VNode 或 string 数组
   */
  render(e, o) {
    return this.tokensToVNodes(e, o);
  }
  /**
   * 将 attributes 数组转换为 props object
   * @param attrs
   */
  attrsToObject(e) {
    return e ? e.reduce((o, r) => (o[r[0]] = r[1], o), {}) : null;
  }
  /**
   * 递归将 tokens 转换为 VNodes
   */
  tokensToVNodes(e, o) {
    const r = [];
    let t = 0;
    const d = this.md.renderer.rules;
    for (; t < e.length; ) {
      const n = e[t];
      if (n.hidden) {
        t++;
        continue;
      }
      let s;
      switch (n.type) {
        case "softbreak":
          s = this.md.options.breaks ? a("br") : `
`;
          break;
        case "inline":
          s = this.tokensToVNodes(n.children || [], o);
          break;
        case "text":
          s = n.content;
          break;
        default:
          const i = d[n.type], l = n.map ? `${n.type}_${n.map[0]}` : t;
          if (typeof i == "function") {
            const p = i.call(
              this.md.renderer.rules,
              e,
              t,
              this.md.options,
              o,
              this.md.renderer
            ), u = this.htmlToVNodes(p);
            s = a(T, { key: l }, u);
          }
          break;
      }
      if (s) {
        r.push(s), t++;
        continue;
      }
      if (n.type.endsWith("_open")) {
        const [i, l] = this.renderBlock(e, t, o);
        r.push(i), t = l + 1;
      } else
        t++;
    }
    return r.flat();
  }
  /**
   * DOM Node 转 VNode
   */
  nodeToVNode(e) {
    if (e.nodeType === Node.TEXT_NODE) return e.textContent || "";
    if (e.nodeType !== Node.ELEMENT_NODE) return null;
    const o = e, r = {};
    if (o.hasAttributes() && o.attributes)
      for (const d of Array.from(o.attributes))
        r[d.name] = d.value;
    const t = [];
    return o.childNodes.length > 0 && o.childNodes.forEach((d) => {
      const n = this.nodeToVNode(d);
      n && t.push(n);
    }), a(o.tagName.toLowerCase(), r, t);
  }
  /**
   * HTML 字符串转 VNodes
   */
  htmlToVNodes(e) {
    if (!e || !e.trim()) return [];
    const r = new DOMParser().parseFromString(`<body>${e}</body>`, "text/html"), t = [];
    return r.body.childNodes.forEach((d, n) => {
      const s = this.nodeToVNode(d);
      s && (typeof s == "object" && (s.key = n), t.push(s));
    }), t;
  }
  /**
   * 渲染块级 token
   */
  renderBlock(e, o, r) {
    const t = e[o], d = t.tag;
    let n = o;
    for (let h = o + 1; h < e.length; h++) {
      const f = e[h];
      if (f.type === t.type.replace("_open", "_close") && f.level === t.level) {
        n = h;
        break;
      }
    }
    const s = e.slice(o + 1, n), i = this.tokensToVNodes(s, r), l = t.map ? `${t.type}_${t.map[0]}` : o, p = { ...this.attrsToObject(t.attrs), key: l };
    return [a(d, p, i), n];
  }
}
export {
  V as MarkdownVNodeRenderer
};
