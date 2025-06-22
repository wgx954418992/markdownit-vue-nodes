import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'MarkdownItVueNodes',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
            external: ['vue', 'markdown-it'],
            output: {
                globals: {
                    vue: 'Vue',
                    'markdown-it': 'markdownit'
                }
            }
        }
    }
})