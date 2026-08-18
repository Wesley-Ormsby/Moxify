import { CardData, LandType } from "./types";

export function focusOnInput() {
  document.getElementById("inputEl")?.focus();
}

const charToLandMap: Record<string, LandType> = {
  w: "plains",
  u: "island",
  b: "swamp",
  r: "mountain",
  g: "forest",
  c: "waste",
};

export function charToLand(char: string): LandType | null {
  return charToLandMap[char] || null;
}

const landToCharMap: Record<LandType, string> = {
  plains: "W",
  island: "U",
  swamp: "B",
  mountain: "R",
  forest: "G",
  waste: "C",
};

export function landToChar(land: LandType): string {
  return landToCharMap[land];
}

// Return a small CardData type from the massive scryfall json
export async function cardFromData(
  cardData: any,
  supposedToBeFoil: boolean,
  alreadyCheckedPrints: boolean | undefined = undefined,
): Promise<CardData> {
  let image_uris = cardData.image_uris ?? cardData.card_faces[0].image_uris;

  const imgURL = image_uris.normal;
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
