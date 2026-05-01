<script setup lang="ts">
const model = defineModel({ default: 0 });
import InputNumber from "primevue/inputnumber";
const props = defineProps<{ src: string }>();
</script>

<template>
  <div class="background" @click="model++">
    <img :src="props.src" />
    <InputNumber v-model="model" class="input" @click.stop>{{
      model
    }}</InputNumber>
  </div>
</template>

<style scoped>
.background {
  width: 100px;
  height: 42px;
  border-radius: 25px;
  background-color: var(--p-surface-950);
  border: 1px solid var(--p-surface-700);
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

img {
  height: 35px;
  margin-left: 3px;
}
:deep() .p-inputtext {
  width: 40px;
  background-color: transparent;
  border: transparent;
  font-size: 28px;
  padding: 0px;
  border-radius: 0 17.5px 17.5px 0;
  margin-right:3px;

  :hover {
    outline: 1px solid var(--p-primary-500);
  }
}

@media only screen and (max-width: 740px) {
  .background {
    width: 83.3px;
    height: 35px;
    border-radius: 20.8px;
  }

  img {
    height: 29.1px;
    margin-left: 2px;
  }
:deep() .p-inputtext {
  margin-right:2px;
    width: 33.3px;
    font-size: 25px;
  }
}
@media only screen and (max-width: 500px) {
  .background {
    width: 50px;
    height: 21px;
    border-radius: 12.5px;
  }

  img {
    height: 17.5px;
    margin-left: 1px;
  }
:deep() .p-inputtext {
  margin-right: 1px;
    width: 20px;
    font-size: 15px;
  }
}
</style>
