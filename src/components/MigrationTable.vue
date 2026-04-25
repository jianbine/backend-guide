<template>
  <div class="migration-table-wrapper">
    <div class="table-header">
      <span class="table-icon">🔀</span>
      <h3 class="table-title">{{ title }}</h3>
    </div>
    <div class="table-container">
      <table class="migration-table">
        <thead>
          <tr>
            <th class="node-col">
              <span class="col-dot node-dot"></span>
              Node.js
            </th>
            <th class="arrow-col">→</th>
            <th class="java-col">
              <span class="col-dot java-dot"></span>
              Spring Boot
            </th>
            <th v-if="hasNotes" class="note-col">说明</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in data" :key="index">
            <td class="node-col">
              <code>{{ row.node }}</code>
            </td>
            <td class="arrow-col">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </td>
            <td class="java-col">
              <code>{{ row.java }}</code>
            </td>
            <td v-if="hasNotes" class="note-col">
              <span v-if="row.note" class="note-text">{{ row.note }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '知识迁移对照表' },
  data: { type: Array, required: true },
})

const hasNotes = computed(() => props.data.some(row => row.note))
</script>

<style scoped>
.migration-table-wrapper {
  margin: 1.5rem 0;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  background: var(--color-bg-secondary);
}

.table-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-primary);
}

.table-icon {
  font-size: 1.25rem;
}

.table-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.table-container {
  overflow-x: auto;
}

.migration-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.migration-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.migration-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.migration-table tr:last-child td {
  border-bottom: none;
}

.migration-table tr:hover td {
  background: var(--color-bg-primary);
}

.node-col { width: 35%; }
.java-col { width: 35%; }
.arrow-col { width: 40px; text-align: center; }
.note-col { width: 30%; }

.col-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
  vertical-align: middle;
}

.node-dot { background: var(--color-node); }
.java-dot { background: var(--color-java); }

.migration-table code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  padding: 0.125rem 0.5rem;
  background: var(--color-bg-code);
  color: #e2e8f0;
  border-radius: 4px;
  white-space: nowrap;
}

.note-text {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}
</style>
