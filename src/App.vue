<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
// Componets
import Button from "primevue/button";
import InputGroup from "primevue/inputgroup";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import Listbox from "primevue/listbox";
// Custom Components
import CardImage from "./components/cardImage.vue";
import IconCounter from "./components/iconCounter.vue";
// Lucid Icons
import {
  Search,
  Sparkle,
  Trash2,
  ArrowRightLeft,
  LayoutGrid,
  ClipboardCopy,
  RotateCcw,
} from "lucide-vue-next";
type CardData = {
  imgURL: string;
  collector_number: string;
  set: string;
  name: string;
  switchableFoil: boolean;
  foil: boolean;
  switch_url: string;
  hasOtherPrints: boolean;
};

// Refs
const input = ref("");
const numberOfPlains = ref(0);
const numberOfIslands = ref(0);
const numberOfSwamps = ref(0);
const numberOfMountains = ref(0);
const numberOfForests = ref(0);
const numberOfWastes = ref(0);
const selectedSearchCard = ref("");
const errorMsg = ref("&nbsp;");
const loadingCard = ref(false);
const cardSwitchDialogIsOpen = ref(false);
const viewDeckDialogIsOpen = ref(false);
const clearDeckDialogIsOpen = ref(false);
const switchCards = ref<CardData[] | null>(null);
const cards = ref<CardData[]>([]);
let inputEl: null | HTMLInputElement = null;

// Set up toast
const toast = useToast();
const showToast = (head: string, msg: string) => {
  toast.add({ severity: "secondary", summary: head, detail: msg, life: 3000 });
};
let cardNames: string[] = [];

// Computeds
const latestCard = computed(() =>
  cards.value.length === 0 ? null : cards.value[cards.value.length - 1]
);
const filteredCardSearch = computed(() => {
  if (input.value.length <= 2 || loadingCard.value) return null;
  let filtered = cardNames.filter((name) =>
    input.value
      .toLowerCase()
      .split(" ")
      .every((subsection) => name.toLowerCase().includes(subsection))
  );
  if (input.value) {
    if (filtered.length) {
      return filtered.slice(0, 9);
    } else {
      return null;
    }
  }
});
const hasDeck = computed(
  () =>
    !!(
      latestCard.value ||
      numberOfPlains.value ||
      numberOfIslands.value ||
      numberOfSwamps.value ||
      numberOfMountains.value ||
      numberOfForests.value ||
      numberOfWastes.value
    )
);

// Focus of the input on load and get the card names into an array
onMounted(async () => {
  inputEl = document.getElementById("inputEl") as HTMLInputElement;
  cardNames = (
    await (await fetch("https://api.scryfall.com/catalog/card-names")).json()
  ).data as string[];
});

// Add a card from the input
async function addCard(name: string | null = null) {
  if (loadingCard.value) return;
  let cardData = null;
  let supposedToBeFoil = false;
  let willOpenSwitchDialog = name !== null;
  if (name === null) {
    const search = input.value.trim();
    input.value = "";
    errorMsg.value = "&nbsp;";
    loadingCard.value = true;
    inputEl?.focus();
    const split = search.split(" ");
    let basics = {
      w: numberOfPlains,
      u: numberOfIslands,
      b: numberOfSwamps,
      r: numberOfMountains,
      g: numberOfForests,
      c: numberOfWastes,
    };
    if (Object.keys(basics).includes(search)) {
      basics[search as keyof typeof basics].value++;
      loadingCard.value = false;
      return;
    }
    if (split.length === 2 || split.length === 3) {
      // Search for card by set and collector number
      const CN = split[0];
      const set = split[1];
      supposedToBeFoil = split.length === 3 && split[2] == "f";
      const response = await fetch(
        `https://api.scryfall.com/cards/${set}/${CN}`
      );
      if (response.ok) {
        cardData = await response.json();
      }
    }
    if (!cardData) {
      const nameResponse = await fetch(
        `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
          search
        )}`
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
  } else {
    const nameResponse = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
        name as string
      )}`
    );
    if (nameResponse.ok) {
      cardData = await nameResponse.json();
    } else {
      errorMsg.value = `No results for <code>${(name as string)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")}</code>.`;
    }
  }
  if (cardData) {
    const card: CardData = await cardFromData(cardData, supposedToBeFoil);
    cards.value.push(card);
    if (willOpenSwitchDialog && card.hasOtherPrints) {
      openCardSwitchDialog();
    }
  }
  loadingCard.value = false;
}

// Return a small CardData type from the massive scryfall json
async function cardFromData(
  cardData,
  supposedToBeFoil: boolean,
  alreadyCheckedPrints: boolean | undefined = undefined
): Promise<CardData> {
  let image_uris;
  if (cardData.card_faces) {
    image_uris = cardData.card_faces[0].image_uris;
  } else {
    image_uris = cardData.image_uris;
  }
  const imgURL = image_uris.png;
  const collector_number = cardData.collector_number;
  const set = cardData.set;
  const name = cardData.name;
  const switch_url = cardData.prints_search_uri;
  const switchableFoil =
    cardData.finishes.includes("foil") && cardData.finishes.includes("nonfoil");
  const foil =
    supposedToBeFoil && cardData.finishes.includes("foil") ? true : false;
  // See if it has other prints
  let hasOtherPrints;
  if (alreadyCheckedPrints === true || alreadyCheckedPrints === false) {
    hasOtherPrints = alreadyCheckedPrints;
  } else {
    const printsJSON = await (await fetch(switch_url)).json();
    const prints = printsJSON.total_cards as number;
    hasOtherPrints = prints > 1;
  }
  return {
    imgURL,
    collector_number,
    set,
    name,
    switchableFoil,
    foil,
    switch_url,
    hasOtherPrints,
  };
}

// Opens card print swapping dialog
async function openCardSwitchDialog() {
  if (!latestCard.value) return;
  let hasNextPage = true;
  let nextPage = latestCard.value.switch_url;
  switchCards.value = []
  cardSwitchDialogIsOpen.value = true;
  while (hasNextPage) {
    let response = await fetch(latestCard.value.switch_url);
    if (!response.ok) {
      errorMsg.value = "A loading error occured";
      return;
    }
    const cardData = await response.json();
    hasNextPage = cardData.has_more
    nextPage = cardData.next_page
    const promises = await cardData.data.map(
      async (data) =>
        await cardFromData(
          data,
          latestCard.value !== null && latestCard.value.foil,
          true // Should be able to switch printings
        )
    );
    Promise.all(promises).then((values) => {
      if(switchCards.value) switchCards.value.push(...values);
    });
  }
}

// Switches a print of the top card
function switchPrint(set: string, collection_number: string, imgURL: string) {
  if (latestCard.value) {
    latestCard.value.set = set;
    latestCard.value.collector_number = collection_number;
    latestCard.value.imgURL = imgURL;
  }
  cardSwitchDialogIsOpen.value = false;
  focus();
}

// Removes a card at the given index
function removeCardAtIndex(index: number) {
  if (cards.value) cards.value.splice(index, 1);
  if (cards.value.length === 0) {
    viewDeckDialogIsOpen.value = false;
    focus();
  }
}

// Closing dialogs
function closeCardSwitchDialog() {
  cardSwitchDialogIsOpen.value = false;
  focus();
}
function closeViewDeckDialog() {
  viewDeckDialogIsOpen.value = false;
  focus();
}

// Focus on the input
function focus() {
  setTimeout(() => {
    inputEl?.focus();
  }, 100);
}

// Copy the deck
function copyDeck() {
  let txt = "";
  if (cards.value)
    cards.value.forEach((card) => {
      txt += `1 ${card.name} (${card.set}) ${card.collector_number} ${
        card.foil ? "*f*" : ""
      }\n`;
    });
  let lands = {
    plain: numberOfPlains,
    island: numberOfIslands,
    swamp: numberOfSwamps,
    mountain: numberOfMountains,
    forest: numberOfForests,
    waste: numberOfWastes,
  };
  for (var [key, value] of Object.entries(lands)) {
    if (value.value) txt += `${value.value} ${key}\n`;
  }
  navigator.clipboard.writeText(txt).then(
    function () {
      showToast("Copied", "Your deck has been copied");
    },
    function (err) {
      showToast(
        "Could Not Copy Text",
        "See the developer tools console for details"
      );
      console.log(txt);
      console.log(err);
    }
  );
}

// Clear the deck and all basics
function clearDeck() {
  cards.value = [];
  clearDeckDialogIsOpen.value = false;
  numberOfPlains.value = 0;
  numberOfIslands.value = 0;
  numberOfSwamps.value = 0;
  numberOfMountains.value = 0;
  numberOfForests.value = 0;
  numberOfWastes.value = 0;
}

// Add a selected card from the listbox
function addSelectedCard() {
  input.value = selectedSearchCard.value;
  addCard();
}
</script>

<template>
  <!-- waraper to center screen -->
  <div class="wraper">
    <Toast>
      <template #icon><Trash2></Trash2></template>
    </Toast>
    <h1>Moxify</h1>
    <!-- The input box and listbox -->
    <form @submit.prevent="addCard()">
      <div class="input-listbox-container">
        <label
          >Type the collection number followed by the set code and an optional
          <code>f</code> for foil (<code>716 sld f</code>), or the name of the
          card (<code>Shivan Dragon</code>) and select the printing, of the mana
          symbol for basics (<code>w</code>, <code>u</code>, <code>b</code>,
          <code>r</code>, <code>g</code>, <code>c</code>):
          <InputGroup>
            <InputText placeholder="Keyword" v-model="input" id="inputEl" />
            <Button :loading="loadingCard" :disabled="false" @click="addCard">
              <template #icon><Search /></template>
            </Button>
          </InputGroup>
        </label>
        <Listbox
          v-show:="filteredCardSearch"
          v-model="selectedSearchCard"
          :options="filteredCardSearch"
          @click="addSelectedCard"
        />
      </div>
      <p v-html="errorMsg" class="error-msg"></p>
    </form>
    <div class="center">
      <!-- The basic land counters -->
      <div class="vert-menu">
        <IconCounter
          v-model="numberOfPlains"
          :src="'https://svgs.scryfall.io/card-symbols/W.svg'"
        ></IconCounter>
        <IconCounter
          v-model="numberOfIslands"
          :src="'https://svgs.scryfall.io/card-symbols/U.svg'"
        ></IconCounter>
        <IconCounter
          v-model="numberOfSwamps"
          :src="'https://svgs.scryfall.io/card-symbols/B.svg'"
        ></IconCounter>
        <IconCounter
          v-model="numberOfMountains"
          :src="'https://svgs.scryfall.io/card-symbols/R.svg'"
        ></IconCounter>
        <IconCounter
          v-model="numberOfForests"
          :src="'https://svgs.scryfall.io/card-symbols/G.svg'"
        ></IconCounter>
        <IconCounter
          v-model="numberOfWastes"
          :src="'https://svgs.scryfall.io/card-symbols/C.svg'"
        ></IconCounter>
      </div>
      <!-- The center card image -->
      <CardImage
        :src="latestCard ? latestCard.imgURL : null"
        :width="300"
        :class="{ foil: latestCard && latestCard.foil }"
      ></CardImage>
      <!-- The right menu options -->
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
          @click="cards.length && cards.pop()"
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
          @click="openCardSwitchDialog"
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
    </div>
  </div>

  <!-- Switch printing dialog -->
  <Dialog
    v-model:visible="cardSwitchDialogIsOpen"
    modal
    header="Select Your Printing"
    :style="{ width: '50%' }"
  >
    <div class="card-flex">
      <CardImage
        v-for="card in switchCards"
        :src="card.imgURL"
        :clickFunction="switchPrint"
        :clickFunctionParms="[card.set, card.collector_number, card.imgURL]"
        :width="160"
      ></CardImage>
    </div>
    <template #footer>
      <Button severity="secondary" @click="closeCardSwitchDialog"
        >Cancel</Button
      >
    </template>
  </Dialog>

  <!-- View deck dialog -->
  <Dialog
    v-model:visible="viewDeckDialogIsOpen"
    modal
    header="Click A Card To Remove It From Your Deck"
    :style="{ width: '50%' }"
  >
    <div class="card-flex">
      <CardImage
        v-for="(card, i) in cards"
        :src="card.imgURL"
        :clickFunction="removeCardAtIndex"
        :clickFunctionParms="[i]"
        :width="160"
      ></CardImage>
    </div>
    <template #footer>
      <Button severity="secondary" @click="closeViewDeckDialog">Cancel</Button>
    </template>
  </Dialog>

  <!-- Clear deck dialog -->
  <Dialog
    v-model:visible="clearDeckDialogIsOpen"
    modal
    header="Are you sure you want to restart and clear your deck?"
    :style="{ width: '25em' }"
  >
    <template #footer>
      <Button severity="secondary" @click="clearDeckDialogIsOpen = false"
        >Cancel</Button
      >
      <Button severity="danger" @click="clearDeck">Clear Deck</Button>
    </template>
  </Dialog>
</template>

<style scoped>
*:deep(.p-button-loading-icon) {
  stroke-width: 2;
  height: 18px;
  width: 18px;
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
.wraper {
  width: 70%;
  margin-left: auto;
  margin-right: auto;
}
.p-inputgroup {
  height: 3em;
  margin-top: 1em;
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
  margin: 60px 20px;
}
.foil {
  mask: linear-gradient(135deg, #000c 40%, #000, #000c 60%) 100% 100%/ /* initial position, bottom-right */
    240% 240%; /* width and height */
  animation: shine 4s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
@keyframes shine {
  50% {
    mask-position: 0 0;
  }
}
.card-flex {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;

  * {
    margin: 5px;
    border-radius: 8px;
  }
  :hover {
    outline: var(--p-primary-color) solid 1px;
  }
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
</style>

