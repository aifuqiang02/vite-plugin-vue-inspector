<p align="center">
<a href="https://github.com/aifuqiang02/vite-plugin-vue-inspector"><img src="./logo.svg" width="180" alt="vite-plugin-vue-inspector-ai"></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-vue-inspector-ai" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/v/vite-plugin-vue-inspector-ai" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-vue-inspector-ai" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/dt/vite-plugin-vue-inspector-ai" alt="NPM Downloads" /></a>
  <a href="https://github.com/aifuqiang02/vite-plugin-vue-inspector/blob/master/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/aifuqiang02/vite-plugin-vue-inspector" alt="License" /></a>
</p>

<p align="center">
<a href="https://stackblitz.com/edit/vitejs-vite-rbr2as?file=src%2FApp.vue"><img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt=""></a>
</p>

## 📖 介绍

一个 Vite 插件，点击浏览器中的元素即可跳转到本地 IDE 的源代码。支持 Vue2 & 3 & SSR。

**这是 [vite-plugin-vue-inspector](https://github.com/webfansplz/vite-plugin-vue-inspector) 的分支，增加了以下功能：**

- ✅ 复制文件位置（包含起始和结束行）到剪贴板（格式：`file.vue:10:5-20`）
- ✅ 在检查器浮层中显示结束行信息

<p align="center">
<img src="./public/preview.gif" alt="vite-plugin-vue-inspector-ai">
</p>

## 📦 安装

```bash

pnpm install vite-plugin-vue-inspector-ai -D

```

## 🦄 使用方法

### 点击行为

- **默认点击**：复制文件位置到剪贴板（格式：`Vue组件: src/views/WelcomeView.vue | 起始行: 7 | 结束行: 25`，不打开编辑器）
- **Ctrl + 点击**（或 **Cmd + 点击** on macOS）：打开编辑器 + 复制到剪贴板

### 配置 Vite

```ts
// Vue3

import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";

import Inspector from "vite-plugin-vue-inspector-ai";

export default defineConfig({
  plugins: [
    Vue(),
    Inspector({
      enabled: true,
      toggleButtonVisibility: "always",
    }),
  ],
});
```

```ts
// Vue2

import { defineConfig } from "vite";
import { createVuePlugin } from "vite-plugin-vue2";

import Inspector from "vite-plugin-vue-inspector-ai";

export default defineConfig({
  plugins: [
    createVuePlugin(),
    Inspector({
      vue: 2,
      enabled: true,
      toggleButtonVisibility: "always",
    }),
  ],
});
```

```ts
// Nuxt3
// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config";
import Inspector from "vite-plugin-vue-inspector-ai";

export default defineNuxtConfig({
  modules: [
    [
      "vite-plugin-vue-inspector-ai/nuxt",
      {
        enabled: true,
        toggleButtonVisibility: "always",
      },
    ],
  ],
});
```

### 配置项

```ts
interface VitePluginInspectorOptions {
  /**
   * Vue 版本
   * @default 3
   */
  vue?: 2 | 3;

  /**
   * 默认启用状态
   * @default false
   */
  enabled?: boolean;

  /**
   * 定义切换检查器的组合键
   * @default 'control-shift' (Windows), 'meta-shift' (其他系统)
   *
   * 任意数量的修饰符 `control` `shift` `alt` `meta` 加上零个或一个普通键，用 `-` 分隔
   * 示例: control-shift, control-o, control-alt-s  meta-x control-meta
   * 某些按键有原生行为（如 Firefox 中 alt-s 打开历史菜单）。
   * 为避免冲突或意外输入，建议仅使用修饰符组合。
   * 也可通过设置为 `false` 禁用。
   */
  toggleComboKey?: string | false;

  /**
   * 切换按钮可见性
   * @default 'active'
   */
  toggleButtonVisibility?: "always" | "active" | "never";

  /**
   * 切换按钮显示位置
   * @default top-right
   */
  toggleButtonPos?: "top-right" | "top-left" | "bottom-right" | "bottom-left";

  /**
   * 将导入追加到以 `appendTo` 结尾的模块 ID，而不是将脚本添加到 body
   * 适用于不支持 transformIndexHtml hook 的框架（如 Nuxt3）
   *
   * 警告：只有完全了解其作用时才设置此项。
   */
  appendTo?: string | RegExp;

  /**
   * 自定义打开编辑器的主机（如 http://localhost:3000）
   * @default false
   * @deprecated 此选项已在 5.0 版本弃用并移除。插件现在会自动检测正确的主机。
   */
  openInEditorHost?: string | false;

  /**
   * 延迟加载检查器的时间（毫秒）
   * @default false
   */
  lazyLoad?: number | false;

  /**
   * 打开编辑器时禁用检查器
   * @default false
   */
  disableInspectorOnEditorOpen?: boolean;

  /**
   * 隐藏 VNode 中的信息，在 DevTools 中产生干净的 HTML
   *
   * 目前仅适用于 Vue 3
   *
   * @default true
   */
  cleanHtml?: boolean;

  /**
   * 打开编辑器时的目标编辑器 (v5.1.0+)
   *
   * @default code (Visual Studio Code)
   */
  launchEditor?:
    | "appcode"
    | "atom"
    | "atom-beta"
    | "brackets"
    | "clion"
    | "code"
    | "code-insiders"
    | "codium"
    | "emacs"
    | "idea"
    | "notepad++"
    | "pycharm"
    | "phpstorm"
    | "rubymine"
    | "sublime"
    | "vim"
    | "visualstudio"
    | "webstorm"
    | "cursor"
    | string;
}
```

### 示例

- [Vue2](https://github.com/aifuqiang02/vite-plugin-vue-inspector/tree/main/packages/playground/vue2)
- [Vue3](https://github.com/aifuqiang02/vite-plugin-vue-inspector/tree/main/packages/playground/vue3)
- [Nuxt3](https://github.com/aifuqiang02/vite-plugin-vue-inspector/tree/main/packages/playground/nuxt)

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
| `cursor`        | [Cursor](https://www.cursor.com/)                                      |   ✓   |    ✓    |  ✓  |

## 🔌 配置 IDE / 编辑器

**从 v5.1.0 开始，建议使用 `launchEditor` 选项配置指定 IDE**（请确保编辑器环境变量已正确配置。）

它使用名为 **`LAUNCH_EDITOR`** 的环境变量来指定 IDE 应用程序。如果未设置此变量，它将尝试打开您打开或安装的常见 IDE。

例如，如果希望始终在单击检查时打开 VS Code，请在 shell 中设置 `export LAUNCH_EDITOR=code`。

### VS Code

- 安装 VS Code 命令行工具，[查看官方文档](https://code.visualstudio.com/docs/setup/mac#_launching_from_the_command_line)
  ![install-vscode-cli](./public/install-vscode-cli.png)

- 在 shell 中设置环境变量，如 `.bashrc` 或 `.zshrc`

  ```bash
  export LAUNCH_EDITOR=code
  ```

<br />

### VS Code + WSL (Windows)

- 在 `settings.json` 中添加配置

- 重启 VS Code（所有窗口关闭后生效）

```json
{
  // other config...

  "terminal.integrated.env.linux": {
    "EDITOR": "code"
  }
}
```

### WebStorm

- 只需在 shell 中设置绝对路径环境变量，如 `.bashrc` 或 `.zshrc`（仅 MacOS）

  ```bash
  export LAUNCH_EDITOR='/Applications/WebStorm.app/Contents/MacOS/webstorm'
  ```

**或者**

- 安装 WebStorm 命令行工具

- 然后在 shell 中设置环境变量，如 `.bashrc` 或 `.zshrc`

  ```bash
  export LAUNCH_EDITOR=webstorm
  ```

<br />

### PhpStorm

- 只需在 shell 中设置绝对路径环境变量，如 `.bashrc` 或 `.zshrc`（仅 MacOS）
  ```bash
  export LAUNCH_EDITOR='/Applications/PhpStorm.app/Contents/MacOS/phpstorm'
  ```

**或者**

- 安装 PhpStorm 命令行工具

- 然后在 shell 中设置环境变量，如 `.bashrc` 或 `.zshrc`
  ```bash
  export LAUNCH_EDITOR=phpstorm
  ```

<br />

### Vim

当然也可以使用 vim，只需在 shell 中设置环境变量

```bash
export LAUNCH_EDITOR=vim
```

<br />

## 💡 注意

- **[破坏性更改] 从 v1.0 开始，`enabled` 选项的默认值从 `true` 改为 `false`。**
- 仅在开发模式下工作。
- 目前不支持 `Template Engine（如 pug）`。

## 👨‍💻 编程式使用

你也可以通过访问 `__VUE_INSPECTOR__` 全局变量来编程式控制检查器。

```ts
import type { VueInspectorClient } from "vite-plugin-vue-inspector-ai";

const inspector: VueInspectorClient = window.__VUE_INSPECTOR__;

if (inspector) {
  // 启用检查器
  inspector.enable();
  // 或
  inspector.disable();
}
```

## 🚀 开发与发布

### 开发

```bash
# 安装依赖
pnpm install

# 构建核心包
cd packages/core
pnpm build
```

### 发布到 npm

1. **创建 npm Token**
   - 访问 [npm Access Tokens](https://www.npmjs.com/settings/-/tokens)
   - 创建一个新的 **Granular Access Token**，具有 read/write 权限

2. **在核心包中配置 `.npmrc`**

创建 `packages/core/.npmrc`:

```bash
registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=YOUR_NPM_TOKEN
```

3. **构建和发布**

```bash
# 更新 package.json 中的版本号
# 构建
cd packages/core
pnpm build

# 发布到 npm
cd packages/core
npm publish --access public
```

## 🌸 致谢

本项目灵感来自 [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector)。

部分实现参考了 [vite-plugin-svelte-inspector](https://github.com/sveltejs/vite-plugin-svelte/tree/main/packages/vite-plugin-svelte-inspector)。

基于 [vite-plugin-vue-inspector](https://github.com/webfansplz/vite-plugin-vue-inspector) 分支。

## 📄 许可证

[MIT LICENSE](./LICENSE)
