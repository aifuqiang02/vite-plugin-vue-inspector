# AGENTS.md

## 发布说明

后续只更新 `vite-plugin-vue-inspector-ai` 包，不更新 `unplugin-vue-inspector`。

### 发布命令

```bash
# 1. 构建
cd packages/core && pnpm build

# 2. 发布
cd packages/core && npm publish --access public
```

### 版本号

- 核心包：`packages/core/package.json` 中的 `version` 字段
- 发布前手动递增版本号
