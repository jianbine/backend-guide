<template>
  <div class="concept-card" :style="{ '--card-accent': accent }">
    <div class="card-icon">{{ icon }}</div>
    <div class="card-body">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-desc">{{ description }}</p>
      <div v-if="tags.length" class="card-tags">
        <span v-for="tag in tags" :key="tag" class="card-tag">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '💡' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: Array, default: () => [] },
  accent: { type: String, default: 'var(--color-accent)' },
})
</script>

<style scoped>
.concept-card {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  border-left: 3px solid var(--card-accent);
  transition: all 0.2s ease;
  margin: 1rem 0;
}

.concept-card:hover {
  border-color: var(--card-accent);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.card-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-primary);
  border-radius: 10px;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.375rem;
  color: var(--color-text-primary);
}

.card-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.625rem;
}

.card-tag {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  background: var(--color-accent-light);
  color: var(--color-accent-dark);
  border-radius: 4px;
  font-weight: 500;
}
</style>
