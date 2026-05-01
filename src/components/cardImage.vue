<script setup lang="ts">
import { ref, watch } from "vue";
import Skeleton from "primevue/skeleton";
const props = defineProps<{
  src: string | null;
  clickFunction?: Function;
  clickFunctionParams?: Array<any>;
}>();
const loaded = ref(false);

function runClickFunction() {
  if (props.clickFunction) {
    props.clickFunction(...(props.clickFunctionParams || []));
  }
}
watch(
  () => props.src,
  () => {
    loaded.value = false;
  },
);
</script>

<template>
  <div>
    <Skeleton v-if="src && !loaded" height="'auto'"></Skeleton>
    <img
      :class="{ pointer: clickFunction }"
      :src="src || undefined"
      v-show="src && loaded"
      @load="loaded = true"
      @click="runClickFunction"
    />
  </div>
</template>

<style scoped>
div {
  aspect-ratio: 2.5 / 3.5;
  height: auto;
  background-color: var(--p-surface-800);
  border-radius: 4%;
  overflow: hidden;
}
img,
skeleton {
  width: 100%;
  height: 100%;
}
.pointer {
  cursor: pointer;
}
</style>
