<template>
  <div class="code-block" :class="{ 'has-filename': filename }">
    <div v-if="filename || language || showCopy" class="code-header">
      <span v-if="filename" class="code-filename">{{ filename }}</span>
      <span v-else-if="language" class="code-language">{{ language }}</span>
      <button v-if="showCopy" class="copy-btn" @click="copyCode" :title="copied ? '已复制' : '复制代码'">
        <svg v-if="!copied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
    </div>
    <pre><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { codeToHtml } from 'shiki'

const props = defineProps({
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  filename: { type: String, default: '' },
  showCopy: { type: Boolean, default: true },
})

const copied = ref(false)

const highlightedCode = computed(async () => {
  try {
    return await codeToHtml(props.code, {
      lang: props.language,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    })
  } catch {
    return props.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
})

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = props.code
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<style scoped>
.code-block {
  border-radius: 12px;
  overflow: hidden;
  margin: 1.25rem 0;
  background: var(--color-bg-code);
  border: 1px solid var(--color-border);
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.code-filename,
.code-language {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.copy-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.copy-btn:hover {
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.1);
}

.code-block pre {
  margin: 0;
  border-radius: 0;
  padding: 1.25rem;
  overflow-x: auto;
}

.code-block pre code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.7;
}
</style>
