<script setup lang="ts">
import { defineModel } from "vue"
const model = defineModel({ default: 0 })
import InputNumber from 'primevue/inputnumber';
const props = defineProps<{ src: string }>()
</script>


<template>
  
  <div class="background" @click="model++">
    <img :src="props.src">
    <InputNumber v-model="model" class="input" @click.stop>{{ model }}</InputNumber>
  </div>

</template>

<style scoped>
.background {
    width:100px;
    height:42px;
    border-radius:25px;
    background-color: var(--p-surface-800);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

img {
    height:35px;
    margin-left:5px;
}
.input, .input * {
    width:40px;
    background-color: transparent;
    border:transparent;
    font-size:30px;
    padding:0px;
    margin:0px;

    :hover {
        border:1px solid blue;
    }
}
</style>
