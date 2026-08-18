import { computed, reactive, ref } from "vue";
import { CardData, LandType } from "./types";

// Data that will need to be pre-loaded
export const cardNames = ref<string[]>([]);

// Becomes `false` when all necessary data is preloaded
export const loading = ref<Boolean>(true);

// Random State
export const deck = ref<CardData[]>([]);
export const errorMsg = ref("&nbsp;");
export const lands = reactive<Record<LandType, number>>({
  plains: 0,
  island: 0,
  swamp: 0,
  mountain: 0,
  forest: 0,
  waste: 0,
});

// Computeds
export const latestCard = computed(() =>
  deck.value.length === 0 ? null : deck.value[deck.value.length - 1],
);

// Card Dialogs
export const cardSwitchDialogIsOpen = ref(false);
export const viewDeckDialogIsOpen = ref(false);
export const clearDeckDialogIsOpen = ref(false);
