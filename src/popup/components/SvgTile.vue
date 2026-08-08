<script setup>
import { computed } from 'vue';
import { t } from '../../lib/i18n.js';

const props = defineProps({
  item: { type: Object, required: true },
  selected: { type: Boolean, default: false }
});

defineEmits(['toggle']);

const size = computed(() => {
  const { width, height } = props.item;
  return width && height ? `${Math.round(width)}×${Math.round(height)}` : t('sizeUnknown');
});
</script>

<template>
  <label class="tile" :class="{ on: selected }" :title="item.name">
    <input type="checkbox" :checked="selected" @change="$emit('toggle', item.url)" />
    <span class="preview">
      <img :src="item.url" :alt="item.alt" loading="lazy" />
    </span>
    <span class="name">{{ item.name }}</span>
    <span class="size">{{ size }}</span>
  </label>
</template>

<style scoped>
.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--tile);
  cursor: pointer;
  overflow: hidden;
}

.tile.on {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}

.tile input {
  position: absolute;
  top: 6px;
  left: 6px;
  margin: 0;
  accent-color: var(--accent);
}

.preview {
  height: 62px;
  padding: 6px;
  border-radius: 6px;
  overflow: hidden;
  background: repeating-conic-gradient(#00000010 0% 25%, transparent 0% 50%) 50% / 12px 12px;
}

.preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.name {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.size {
  font-size: 10px;
  color: var(--muted);
}
</style>
