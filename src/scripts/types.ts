export type CardData = {
  imgURL: string;
  collector_number: string;
  set: string;
  name: string;
  switchableFoil: boolean;
  foil: boolean;
  switch_url: string;
  hasOtherPrints: boolean;
};

export const LAND_TYPES = [
    "plains",
    "island",
    "swamp",
    "mountain",
    "forest",
    "waste"
] as const

export type LandType = typeof LAND_TYPES[number];
