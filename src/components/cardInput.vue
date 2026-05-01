<script lang="ts" setup>
import InputGroup from "primevue/inputgroup";
import InputText from "primevue/inputtext";
import Listbox from "primevue/listbox";
import Button from "primevue/button";
import { Search } from "lucide-vue-next";
import {
  cardNames,
  cardSwitchDialogIsOpen,
  deck,
  errorMsg,
  lands,
} from "../scripts/globalState";
import { computed, nextTick, onMounted, ref } from "vue";
import { cardFromData, charToLand, focusOnInput } from "../scripts/utilities";
import { CardData } from "../scripts/types";

const loadingCard = ref(false);
const selectedSearchCard = ref("");
const input = ref("");

const filteredCardSearch = computed(() => {
  if (input.value.length <= 2 || loadingCard.value) return undefined;
  const splitInput = input.value.trim().toLowerCase().split(" ");
  let filtered = cardNames.value.filter((name) =>
    splitInput.every((subsection) => name.toLowerCase().includes(subsection)),
  );
  if (filtered.length) {
    return filtered.slice(0, 9);
  }
  return undefined;
});

onMounted(focusOnInput);

// Add a card from the input
async function addCard(name: string | null = null) {
  if (loadingCard.value) return;

  let cardData = null;
  let supposedToBeFoil = false;
  let willOpenSwitchDialog = false;
  const search = name ? name : input.value.trim();

  input.value = "";
  errorMsg.value = "&nbsp;";
  loadingCard.value = true;

  if (name === null) {
    const split = search.split(" ");
    const land = charToLand(search);
    if (land) {
      lands[land] += 1;
      loadingCard.value = false;
      return;
    }
    if (split.length === 2 || split.length === 3) {
      // Search for card by set and collector number
      const CN = split[0];
      const set = split[1];
      supposedToBeFoil = split.length === 3 && split[2] == "f";
      const response = await fetch(
        `https://api.scryfall.com/cards/${set}/${CN}`,
      );
      if (response.ok) {
        cardData = await response.json();
      }
    }
  }
  if (!cardData) {
    const nameResponse = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
        search,
      )}`,
    );
    if (nameResponse.ok) {
      cardData = await nameResponse.json();
      willOpenSwitchDialog = true;
    } else {
      errorMsg.value = `No results for <code>${search
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")}</code>.`;
    }
  }
  if (cardData) {
    const card: CardData = await cardFromData(cardData, supposedToBeFoil);
    deck.value.push(card);
    if (willOpenSwitchDialog && card.hasOtherPrints) {
      cardSwitchDialogIsOpen.value = true;
    }
  }
  loadingCard.value = false;
  await nextTick();
  focusOnInput();
}
</script>

<template>
  <form @submit.prevent="addCard()">
    <div class="input-listbox-container">
      <label
        >Type the collection number followed by the set code and an optional
        <code>f</code> for foil (<code>716 sld f</code>), or the name of the
        card (<code>Shivan Dragon</code>) and select the printing, of the mana
        symbol for basics (<code>w</code>, <code>u</code>, <code>b</code>,
        <code>r</code>, <code>g</code>, <code>c</code>):
        <InputGroup>
          <InputText
            placeholder="Keyword"
            v-model="input"
            id="inputEl"
            autocorrect="false"
            :disabled="loadingCard"
          />
          <Button
            :loading="loadingCard"
            :disabled="loadingCard"
            @click="addCard()"
          >
            <template #icon><Search width="18" height="18" /></template>
          </Button>
        </InputGroup>
      </label>
      <Listbox
        v-show:="filteredCardSearch"
        v-model="selectedSearchCard"
        :options="filteredCardSearch"
        @click="addCard(selectedSearchCard)"
      />
    </div>
  </form>
</template>

<style lang="css" scoped>
*:deep(.p-button-loading-icon) {
  stroke-width: 2;
  height: 18px;
  width: 18px;
}
.p-inputgroup {
  height: 2em;
  margin-top: 1em;
}
.input-listbox-container {
  position: relative;
}
.p-listbox {
  position: absolute;
  width: 100%;
  z-index: 1;
}

label {
  font-size: larger;
  line-height: 1.5;
}
@media only screen and (max-width: 740px) {
  label,
  input,
  :deep(.p-listbox-option) {
    font-size: small;
  }
}
</style>
