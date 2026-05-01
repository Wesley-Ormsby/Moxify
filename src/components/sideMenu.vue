<script setup lang="ts">
import Button from "primevue/button";
import {
  Sparkle,
  Trash2,
  ArrowRightLeft,
  LayoutGrid,
  ClipboardCopy,
  RotateCcw,
} from "lucide-vue-next";
import {
  cardSwitchDialogIsOpen,
  clearDeckDialogIsOpen,
  deck,
  lands,
  latestCard,
  viewDeckDialogIsOpen,
} from "../scripts/globalState";
import { computed } from "vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const hasDeck = computed(
  () =>
    !!(latestCard.value || Object.values(lands).some((amount) => amount != 0)),
);

// Copy the deck
function copyDeck() {
  let txt = "";
  deck.value.forEach((card) => {
    txt += `1 ${card.name} (${card.set}) ${card.collector_number} ${
      card.foil ? "*f*" : ""
    }\n`;
  });
  for (var [key, value] of Object.entries(lands)) {
    if (value) txt += `${value} ${key}\n`;
  }
  navigator.clipboard.writeText(txt).then(
    function () {
      showToast("Copied", "Your deck has been copied", "copy");
    },
    function (err) {
      showToast(
        "Could Not Copy Text",
        "See the developer tools console for details",
        "error",
      );
      console.log(txt);
      console.log(err);
    },
  );
}

function showToast(head: string, msg: string, group: string) {
  let severity: "error" | "secondary" = "secondary";
  if (group === "error") {
    severity = "error";
  }
  toast.add({
    severity,
    summary: head,
    detail: msg,
    life: 3000,
    group,
  });
}
</script>

<template>
  <div class="vert-menu">
    <Button
      :class="{ foil: latestCard && latestCard.foil }"
      :disabled="!latestCard || !latestCard.switchableFoil"
      @click="latestCard && (latestCard.foil = !latestCard.foil)"
      v-tooltip="{
        value: 'Toggle Card Foilty',
        showDelay: 1000,
        hideDelay: 300,
        disabled: !latestCard || !latestCard.switchableFoil,
      }"
    >
      <Sparkle></Sparkle>
    </Button>
    <Button
      :disabled="!latestCard"
      @click="deck.pop()"
      v-tooltip="{
        value: 'Remove Card',
        showDelay: 1000,
        hideDelay: 300,
        disabled: !latestCard,
      }"
    >
      <Trash2></Trash2>
    </Button>
    <Button
      :disabled="!latestCard || !latestCard.hasOtherPrints"
      @click="cardSwitchDialogIsOpen = true"
      v-tooltip="{
        value: 'Switch Card Printing',
        showDelay: 1000,
        hideDelay: 300,
        disabled: !latestCard,
      }"
    >
      <ArrowRightLeft></ArrowRightLeft>
    </Button>
    <Button
      :disabled="!latestCard"
      @click="viewDeckDialogIsOpen = true"
      v-tooltip="{
        value: 'View Deck',
        showDelay: 1000,
        hideDelay: 300,
        disabled: !latestCard,
      }"
    >
      <LayoutGrid></LayoutGrid>
    </Button>
    <Button
      :disabled="!hasDeck"
      @click="copyDeck"
      v-tooltip="{
        value: 'Copy Deck',
        showDelay: 1000,
        hideDelay: 300,
        disabled: !hasDeck,
      }"
    >
      <ClipboardCopy></ClipboardCopy>
    </Button>
    <Button
      :disabled="!hasDeck"
      @click="clearDeckDialogIsOpen = true"
      v-tooltip="{
        value: 'Clear Deck',
        showDelay: 1000,
        hideDelay: 300,
        disabled: !hasDeck,
      }"
    >
      <RotateCcw></RotateCcw>
    </Button>
  </div>
</template>

<style lang="css" scoped></style>
