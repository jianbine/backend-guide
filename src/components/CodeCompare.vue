<template>
  <div class="code-compare">
    <div class="compare-header">
      <div class="compare-tab node-tab">
        <span class="tab-dot node-dot"></span>
        <span>{{ nodeTitle }}</span>
      </div>
      <div class="compare-tab java-tab">
        <span class="tab-dot java-dot"></span>
        <span>{{ javaTitle }}</span>
      </div>
    </div>
    <div class="compare-body">
      <div class="compare-panel node-panel">
        <CodeBlock
          :code="nodeCode"
          :language="nodeLang"
          :filename="nodeFilename"
        />
      </div>
      <div class="compare-divider">
        <div class="divider-line"></div>
        <div class="divider-icon">⇄</div>
        <div class="divider-line"></div>
      </div>
      <div class="compare-panel java-panel">
        <CodeBlock
          :code="javaCode"
          :language="javaLang"
          :filename="javaFilename"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import CodeBlock from './CodeBlock.vue'

defineProps({
  nodeCode: { type: String, required: true },
  javaCode: { type: String, required: true },
  nodeTitle: { type: String, default: 'Node.js' },
  javaTitle: { type: String, default: 'Spring Boot' },
  nodeLang: { type: String, default: 'javascript' },
  javaLang: { type: String, default: 'java' },
  nodeFilename: { type: String, default: '' },
  javaFilename: { type: String, default: '' },
})
</script>

<style scoped>
.code-compare {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  margin: 1.5rem 0;
  background: var(--color-bg-secondary);
}

.compare-header {
  display: flex;
  border-bottom: 1px solid var(--color-border);
}

.compare-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: var(--font-mono);
}

.node-tab {
  background: var(--color-node-bg);
  color: var(--color-node);
  border-right: 1px solid var(--color-border);
}

.java-tab {
  background: var(--color-java-bg);
  color: var(--color-java);
}

.tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.node-dot { background: var(--color-node); }
.java-dot { background: var(--color-java); }

.compare-body {
  display: flex;
}

.compare-panel {
  flex: 1;
  min-width: 0;
}

.compare-panel :deep(.code-block) {
  margin: 0;
  border: none;
  border-radius: 0;
}

.compare-panel :deep(pre) {
  border-radius: 0;
  margin: 0;
}

.compare-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
  background: var(--color-border);
  min-width: 2rem;
}

.divider-line {
  flex: 1;
  width: 1px;
  background: var(--color-border);
}

.divider-icon {
  padding: 0.5rem 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  background: var(--color-bg-secondary);
  border-radius: 4px;
}

/* ===== Responsive ===== */
@media (max-width: 767px) {
  .compare-body {
    flex-direction: column;
  }

  .compare-divider {
    flex-direction: row;
    padding: 0.25rem 0;
    min-height: 2rem;
  }

  .divider-line {
    height: 1px;
    width: auto;
    flex: 1;
  }
}
</style>
