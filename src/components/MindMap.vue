<template>
  <div class="mindmap-container">
    <div class="mindmap-header">
      <span class="mindmap-label">🗺️ 知识结构图</span>
    </div>
    <div class="mindmap-tree">
      <ul class="tree-root">
        <TreeItem
          v-for="(node, index) in treeData"
          :key="index"
          :node="node"
          :depth="0"
        />
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, h, defineComponent, ref, onMounted } from 'vue'

const props = defineProps({
  markdown: { type: String, required: true },
})

function parseMarkdown(md) {
  const lines = md.split('\n').filter(l => l.trim())
  const root = { content: '', children: [], level: 0 }
  const stack = [root]

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (!match) continue
    const level = match[1].length
    const content = match[2].trim()
    const node = { content, children: [], level }

    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop()
    }
    stack[stack.length - 1].children.push(node)
    stack.push(node)
  }

  return root.children
}

const treeData = computed(() => parseMarkdown(props.markdown))

const expandedSet = ref(new Set())

function toggleExpand(content) {
  if (expandedSet.value.has(content)) {
    expandedSet.value.delete(content)
  } else {
    expandedSet.value.add(content)
  }
}

function isExpanded(content) {
  return expandedSet.value.has(content)
}

const TreeItem = defineComponent({
  name: 'TreeItem',
  props: {
    node: { type: Object, required: true },
    depth: { type: Number, default: 0 },
  },
  setup(nodeProps) {
    const hasChildren = computed(() => nodeProps.node.children && nodeProps.node.children.length > 0)
    const expanded = computed(() => isExpanded(nodeProps.node.content))

    return () => {
      const children = []
      if (hasChildren.value && expanded.value) {
        children.push(
          h('ul', { class: 'tree-children' },
            nodeProps.node.children.map((child, i) =>
              h(TreeItem, { node: child, depth: nodeProps.depth + 1, key: i })
            )
          )
        )
      }

      return h('li', { class: 'tree-item' }, [
        h('div', {
          class: [
            'tree-node',
            `depth-${Math.min(nodeProps.depth, 3)}`,
            { 'has-children': hasChildren.value, 'is-expanded': expanded.value },
          ],
          onClick: () => { if (hasChildren.value) toggleExpand(nodeProps.node.content) },
        }, [
          hasChildren.value
            ? h('span', { class: ['tree-toggle', { expanded: expanded.value }] },
                expanded.value ? '▾' : '▸')
            : h('span', { class: 'tree-dot' }),
          h('span', { class: 'tree-text' }, nodeProps.node.content),
          hasChildren.value
            ? h('span', { class: 'tree-count' }, String(nodeProps.node.children.length))
            : null,
        ]),
        ...children,
      ])
    }
  },
})

onMounted(() => {
  function collectAll(nodes) {
    for (const n of nodes) {
      if (n.children && n.children.length) {
        expandedSet.value.add(n.content)
        collectAll(n.children)
      }
    }
  }
  collectAll(treeData.value)
})
</script>

<style>
/* NOT scoped — recursive component needs global styles */
.mindmap-container {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  margin: 1.5rem 0;
  background: var(--color-bg-secondary);
}

.mindmap-header {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-primary);
}

.mindmap-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.mindmap-tree {
  padding: 1rem 1.25rem;
  overflow-x: auto;
}

.tree-root,
.tree-children {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tree-children {
  padding-left: 1.5rem;
  margin-left: 0.75rem;
  border-left: 2px solid var(--color-accent);
}

.tree-item {
  position: relative;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.625rem;
  border-radius: 6px;
  transition: background 0.15s;
  cursor: default;
}

.tree-node.has-children {
  cursor: pointer;
}

.tree-node.has-children:hover {
  background: var(--color-bg-primary);
}

.tree-toggle {
  color: var(--color-text-muted);
  font-size: 0.7rem;
  flex-shrink: 0;
  width: 1rem;
  text-align: center;
  transition: transform 0.2s;
}

.tree-toggle.expanded {
  color: var(--color-accent);
}

.tree-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-border);
  flex-shrink: 0;
}

.tree-text {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  line-height: 1.5;
}

.tree-count {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0 0.375rem;
  line-height: 1.5;
  flex-shrink: 0;
}

/* Depth 0 — root level */
.depth-0 > .tree-text {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.depth-0 > .tree-toggle {
  color: var(--color-accent);
}

.depth-0 > .tree-count {
  background: var(--color-accent-light);
  color: var(--color-accent-dark);
  border-color: transparent;
}

/* Depth 1 — main categories */
.depth-1 > .tree-text {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.875rem;
}

.depth-1 > .tree-dot {
  background: var(--color-accent);
}

/* Depth 2 — sub items */
.depth-2 > .tree-dot {
  background: var(--color-java);
}

.depth-2 > .tree-text {
  font-weight: 500;
}

/* Depth 3 — leaf items */
.depth-3 > .tree-text {
  font-weight: 400;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.depth-3 > .tree-dot {
  background: var(--color-text-muted);
  opacity: 0.4;
}
</style>
