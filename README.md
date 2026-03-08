<p align="center">
  <a href="https://github.com/aifuqiang02/vite-plugin-vue-inspector-ai">
    <img src="./logo.svg" width="180" alt="vite-plugin-vue-inspector-ai">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-vue-inspector-ai" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/v/vite-plugin-vue-inspector-ai" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-vue-inspector-ai" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/dt/vite-plugin-vue-inspector-ai" alt="NPM Downloads" /></a>
  <a href="https://github.com/aifuqiang02/vite-plugin-vue-inspector-ai/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/aifuqiang02/vite-plugin-vue-inspector-ai" alt="License" /></a>
</p>

## 介绍

`vite-plugin-vue-inspector-ai` 是一个面向 Vue 3 / Nuxt 3 的开发时调试插件，用来在浏览器里快速定位组件源码。

这个分支相对原版主要增强了两点：

- 复制组件位置信息时，包含起始行和结束行
- 浮层提示和复制内容都围绕“复制定位信息”这条主路径优化

<p align="center">
  <img src="./public/preview.gif" alt="vite-plugin-vue-inspector-ai">
</p>

## 安装

```bash
pnpm add -D vite-plugin-vue-inspector-ai
```

## 交互方式

- 按住 `Ctrl`（macOS 为 `Cmd`）时，临时激活 Inspector
- 松开 `Ctrl/Cmd` 后，临时激活立即结束
- 点击右上角悬浮按钮，可切换为常驻模式
- 激活状态下点击元素：复制组件位置信息
- 常驻模式下 `Ctrl/Cmd + 点击`：复制组件位置信息并尝试打开 IDE

当前复制到剪贴板的实际格式为：

```text
Vue组件: src/views/WelcomeView.vue | 起始行: 7 | 结束行: 25
```

## 使用方法

### Vite

```ts
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Inspector from 'vite-plugin-vue-inspector-ai'

export default defineConfig({
  plugins: [
    Vue(),
    Inspector({
      enabled: false,
      toggleButtonVisibility: 'always',
      launchEditor: 'code',
    }),
  ],
})
```

### Nuxt 3

```ts
import { defineNuxtConfig } from 'nuxt/config'
import Inspector from 'vite-plugin-vue-inspector-ai'

export default defineNuxtConfig({
  vite: {
    plugins: [
      Inspector({
        enabled: false,
        toggleButtonVisibility: 'always',
      }),
    ],
  },
})
```

## 配置项

```ts
interface VitePluginInspectorOptions {
  enabled?: boolean
  toggleButtonVisibility?: 'always' | 'active' | 'never'
  toggleButtonPos?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  appendTo?: string | RegExp
  openInEditorHost?: string | false
  lazyLoad?: number | false
  disableInspectorOnEditorOpen?: boolean
  cleanHtml?: boolean
  launchEditor?:
    | 'appcode'
    | 'atom'
    | 'atom-beta'
    | 'brackets'
    | 'clion'
    | 'code'
    | 'code-insiders'
    | 'codium'
    | 'emacs'
    | 'idea'
    | 'notepad++'
    | 'pycharm'
    | 'phpstorm'
    | 'rubymine'
    | 'sublime'
    | 'vim'
    | 'visualstudio'
    | 'webstorm'
    | 'rider'
    | 'cursor'
    | string
  reduceMotion?: boolean
}
```

## 支持的编辑器

| 值              | 编辑器                                                                 | Linux | Windows | OSX |
| --------------- | ---------------------------------------------------------------------- | :---: | :-----: | :-: |
| `appcode`       | [AppCode](https://www.jetbrains.com/objc/)                             |       |         |  ✓  |
| `atom`          | [Atom](https://atom.io/)                                               |   ✓   |    ✓    |  ✓  |
| `brackets`      | [Brackets](http://brackets.io/)                                        |   ✓   |    ✓    |  ✓  |
| `clion`         | [Clion](https://www.jetbrains.com/clion/)                              |       |    ✓    |  ✓  |
| `code`          | [Visual Studio Code](https://code.visualstudio.com/)                   |   ✓   |    ✓    |  ✓  |
| `code-insiders` | [Visual Studio Code Insiders](https://code.visualstudio.com/insiders/) |   ✓   |    ✓    |  ✓  |
| `codium`        | [VSCodium](https://github.com/VSCodium/vscodium)                       |   ✓   |    ✓    |  ✓  |
| `emacs`         | [Emacs](https://www.gnu.org/software/emacs/)                           |   ✓   |         |     |
| `idea`          | [IDEA](https://www.jetbrains.com/idea/)                                |   ✓   |    ✓    |  ✓  |
| `notepad++`     | [Notepad++](https://notepad-plus-plus.org/download/v7.5.4.html)        |       |    ✓    |     |
| `pycharm`       | [PyCharm](https://www.jetbrains.com/pycharm/)                          |   ✓   |    ✓    |  ✓  |
| `phpstorm`      | [PhpStorm](https://www.jetbrains.com/phpstorm/)                        |   ✓   |    ✓    |  ✓  |
| `rubymine`      | [RubyMine](https://www.jetbrains.com/ruby/)                            |   ✓   |    ✓    |  ✓  |
| `sublime`       | [Sublime Text](https://www.sublimetext.com/)                           |   ✓   |    ✓    |  ✓  |
| `vim`           | [Vim](http://www.vim.org/)                                             |   ✓   |         |     |
| `visualstudio`  | [Visual Studio](https://www.visualstudio.com/vs/)                      |       |         |  ✓  |
| `webstorm`      | [WebStorm](https://www.jetbrains.com/webstorm/)                        |   ✓   |    ✓    |  ✓  |
| `rider`         | [Rider](https://www.jetbrains.com/rider/)                              |   ✓   |    ✓    |  ✓  |
| `cursor`        | [Cursor](https://www.cursor.com/)                                      |   ✓   |    ✓    |  ✓  |

## IDE 配置

推荐直接用 `launchEditor` 指定 IDE，并确保对应命令已在系统环境变量中可用。

例如固定使用 VS Code：

```ts
Inspector({
  launchEditor: 'code',
})
```

也可以通过环境变量指定：

```bash
export LAUNCH_EDITOR=code
```

## 编程式使用

```ts
import type { VueInspectorClient } from 'vite-plugin-vue-inspector-ai'

const inspector: VueInspectorClient = window.__VUE_INSPECTOR__

if (inspector) {
  inspector.enable()
  inspector.disable()
}
```

## 开发与发布

### 开发

```bash
pnpm install
pnpm run play:vue3
```

### 发布

```bash
cd packages/core
pnpm build
npm publish --access public
```

发布前请先手动更新 `packages/core/package.json` 中的版本号。

## 示例

- [Vue 3 Playground](./packages/playground/vue3)
- [Nuxt 3 Playground](./packages/playground/nuxt)

## 致谢

本项目灵感来自 [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector)。

部分实现参考了 [vite-plugin-svelte-inspector](https://github.com/sveltejs/vite-plugin-svelte/tree/main/packages/vite-plugin-svelte-inspector)。

基于原项目分支继续演进，并围绕 `vite-plugin-vue-inspector-ai` 持续维护。

## 许可证

[MIT LICENSE](./LICENSE)
