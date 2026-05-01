<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import CardImage from "../cardImage.vue";
import { deck, viewDeckDialogIsOpen } from "../../scripts/globalState";
import { focusOnInput } from "../../scripts/utilities";

// Removes a card at the given index
function removeCardAtIndex(index: number) {
  if (deck.value) deck.value.splice(index, 1);
  if (deck.value.length === 0) {
    viewDeckDialogIsOpen.value = false;
  }
}
</script>

<template>
  <Dialog
    v-model:visible="viewDeckDialogIsOpen"
    modal
    header="Click A Card To Remove It From Your Deck"
    :style="{ maxWidth: '80%' }"
    @after-hide="focusOnInput()"
  >
    <div class="card-flex">
      <CardImage
        v-for="(card, i) in deck"
        :src="card.imgURL"
        :clickFunction="removeCardAtIndex"
        :clickFunctionParams="[i]"
        :width="160"
      ></CardImage>
    </div>
    <template #footer>
      <Button severity="secondary" @click="viewDeckDialogIsOpen=false">Cancel</Button>
    </template>
  </Dialog>
</template>
