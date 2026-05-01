<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import CardImage from "../cardImage.vue";

import { cardSwitchDialogIsOpen, errorMsg, latestCard } from '../../scripts/globalState';
import { cardFromData, focusOnInput } from '../../scripts/utilities';
import { ref } from "vue";
import { CardData } from "../../scripts/types";

const switchCards = ref<CardData[] | null>(null);

// Switches a print of the top card
function switchPrint(set: string, collection_number: string, imgURL: string) {
  if (latestCard.value) {
    latestCard.value.set = set;
    latestCard.value.collector_number = collection_number;
    latestCard.value.imgURL = imgURL;
  }
  cardSwitchDialogIsOpen.value = false;
}

// Opens card print swapping dialog
async function openCardSwitchDialog() {
  if (!latestCard.value) return;
  let hasNextPage = true;
  let nextPage = latestCard.value.switch_url;
  switchCards.value = [];
  while (hasNextPage) {
    let response = await fetch(nextPage);
    if (!response.ok) {
      errorMsg.value = "A loading error occurred";
      return;
    }
    const cardData = await response.json();
    hasNextPage = cardData.has_more;
    nextPage = cardData.next_page;
    const promises = await cardData.data.map(
      async (data: any) =>
        await cardFromData(
          data,
          latestCard.value !== null && latestCard.value.foil,
          true, // Should be able to switch printings
        ),
    );
    Promise.all(promises).then((values) => {
      if (switchCards.value) switchCards.value.push(...values);
    });
  }
}

</script>

<template>
    <Dialog
    v-model:visible="cardSwitchDialogIsOpen"
    modal
    header="Select Your Printing"
    :style="{ maxWidth: '80%' }"
    @after-hide="focusOnInput()"
    @show="openCardSwitchDialog"
  >
    <div class="card-flex">
      <CardImage
        v-for="card in switchCards"
        :src="card.imgURL"
        :clickFunction="switchPrint"
        :clickFunctionParams="[card.set, card.collector_number, card.imgURL]"
        :width="160"
      ></CardImage>
    </div>
    <template #footer>
      <Button severity="secondary" @click="cardSwitchDialogIsOpen = false"
        >Cancel</Button
      >
    </template>
  </Dialog>
    </template>