<script>
import inspectorOptions from "virtual:vue-inspector-options";

const base = inspectorOptions.base;
const KEY_DATA = "data-v-inspector";
const KEY_IGNORE = "data-v-inspector-ignore";
const KEY_PROPS_DATA = "__v_inspector";

function getData(el) {
  return (
    el?.__vnode?.props?.[KEY_PROPS_DATA] ??
    getComponentData(el) ??
    el?.getAttribute?.(KEY_DATA)
  );
}

function getComponentData(el) {
  const ctxVNode = el?.__vnode?.ctx?.vnode;
  if (ctxVNode?.el === el) return ctxVNode?.props?.[KEY_PROPS_DATA];
}

export default {
  name: "VueInspectorOverlay",
  data() {
    return {
      manualEnabled: inspectorOptions.enabled,
      holdEnabled: false,
      disableInspectorOnEditorOpen:
        inspectorOptions.disableInspectorOnEditorOpen,
      overlayVisible: false,
      position: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      linkParams: {
        file: "",
        line: 0,
        column: 0,
      },
      KEY_IGNORE,
      animation: !inspectorOptions.reduceMotion,
      toast: {
        visible: false,
        type: "success",
        message: "",
      },
      toastTimer: null,
    };
  },
  computed: {
    enabled() {
      return this.manualEnabled || this.holdEnabled;
    },
    activationKeyLabel() {
      return this.isMacPlatform() ? "Cmd" : "Ctrl";
    },
    containerVisible() {
      const { toggleButtonVisibility } = inspectorOptions;
      return (
        toggleButtonVisibility === "always" ||
        (toggleButtonVisibility === "active" && this.enabled)
      );
    },
    containerPosition() {
      return inspectorOptions.toggleButtonPos
        .split("-")
        .map((p) => `${p}: 15px;`)
        .join("");
    },
    bannerPosition() {
      const [x, y] = inspectorOptions.toggleButtonPos.split("-");
      return {
        [x === "top" ? "bottom" : "top"]: "calc(100% + 8px)",
        [y]: 0,
      };
    },
    floatsStyle() {
      const margin = 10;
      let x = this.position.x + this.position.width / 2;
      let y = this.position.y + this.position.height + 8;
      const floatsRef = this.$refs.floatsRef;
      const floatsWidth = floatsRef?.clientWidth ?? 0;
      const floatsHeight = floatsRef?.clientHeight ?? 0;

      x = Math.max(margin + floatsWidth / 2, x);
      x = Math.min(x, window.innerWidth - floatsWidth / 2 - margin);
      y = Math.max(margin, y);
      y = Math.min(y, window.innerHeight - floatsHeight - margin);

      return {
        left: `${x}px`,
        top: `${y}px`,
      };
    },
    sizeIndicatorStyle() {
      return {
        left: `${this.position.x}px`,
        top: `${this.position.y}px`,
        width: `${this.position.width}px`,
        height: `${this.position.height}px`,
      };
    },
    bannerTip() {
      return `Hold ${this.activationKeyLabel} to inspect. Click the badge for sticky mode.`;
    },
    floatsTip() {
      return this.manualEnabled
        ? `Click to copy. ${this.activationKeyLabel}+Click opens IDE.`
        : "Click to copy component location.";
    },
  },
  watch: {
    enabled: {
      handler(val, oldVal) {
        if (val === oldVal) return;
        this.toggleEventListener();
        if (val) this.onEnabled();
        else {
          this.closeOverlay();
          this.onDisabled();
        }
      },
    },
  },
  mounted() {
    document.body.addEventListener("keydown", this.onKeydown);
    document.body.addEventListener("keyup", this.onKeyup);
    window.addEventListener("blur", this.resetHoldActivation);
    this.toggleEventListener();
    window.__VUE_INSPECTOR__ = this;
  },
  beforeUnmount() {
    document.body.removeEventListener("keydown", this.onKeydown);
    document.body.removeEventListener("keyup", this.onKeyup);
    window.removeEventListener("blur", this.resetHoldActivation);
    document.body.removeEventListener("mousemove", this.updateLinkParams);
    document.body.removeEventListener("click", this.handleClick, true);
    window.removeEventListener("resize", this.closeOverlay, true);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  },
  methods: {
    toggleEventListener() {
      const listener = this.enabled
        ? document.body.addEventListener
        : document.body.removeEventListener;

      listener?.call(document.body, "mousemove", this.updateLinkParams);
      listener?.call(document.body, "click", this.handleClick, true);
      listener?.call(window, "resize", this.closeOverlay, true);
    },
    toggleEnabled() {
      this.manualEnabled = !this.manualEnabled;
      if (!this.enabled) this.closeOverlay();
    },
    onKeydown(event) {
      this.holdEnabled = this.isInspectModifierPressed(event);
    },
    onKeyup(event) {
      this.holdEnabled = this.isInspectModifierPressed(event);
      if (!this.enabled) this.closeOverlay();
    },
    resetHoldActivation() {
      this.holdEnabled = false;
      if (!this.enabled) this.closeOverlay();
    },
    isMacPlatform() {
      return /Mac|iPhone|iPod|iPad/i.test(navigator.platform || "");
    },
    isInspectModifierPressed(event) {
      return this.isMacPlatform() ? event.metaKey : event.ctrlKey;
    },
    getTargetNode(e) {
      const splitRE = /(.+):([\d]+):([\d]+)(?:-(\d+))?$/;
      const path = e.path ?? e.composedPath?.();
      if (!path) {
        return {
          targetNode: null,
          params: null,
        };
      }
      const ignoreIndex = path.findIndex((node) =>
        node?.hasAttribute?.(KEY_IGNORE),
      );
      const targetNode = path
        .slice(ignoreIndex + 1)
        .find((node) => getData(node));
      if (!targetNode) {
        return {
          targetNode: null,
          params: null,
        };
      }
      const match = getData(targetNode)?.match(splitRE);
      const [_, file, line, column, endLine] = match || [];
      return {
        targetNode,
        params: match
          ? {
              file,
              line,
              column,
              endLine: endLine || line,
              title: file,
            }
          : null,
      };
    },
    handleClick(e) {
      const { targetNode, params } = this.getTargetNode(e);
      if (!targetNode) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const { file, line, column, endLine } = params;
      this.overlayVisible = false;

      const clipboardText = `Vue组件: ${file} | 起始行: ${line} | 结束行: ${endLine}\n`;
      navigator.clipboard
        .writeText(clipboardText)
        .then(() => {
          this.showToast("已复制组件位置信息");
        })
        .catch((err) => {
          this.showToast("复制失败，请检查剪贴板权限", "error");
          console.error("[Vue Inspector] Failed to copy to clipboard:", err);
        });

      const shouldOpenEditor =
        this.manualEnabled && (e.ctrlKey || e.metaKey);
      if (shouldOpenEditor) {
        const url = new URL(
          `${base}__open-in-editor?file=${encodeURIComponent(`${file}:${line}:${column}`)}`,
          import.meta.url,
        );
        this.openInEditor(url);
      }
    },
    updateLinkParams(e) {
      const { targetNode, params } = this.getTargetNode(e);
      if (targetNode) {
        const rect = targetNode.getBoundingClientRect();
        this.overlayVisible = true;
        this.position.x = rect.x;
        this.position.y = rect.y;
        this.position.width = rect.width;
        this.position.height = rect.height;
        this.linkParams = params;
      } else {
        this.closeOverlay();
      }
      this.onUpdated();
    },
    closeOverlay() {
      this.overlayVisible = false;
      this.linkParams = {
        file: "",
        line: 0,
        column: 0,
      };
    },
    enable() {
      if (this.manualEnabled) return;
      this.manualEnabled = true;
    },
    disable() {
      if (!this.manualEnabled) return;
      this.manualEnabled = false;
      if (!this.enabled) this.closeOverlay();
    },
    showToast(message, type = "success") {
      this.toast.visible = true;
      this.toast.message = message;
      this.toast.type = type;
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = window.setTimeout(() => {
        this.toast.visible = false;
      }, 1800);
    },
    openInEditor(baseUrl, file, line, column) {
      const _url =
        baseUrl instanceof URL
          ? baseUrl
          : `${baseUrl}/__open-in-editor?file=${encodeURIComponent(`${file}:${line}:${column}`)}`;
      const promise = fetch(_url, {
        mode: "no-cors",
      });

      if (this.disableInspectorOnEditorOpen) promise.then(() => this.disable());

      return promise;
    },
    onUpdated() {},
    onEnabled() {},
    onDisabled() {},
  },
};
</script>

<template>
  <div v-bind="{ [KEY_IGNORE]: 'true' }">
    <div
      v-if="containerVisible"
      class="vue-inspector-container"
      :style="containerPosition"
      :class="{ 'vue-inspector-container--disabled': !enabled }"
    >
      <button
        type="button"
        class="vue-inspector-trigger"
        @click.prevent.stop="toggleEnabled"
      >
        <span class="vue-inspector-dot" :class="{ 'is-active': enabled }" />
        <span>Inspector AI</span>
      </button>
      <a
        :style="bannerPosition"
        class="vue-inspector-banner vue-inspector-card"
        href="https://github.com/aifuqiang02/vite-plugin-vue-inspector-ai"
        target="_blank"
        rel="noreferrer"
      >
        <div>vite-plugin-vue-inspector-ai</div>
        <div class="tip">{{ bannerTip }}</div>
      </a>
    </div>
    <template v-if="overlayVisible && linkParams.file">
      <div
        ref="floatsRef"
        class="vue-inspector-floats vue-inspector-card"
        :class="[{ 'vue-inspector-animated': animation }]"
        :style="floatsStyle"
      >
        <div>
          {{ linkParams.title }}:{{ linkParams.line }}:{{ linkParams.column }}
        </div>
        <div class="tip">{{ floatsTip }}</div>
      </div>
      <div
        class="vue-inspector-size-indicator"
        :class="[{ 'vue-inspector-animated': animation }]"
        :style="sizeIndicatorStyle"
      />
    </template>
    <div
      v-if="toast.visible"
      class="vue-inspector-toast vue-inspector-card"
      :class="{ 'vue-inspector-toast--error': toast.type === 'error' }"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
.vue-inspector-container {
  position: fixed;
  z-index: 2147483647;
  font-family: Arial, Helvetica, sans-serif;
}

.vue-inspector-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  padding: 8px 12px;
  color: #f5f7f9;
  background: rgba(16, 24, 40, 0.92);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.25);
  cursor: pointer;
}

.vue-inspector-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #d0d5dd;
}

.vue-inspector-dot.is-active {
  background: #42b883;
  box-shadow: 0 0 0 4px rgba(66, 184, 131, 0.18);
}

.vue-inspector-card {
  font-family: Arial, Helvetica, sans-serif;
  padding: 8px 10px;
  border-radius: 10px;
  text-align: left;
  color: #f8fafc;
  font-size: 13px;
  line-height: 1.4;
  background: rgba(15, 23, 42, 0.94);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.22);
  backdrop-filter: blur(10px);
}

.vue-inspector-card .tip {
  margin-top: 4px;
  color: rgba(226, 232, 240, 0.82);
  font-size: 11px;
}

.vue-inspector-banner {
  display: none;
  position: absolute;
  width: 280px;
  text-decoration: none;
}

.vue-inspector-container:hover .vue-inspector-banner {
  display: block;
}

.vue-inspector-floats {
  z-index: 2147483647;
  position: fixed;
  transform: translateX(-50%);
  pointer-events: none;
}

.vue-inspector-size-indicator {
  z-index: 2147483646;
  position: fixed;
  background-color: rgba(66, 184, 131, 0.14);
  border: 1px solid rgba(66, 184, 131, 0.65);
  border-radius: 8px;
  pointer-events: none;
}

.vue-inspector-toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 2147483647;
  transform: translateX(-50%);
  pointer-events: none;
}

.vue-inspector-toast--error {
  background: rgba(185, 28, 28, 0.94);
}

.vue-inspector-animated {
  transition: all 0.1s ease-in;
}

@media (prefers-reduced-motion) {
  .vue-inspector-animated {
    transition: none !important;
  }
}
</style>

