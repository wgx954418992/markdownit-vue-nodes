# markdownit-vue-nodes

[![NPM version](https://img.shields.io/npm/v/markdownit-vue-nodes.svg)](https://npmjs.org/package/markdownit-vue-nodes)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

> Render markdown-it tokens as Vue 3 VNodes for incremental and key-stable updates.

## Features

- Converts markdown-it token arrays directly to Vue 3 Virtual Nodes (VNode)
- Enables incremental rendering and key-stable DOM updates
- Written in TypeScript
- Pure utility function, no UI included

## Install

```bash
npm install markdownit-vue-nodes
```

<details>
<summary>Peer dependencies</summary>

You must install `vue` and `markdown-it` in your project:

```bash
npm install vue@^3.0.0 markdown-it@^13.0.0
```

</details>

## Usage

```ts
import MarkdownIt from 'markdown-it'
import {MarkdownVNodeRenderer} from 'markdownit-vue-nodes'

const md = new MarkdownIt()
const renderer = new MarkdownVNodeRenderer(md)

// Parse markdown string to tokens
const tokens = md.parse('**Hello**, Vue!', {})

// Convert tokens to Vue 3 VNodes
const vnodes = renderer.render(tokens, {})

// You can use <component :is="vnodes" /> or render in a render function.
```

### Typical Vue usage

```vue

<script setup lang="ts">
  import {ref} from 'vue'
  import MarkdownIt from 'markdown-it'
  import {MarkdownVNodeRenderer} from 'markdownit-vue-nodes'

  const md = new MarkdownIt()
  const renderer = new MarkdownVNodeRenderer(md)
  const tokens = md.parse('# Hello World', {})
  const vnodes = renderer.render(tokens, {})
</script>

<template>
  <div>
    <component :is="Fragment">
      <template v-for="(vnode, i) in vnodes" :key="i">
        <component :is="vnode"/>
      </template>
    </component>
  </div>
</template>
```

## API

### `MarkdownVNodeRenderer`

#### Constructor

```ts
new MarkdownVNodeRenderer(md: MarkdownIt)
```

- `md`: An instance of `markdown-it`

#### Methods

- `render(tokens: Token[], env: any): (VNode | string)[]`  
  Converts markdown-it tokens to Vue VNodes or strings.

## License

[Apache-2.0](./LICENSE)