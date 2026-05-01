<script lang="ts" setup>
import { onMounted } from "vue";

// Componets
import Toast from "primevue/toast";
import ProgressBar from "primevue/progressbar";

// Custom Components
import CardImage from "./components/cardImage.vue";
import IconCounter from "./components/iconCounter.vue";
import SideMenu from "./components/sideMenu.vue";
import CardInput from "./components/cardInput.vue";

// Lucid Icons
import { ClipboardCopy } from "lucide-vue-next";

import {
  cardNames,
  errorMsg,
  lands,
  latestCard,
  loading,
} from "./scripts/globalState";
import { landToChar } from "./scripts/utilities";
import { LAND_TYPES } from "./scripts/types";
import SwitchPrintingDialog from "./components/dialogs/switchPrintingDialog.vue";
import ViewDeckDialog from "./components/dialogs/viewDeckDialog.vue";
import DeleteDeckDialog from "./components/dialogs/deleteDeckDialog.vue";

// Get all MTG card names as an array
onMounted(async () => {
  const req = await fetch("https://api.scryfall.com/catalog/card-names");
  const json = await req.json();
  cardNames.value = json.data;
  loading.value = false;
});
</script>

<template>
  <ProgressBar
    v-if="loading"
    mode="indeterminate"
    style="height: 3px"
  ></ProgressBar>
  <div v-else class="wrapper">
    <Toast group="copy">
      <template #icon><ClipboardCopy></ClipboardCopy></template>
    </Toast>
    <Toast group="error"></Toast>
    <h1>Moxify</h1>
    <CardInput></CardInput>
    <p v-html="errorMsg" class="error-msg"></p>

    <div class="center">
      <!-- The basic land counters -->
      <div class="vert-menu">
        <IconCounter
          v-for="land in LAND_TYPES"
          v-model="lands[land]"
          :src="`https://svgs.scryfall.io/card-symbols/${landToChar(land)}.svg`"
        ></IconCounter>
      </div>
      <CardImage
        :src="latestCard ? latestCard.imgURL : null"
        :width="300"
        :class="{ foil: latestCard && latestCard.foil }"
      ></CardImage>
      <SideMenu></SideMenu>
    </div>
  </div>

  <SwitchPrintingDialog></SwitchPrintingDialog>
  <ViewDeckDialog></ViewDeckDialog>
  <DeleteDeckDialog></DeleteDeckDialog>
</template>

<style scoped>
.p-progressbar {
  border-radius: 0px;
}
h1 {
  font-size: 5em;
  color: var(--p-primary-color);
  margin-bottom: 10px;
  padding-bottom: 0px;
}
.error-msg {
  color: var(--p-red-400);
}
.wrapper {
  padding: 10px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  max-width: 800px;
}
.center {
  margin-left: auto;
  margin-right: auto;
  display: block;
  display: flex;
  justify-content: center;
  align-items: stretch;
}
.vert-menu {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin-left: 20px;
  margin-right: 20px;
  * {
    margin-top: 5px;
    margin-bottom: 5px;
  }
}

@media only screen and (max-width: 740px) {
  label {
    font-size: small;
  }
  h1 {
    font-size: 4em;
    margin-top: 10px;
  }
  .vert-menu {
    margin-left: 10px;
    margin-right: 10px;
  }
  .vert-menu:deep(.p-button) {
    width: 35px;
    height: 35px;
    padding: 7px;
  }
}
@media only screen and (max-width: 530px) {
  .vert-menu:deep(.p-button) {
    width: 25px;
    height: 25px;
    padding: 5px;
  }
}
</style>
