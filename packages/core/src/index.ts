import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import process from 'node:process'
import { bold, green, yellow } from 'kolorist'
import { normalizePath } from 'vite'
import type { PluginOption, ResolvedConfig } from 'vite'
import MagicString from 'magic-string'
import { compileSFCTemplate } from './compiler'
import { idToFile, parseVueRequest } from './utils'

export interface VueInspectorClient {
  enabled: boolean
  position: {
    x: number
    y: number
  }
  linkParams: {
    file: string
    line: number
    column: number
  }

  enable: () => void
  disable: () => void
  toggleEnabled: () => void
  onEnabled: () => void
  onDisabled: () => void

  openInEditor: (url: URL) => void
  onUpdated: () => void
}

export interface VitePluginInspectorOptions {
  /**
   * Default enable state for sticky mode
   * @default false
   */
  enabled?: boolean

  /**
   * Toggle button visibility
   * @default 'active'
   */
  toggleButtonVisibility?: 'always' | 'active' | 'never'

  /**
   * Toggle button display position
   * @default top-right
   */
  toggleButtonPos?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

  /**
   * Append an import to the module id ending with `appendTo` instead of adding a script into body
   * Useful for frameworks that do not support transformIndexHtml hook (e.g. Nuxt3)
   */
  appendTo?: string | RegExp

  /**
   * Customize openInEditor host (e.g. http://localhost:3000)
   * @default false
   * @deprecated This option is deprecated and removed in 5.0. The plugin now automatically detects the correct host.
   */
  openInEditorHost?: string | false

  /**
   * Lazy load inspector time (ms)
   * @default false
   */
  lazyLoad?: number | false

  /**
   * Disable inspector on editor open
   * @default false
   */
  disableInspectorOnEditorOpen?: boolean

  /**
   * Hide information in VNode and produce clean html in DevTools
   * @default true
   */
  cleanHtml?: boolean

  /**
   * Target editor when open in editor (v5.1.0+)
   * @default process.env.LAUNCH_EDITOR ?? code (Visual Studio Code)
   */
  launchEditor?: 'appcode' | 'atom' | 'atom-beta' | 'brackets' | 'clion' | 'code' | 'code-insiders' | 'codium' | 'emacs' | 'idea' | 'notepad++' | 'pycharm' | 'phpstorm' | 'rubymine' | 'sublime' | 'vim' | 'visualstudio' | 'webstorm' | 'rider' | 'cursor' | string

  /**
   * Disable animation/transition, will auto disable when `prefers-reduced-motion` is set
   * @default false
   */
  reduceMotion?: boolean
}

function getInspectorPath() {
  const pluginPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  return pluginPath.replace(/\/dist$/, '/src')
}

export const DEFAULT_INSPECTOR_OPTIONS: VitePluginInspectorOptions = {
  enabled: false,
  toggleButtonVisibility: 'active',
  toggleButtonPos: 'top-right',
  appendTo: '',
  lazyLoad: false,
  launchEditor: process.env.LAUNCH_EDITOR ?? 'code',
  reduceMotion: false,
} as const

function VitePluginInspector(options: VitePluginInspectorOptions = DEFAULT_INSPECTOR_OPTIONS): PluginOption {
  const inspectorPath = getInspectorPath()
  const normalizedOptions = {
    ...DEFAULT_INSPECTOR_OPTIONS,
    ...options,
  }
  let config: ResolvedConfig

  const {
    appendTo,
    cleanHtml = true,
  } = normalizedOptions

  if (normalizedOptions.launchEditor)
    process.env.LAUNCH_EDITOR = normalizedOptions.launchEditor

  return [
    {
      name: 'vite-plugin-vue-inspector-ai',
      enforce: 'pre',
      apply(_, { command }) {
        return command === 'serve' && process.env.NODE_ENV !== 'test'
      },
      async resolveId(importee: string) {
        if (importee.startsWith('virtual:vue-inspector-options'))
          return importee
        if (importee.startsWith('virtual:vue-inspector-path:'))
          return importee.replace('virtual:vue-inspector-path:', `${inspectorPath}/`)
      },
      async load(id) {
        if (id === 'virtual:vue-inspector-options')
          return `export default ${JSON.stringify({ ...normalizedOptions, base: config.base })}`

        if (!id.startsWith(inspectorPath))
          return

        const { query } = parseVueRequest(id)
        if (query.type)
          return

        const file = idToFile(id)
        if (fs.existsSync(file))
          return await fs.promises.readFile(file, 'utf-8')

        console.error(`failed to find file for vue-inspector: ${file}, referenced by id ${id}.`)
      },
      transform(code, id) {
        const { filename, query } = parseVueRequest(id)

        const isJsx = filename.endsWith('.jsx') || filename.endsWith('.tsx') || (filename.endsWith('.vue') && query.isJsx)
        const isTpl = filename.endsWith('.vue') && query.type !== 'style' && !query.raw

        if (isJsx || isTpl)
          return compileSFCTemplate({ code, id: filename, type: isJsx ? 'jsx' : 'template' })

        if (!appendTo)
          return

        if ((typeof appendTo === 'string' && filename.endsWith(appendTo))
          || (appendTo instanceof RegExp && appendTo.test(filename)))
          return { code: `${code}\nimport 'virtual:vue-inspector-path:load.js'` }
      },
      configureServer(server) {
        const _printUrls = server.printUrls
        const holdKey = process.platform === 'darwin' ? 'Cmd' : 'Ctrl'

        server.printUrls = () => {
          _printUrls()
          console.log(`  ${green('➜')}  ${bold('Vue Inspector')}: ${green(`Hold ${yellow(holdKey)} in App to inspect components`)}\n`)
        }
      },
      transformIndexHtml(html) {
        if (appendTo)
          return
        return {
          html,
          tags: [
            {
              tag: 'script',
              injectTo: 'head',
              attrs: {
                type: 'module',
                src: `${config.base || '/'}@id/virtual:vue-inspector-path:load.js`,
              },
            },
          ],
        }
      },
      configResolved(resolvedConfig) {
        config = resolvedConfig
      },
    },
    {
      name: 'vite-plugin-vue-inspector-ai:post',
      enforce: 'post',
      apply(_, { command }) {
        return cleanHtml && command === 'serve' && process.env.NODE_ENV !== 'test'
      },
      transform(code) {
        if (code.includes('_interopVNode'))
          return
        if (!code.includes('data-v-inspector'))
          return

        const fn = new Set<string>()
        const s = new MagicString(code)

        s.replace(/(createElementVNode|createVNode|createElementBlock|createBlock) as _\1,?/g, (_, name) => {
          fn.add(name)
          return ''
        })

        if (!fn.size)
          return

        s.appendLeft(0, `/* Injection by vite-plugin-vue-inspector-ai Start */
import { ${Array.from(fn.values()).map(i => `${i} as __${i}`).join(',')} } from 'vue'
function _interopVNode(vnode) {
  if (vnode && vnode.props && 'data-v-inspector' in vnode.props) {
    const data = vnode.props['data-v-inspector']
    delete vnode.props['data-v-inspector']
    Object.defineProperty(vnode.props, '__v_inspector', { value: data, enumerable: false })
  }
  return vnode
}
${Array.from(fn.values()).map(i => `function _${i}(...args) { return _interopVNode(__${i}(...args)) }`).join('\n')}
/* Injection by vite-plugin-vue-inspector-ai End */
`)

        return {
          code: s.toString(),
          map: s.generateMap({ hires: 'boundary' }),
        }
      },
    },
  ]
}
export default VitePluginInspector

