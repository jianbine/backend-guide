<template>
  <div class="mindmap-container">
    <div ref="svgRef" class="mindmap-svg"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import { loadCSS, loadJS } from 'markmap-common'

const props = defineProps({
  markdown: { type: String, required: true },
})

const svgRef = ref(null)
let markmapInstance = null

onMounted(async () => {
  if (svgRef.value && props.markdown) {
    await renderMindmap()
  }
})

watch(() => props.markdown, async () => {
  if (svgRef.value && props.markdown) {
    await renderMindmap()
  }
})

onBeforeUnmount(() => {
  if (markmapInstance) {
    markmapInstance.destroy()
    markmapInstance = null
  }
})

async function renderMindmap() {
  const transformer = new Transformer()
  const { root } = transformer.transform(props.markdown)

  if (markmapInstance) {
    markmapInstance.setData(root)
    markmapInstance.fit()
  } else {
    const { styles, scripts } = transformer.getUsedAssets()
    if (styles) loadCSS(styles)
    if (scripts) await loadJS(scripts)

    markmapInstance = Markmap.create(svgRef.value, {
      autoFit: true,
      duration: 300,
      maxWidth: 280,
      color: (node) => {
        const colors = ['#0d9488', '#e76f00', '#68a063', '#8b5cf6', '#ec4899', '#f59e0b']
        return colors[node.state?.depth % colors.length]
      },
    }, root)
  }
}
</script>

<style scoped>
.mindmap-container {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  margin: 1.5rem 0;
  background: var(--color-bg-secondary);
}

.mindmap-svg {
  width: 100%;
  height: 400px;
}

.mindmap-svg :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
