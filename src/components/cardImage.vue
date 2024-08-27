<script setup lang="ts">
import { ref, onMounted, watch, type Ref } from "vue"
import Skeleton from 'primevue/skeleton';
const props = defineProps<{ src: string|null, width:number, clickFunction?:Function, clickFunctionParms?:Array<any>}>()
const loaded = ref(false)
const div: Ref<null|HTMLElement> = ref(null)
onMounted(() => {
    if(div.value) div.value.style.setProperty("--width", props.width + "px");
})

function runClickFunction() {
    if(props.clickFunction) {
        props.clickFunction(...(props.clickFunctionParms || []))
    }
}
watch(() => props.src,
  () => {
    loaded.value = false;
  })
</script>


<template>
  <div ref="div">
    <Skeleton v-show="src===null || !loaded" height="'auto'"></Skeleton>
    <img :src="src || undefined" v-show="src && loaded" @load="loaded=true" @click="runClickFunction">
  </div>
  

</template>

<style scoped>
div {
    --width:300px;
    width:var(--width);
    aspect-ratio: 2.5 / 3.5;
    height:auto;
}
img, skeleton {
    width:100%;
    height:100%;
}
</style>
