<template>
  <div class="env-setup">
    <div class="setup-header">
      <span class="setup-icon">🔧</span>
      <h3 class="setup-title">{{ title }}</h3>
    </div>
    <div class="steps">
      <div v-for="(step, index) in steps" :key="index" class="step">
        <div class="step-indicator">
          <div class="step-number">{{ index + 1 }}</div>
          <div v-if="index < steps.length - 1" class="step-line"></div>
        </div>
        <div class="step-content">
          <h4 class="step-title">{{ step.title }}</h4>
          <p v-if="step.description" class="step-desc">{{ step.description }}</p>
          <CodeBlock
            v-if="step.command"
            :code="step.command"
            language="bash"
            :filename="step.filename || ''"
          />
          <div v-if="step.tips" class="step-tips">
            <p v-for="(tip, i) in step.tips" :key="i" class="tip">💡 {{ tip }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CodeBlock from './CodeBlock.vue'

defineProps({
  title: { type: String, default: '环境搭建步骤' },
  steps: { type: Array, required: true },
})
</script>

<style scoped>
.env-setup {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.setup-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.setup-icon {
  font-size: 1.25rem;
}

.setup-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.step {
  display: flex;
  gap: 1rem;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.step-number {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--color-accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-line {
  width: 2px;
  flex: 1;
  background: var(--color-border);
  margin: 0.25rem 0;
}

.step-content {
  flex: 1;
  padding-bottom: 1.5rem;
}

.step:last-child .step-content {
  padding-bottom: 0;
}

.step-title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.375rem;
  color: var(--color-text-primary);
}

.step-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 0.75rem;
}

.step-tips {
  margin-top: 0.75rem;
}

.tip {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin: 0.25rem 0;
  padding: 0.375rem 0.75rem;
  background: var(--color-accent-light);
  border-radius: 6px;
}
</style>
