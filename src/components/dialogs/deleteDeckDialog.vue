<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { clearDeckDialogIsOpen, deck, lands } from "../../scripts/globalState";
import { focusOnInput } from "../../scripts/utilities";
import { LAND_TYPES } from "../../scripts/types";

function clearDeck() {
  deck.value = [];
  LAND_TYPES.forEach((key) => (lands[key] = 0));
  clearDeckDialogIsOpen.value = false;
}
</script>

<template>
    <Dialog
    v-model:visible="clearDeckDialogIsOpen"
    modal
    header="Are you sure you want to restart and clear your deck?"
    :style="{ width: '25em' }"
    :after-hide="focusOnInput()"
  >
    <template #footer>
      <Button severity="secondary" @click="clearDeckDialogIsOpen = false"
        >Cancel</Button
      >
      <Button severity="danger" @click="clearDeck">Clear Deck</Button>
    </template>
  </Dialog>
</template>
