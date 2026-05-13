export type YearBand = { from?: number; to?: number };

const NAME_TABLE: Record<string, string> = {
  singleFamily: "Einfamilienhaus",
  multiFamily: "Mehrfamilienhaus",
  solid_construction: "Massive Konstruktion",
  wood_construction: "Holzkonstruktion",
  solid_ceiling: "Massive Decke",
  wood_beam_ceiling: "Holzbalkendecke",
  brick_wall: "Vollziegelwand, über 30 cm Wandstärke",
  other_wall: "Sonstige Wandaufbauten über 20 cm Wandstärke",
  solid_wall_with_thermal_insulation_composite_system:
    "Massivwand mit Wärmedämmverbundsystem",
  reinforced_concrete_on_ground: "Massiver Stahlbeton gegen Boden",
  reinforced_concrete_ceiling: "Massiver Stahlbeton Kellerdecke",
  timber_joist_ceiling: "Holzbalkendecke",
  wooden_window_single_glazing: "Holzfenster, einfach verglast",
  wooden_window_double_glazing: "Holzfenster, zweifach verglast",
  plastic_window_insulated_glazing: "Kunststofffenster, Isolierverglasung",
  aluminum_or_steel_window_insulated_glazing:
    "Aluminium- oder Stahlfenster, Isolierverglasung",
};

export const lookUpForNames = (key: string): string => NAME_TABLE[key] ?? key;

export type BandEntry = { from?: number; to?: number; value: number };

export const getValueForBand = (
  values: BandEntry[],
  band: YearBand,
): number | undefined => {
  const bf = band.from ?? -Infinity;
  const bt = band.to ?? Infinity;
  return values.find(
    (e) => (e.from ?? -Infinity) <= bf && (e.to ?? Infinity) >= bt,
  )?.value;
};

export const sortBands = <T extends YearBand>(bands: T[]): T[] =>
  [...bands].sort((a, b) => (a.from ?? -Infinity) - (b.from ?? -Infinity));

export const formatBand = (band: YearBand): string => {
  if (band.from != null && band.to != null) return `${band.from}–${band.to}`;
  if (band.to != null) return `≤ ${band.to}`;
  if (band.from != null) return `ab ${band.from}`;
  return "alle";
};
