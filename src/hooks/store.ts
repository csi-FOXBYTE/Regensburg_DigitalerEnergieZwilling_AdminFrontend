import type {
  CarrierSelection,
  DETConfig,
  ElectricityTypeData,
  EnergyEfficiencyClass,
  HeatFlowDirection,
  PrimaryEnergyCarrierData,
  RangeKey,
  Selection,
} from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import { DEFAULT_CONFIG } from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import { produce } from "immer";
import { atom } from "nanostores";

export type PerfFactorEntry = {
  key: string;
  value: Array<RangeKey & { value: Array<RangeKey & { value: number }> }>;
};
export type TempControlEntry = {
  key: string;
  value: Array<RangeKey & { value: Array<{ key: string; value: number }> }>;
};

export interface Foerderprogramm {
  id: string;
  name: string;
  link?: string;
  promotionType: "percent" | "absolute";
  promotionAmount: number;
  maxPromotionAmount?: number;
  isActive: boolean;
  description: string;
}

export interface EnergyEfficiencyEntry {
  to?: number;
  from?: number;
  value: EnergyEfficiencyClass;
  color?: string;
}

export interface YearBandEntry {
  from?: number;
  to?: number;
}

export const DEFAULT_ENERGY_CLASS_COLORS: Record<string, string> = {
  "A+": "#008542",
  A: "#3aaa35",
  B: "#94c11c",
  C: "#c7d21f",
  D: "#f9e000",
  E: "#f6a800",
  F: "#f07d00",
  G: "#e94e0f",
  H: "#e2001a",
};

const withDefaultColors = (cfg: DETConfig): DETConfig =>
  produce(cfg, (draft) => {
    draft.general.energyEfficiencyClasses.forEach((entry) => {
      const e = entry as EnergyEfficiencyEntry;
      if (!e.color) {
        e.color = DEFAULT_ENERGY_CLASS_COLORS[e.value] ?? "#6b7280";
      }
    });
  });

export const config = atom<DETConfig>(withDefaultColors(DEFAULT_CONFIG));

// Helper function for config-updates: Immer immer nutzen!!
export const updateConfig = (updater: (draft: DETConfig) => void) => {
  config.set(produce(config.get(), updater));
};

export const updateSimpleValue = (path: string, value: unknown) => {
  updateConfig((draft) => {
    const keys = path.split(".");
    let current = draft as Record<string, unknown>;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]!] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]!] = value;
  });
};

// Allgemeine Parameter //

export const addCorrectionFactor = (entry: RangeKey & { value: number }) => {
  updateConfig((draft) => {
    (
      draft.general.heatedAirVolumeCorrectionFactor as Array<
        RangeKey & { value: number }
      >
    ).push(entry);
  });
};

export const updateCorrectionFactor = (
  index: number,
  updater: (draft: RangeKey & { value: number }) => void,
) => {
  updateConfig((draft) => {
    const item = draft.general.heatedAirVolumeCorrectionFactor[index];
    if (item) updater(item as RangeKey & { value: number });
  });
};

export const deleteCorrectionFactor = (index: number) => {
  updateConfig((draft) => {
    draft.general.heatedAirVolumeCorrectionFactor.splice(index, 1);
  });
};

export const updateNetFloorAreaFromUsableFloorAreaFactor = (
  buildingTypeKey: string,
  basementKey: boolean,
  value: number,
) => {
  updateConfig((draft) => {
    const buildingType =
      draft.general.netFloorAreaFromUsableFloorAreaFactor.find(
        (entry) => entry.key === buildingTypeKey,
      );
    if (!buildingType) return;
    const basementEntry = buildingType.value.find((v) => v.key === basementKey);
    if (basementEntry) basementEntry.value = value;
  });
};

export const updateInternalGainsFactorByBuildingType = (
  key: string,
  value: number,
) => {
  updateConfig((draft) => {
    const entry = draft.heat.internalGainsFactorByBuildingType.find(
      (e) => e.key === key,
    );
    if (entry) entry.value = value;
  });
};

// Jahresbänder //

const setValueForBand = (
  values: (YearBandEntry & { value: number })[],
  band: YearBandEntry,
  newValue: number,
): void => {
  const bf = band.from ?? -Infinity;
  const bt = band.to ?? Infinity;
  const idx = values.findIndex(
    (e) => (e.from ?? -Infinity) <= bf && (e.to ?? Infinity) >= bt,
  );
  if (idx === -1) return;

  const entry = values[idx]!;
  const ef = entry.from ?? -Infinity;
  const et = entry.to ?? Infinity;

  if (ef === bf && et === bt) {
    entry.value = newValue;
    return;
  }

  const pieces: (YearBandEntry & { value: number })[] = [];

  if (ef < bf) {
    const before: YearBandEntry & { value: number } = { value: entry.value };
    if (entry.from !== undefined) before.from = entry.from;
    before.to = band.from! - 1;
    pieces.push(before);
  }

  const edited: YearBandEntry & { value: number } = { value: newValue };
  if (band.from !== undefined) edited.from = band.from;
  if (band.to !== undefined) edited.to = band.to;
  pieces.push(edited);

  if (et > bt) {
    const after: YearBandEntry & { value: number } = { value: entry.value };
    after.from = band.to! + 1;
    if (entry.to !== undefined) after.to = entry.to;
    pieces.push(after);
  }

  values.splice(idx, 1, ...pieces);
};

export const addYearBand = (entry: YearBandEntry) => {
  updateConfig((draft) => {
    (draft.general.generalYearBands as YearBandEntry[]).push(entry);
  });
};

export const updateYearBand = (
  index: number,
  updater: (draft: YearBandEntry) => void,
) => {
  updateConfig((draft) => {
    const yearBand = draft.general.generalYearBands[index];
    if (!yearBand) return;
    updater(yearBand);
  });
};

export const deleteYearBand = (index: number) => {
  updateConfig((draft) => {
    draft.general.generalYearBands.splice(index, 1);
  });
};

// Primäre Energieträger //

export const addAllowedHeatingSystemType = (
  carrierKey: string,
  value: string,
) => {
  updateConfig((draft) => {
    const carrier = draft.heat.allowedHeatingSystemTypesByCarrier.find(
      (c) => c.key === carrierKey,
    );
    if (carrier) carrier.allowedValues.push(value);
  });
};

export const deleteAllowedHeatingSystemType = (
  carrierKey: string,
  index: number,
) => {
  updateConfig((draft) => {
    const carrier = draft.heat.allowedHeatingSystemTypesByCarrier.find(
      (c) => c.key === carrierKey,
    );
    if (carrier) carrier.allowedValues.splice(index, 1);
  });
};

export const addPrimaryEnergyCarrier = (entry: CarrierSelection) => {
  updateConfig((draft) => {
    draft.heat.primaryEnergyCarriers.push(entry);
    draft.heat.primaryEnergyCarrierData.push({
      key: entry.value,
      value: {
        energyPerUnit: 0,
        unit: "",
        unitRate: 0,
        baseRate: 0,
        co2Factor: 0,
        primaryEnergyFactor: 0,
      },
    });
    draft.heat.allowedHeatingSystemTypesByCarrier.push({
      key: entry.value,
      allowedValues: [],
    });
  });
};

export const deletePrimaryEnergyCarrier = (value: string) => {
  updateConfig((draft) => {
    const idx = draft.heat.primaryEnergyCarriers.findIndex(
      (c) => c.value === value,
    );
    if (idx >= 0) draft.heat.primaryEnergyCarriers.splice(idx, 1);
    draft.heat.primaryEnergyCarrierData =
      draft.heat.primaryEnergyCarrierData.filter((c) => c.key !== value);
    draft.heat.allowedHeatingSystemTypesByCarrier =
      draft.heat.allowedHeatingSystemTypesByCarrier.filter(
        (c) => c.key !== value,
      );
  });
};

export const updateDefaultHeatingSystemType = (
  carrierKey: string,
  value: string,
) => {
  updateConfig((draft) => {
    const entry = draft.heat.defaultHeatingSystemType.find(
      (e) => e.key === carrierKey,
    );
    if (entry) entry.value = value;
  });
};

export const updatePrimaryEnergyCarrierEfficiencyFactor = (
  carrierKey: string,
  value: number,
) => {
  updateConfig((draft) => {
    const data = draft.heat.primaryEnergyCarrierData.find(
      (d) => d.key === carrierKey,
    );
    if (data) data.value.primaryEnergyFactor = value;
  });
};

export const updatePrimaryEnergyCarrierData = (
  carrierKey: string,
  updater: (draft: PrimaryEnergyCarrierData) => void,
) => {
  updateConfig((draft) => {
    const data = draft.heat.primaryEnergyCarrierData.find(
      (d) => d.key === carrierKey,
    );
    if (data) {
      updater(data.value);
    }
  });
};

export const updateCO2Factor = (carrierKey: string, value: number) => {
  updateConfig((draft) => {
    const data = draft.heat.primaryEnergyCarrierData.find(
      (d) => d.key === carrierKey,
    );
    if (data) data.value.co2Factor = value;
  });
};

// Stromtypen //

export const addElectricityType = (entry: Selection) => {
  updateConfig((draft) => {
    draft.heat.electricityTypes.push(entry);
    draft.heat.electricityTypeData.push({
      key: entry.value,
      value: { co2Factor: 0, unitRate: 0, baseRate: 0, primaryEnergyFactor: 0 },
    });
  });
};

export const updateElectricityType = (
  index: number,
  updater: (draft: Selection) => void,
) => {
  updateConfig((draft) => {
    const item = draft.heat.electricityTypes[index];
    if (item) updater(item as Selection);
  });
};

export const deleteElectricityType = (value: string) => {
  updateConfig((draft) => {
    const idx = draft.heat.electricityTypes.findIndex((t) => t.value === value);
    if (idx >= 0) draft.heat.electricityTypes.splice(idx, 1);
    draft.heat.electricityTypeData = draft.heat.electricityTypeData.filter(
      (d) => d.key !== value,
    );
    if (draft.heat.defaultElectricityType === value) {
      draft.heat.defaultElectricityType =
        draft.heat.electricityTypes[0]?.value ?? "";
    }
  });
};

export const updateElectricityTypeData = (
  key: string,
  updater: (draft: ElectricityTypeData) => void,
) => {
  updateConfig((draft) => {
    const data = draft.heat.electricityTypeData.find((d) => d.key === key);
    if (data) updater(data.value);
  });
};

// Heizungserzeugerart //

export const addHeatingSystemType = (entry: Selection) => {
  updateConfig((draft) => {
    draft.heat.heatingSystemTypes.push(entry);

    const surfaceTypeKeys = draft.heat.heatingSurfaceTypes.map((s) => s.value);
    const existingPerf = (
      draft.heat.heatingPerformanceFactor as PerfFactorEntry[]
    )[0];
    const existingTemp = (
      draft.heat.temperatureControlPerformanceFactor as TempControlEntry[]
    )[0];

    const perfYearBands = existingPerf
      ? existingPerf.value.map((yearBand: RangeKey) => ({
          ...yearBand,
          value: [{ value: 0 }],
        }))
      : [{ value: [{ value: 0 }] }];

    const tempYearBands = existingTemp
      ? existingTemp.value.map((yearBand: RangeKey) => ({
          ...yearBand,
          value: surfaceTypeKeys.map((key) => ({ key, value: 0 })),
        }))
      : [{ value: surfaceTypeKeys.map((key) => ({ key, value: 0 })) }];

    (draft.heat.heatingPerformanceFactor as PerfFactorEntry[]).push({
      key: entry.value,
      value: perfYearBands,
    });
    (draft.heat.temperatureControlPerformanceFactor as TempControlEntry[]).push(
      {
        key: entry.value,
        value: tempYearBands,
      },
    );
    draft.heat.electricalRatio.push({ key: entry.value, value: 0 });
    draft.heat.hasInternalGains.push({ key: entry.value, value: false });
  });
};

export const addHeatingPerformanceFactorRow = (
  key: string,
  yearBand: { from?: number; to?: number },
) => {
  updateConfig((draft) => {
    let entry = (draft.heat.heatingPerformanceFactor as PerfFactorEntry[]).find(
      (e) => e.key === key,
    );
    if (!entry) {
      entry = { key, value: [] };
      (draft.heat.heatingPerformanceFactor as PerfFactorEntry[]).push(entry);
    }
    const numCols = entry.value[0]?.value.length ?? 1;
    entry.value.push({
      ...yearBand,
      value: Array.from({ length: numCols }, () => ({ value: 0 })),
    });
  });
};

export const deleteHeatingPerformanceFactorRow = (
  key: string,
  yearIndex: number,
) => {
  updateConfig((draft) => {
    const entry = (
      draft.heat.heatingPerformanceFactor as PerfFactorEntry[]
    ).find((e) => e.key === key);
    if (entry) entry.value.splice(yearIndex, 1);
  });
};

export const addHeatingPerformanceFactorColumn = (
  key: string,
  powerBand: { from?: number; to?: number },
) => {
  updateConfig((draft) => {
    const entry = (
      draft.heat.heatingPerformanceFactor as PerfFactorEntry[]
    ).find((e) => e.key === key);
    if (!entry) return;
    entry.value.forEach((yearRow) =>
      yearRow.value.push({ ...powerBand, value: 0 }),
    );
  });
};

export const deleteHeatingPerformanceFactorColumn = (
  key: string,
  colIndex: number,
) => {
  updateConfig((draft) => {
    const entry = (
      draft.heat.heatingPerformanceFactor as PerfFactorEntry[]
    ).find((e) => e.key === key);
    if (!entry) return;
    entry.value.forEach((yearRow) => yearRow.value.splice(colIndex, 1));
  });
};

export const addTemperatureControlRow = (
  key: string,
  yearBand: { from?: number; to?: number },
) => {
  updateConfig((draft) => {
    let entry = (
      draft.heat.temperatureControlPerformanceFactor as TempControlEntry[]
    ).find((e) => e.key === key);
    if (!entry) {
      entry = { key, value: [] };
      (
        draft.heat.temperatureControlPerformanceFactor as TempControlEntry[]
      ).push(entry);
    }
    const controlKeys: string[] = entry.value[0]?.value.map((v) => v.key) ?? [];
    entry.value.push({
      ...yearBand,
      value: controlKeys.map((k) => ({ key: k, value: 0 })),
    });
  });
};

export const deleteTemperatureControlRow = (key: string, yearIndex: number) => {
  updateConfig((draft) => {
    const entry = (
      draft.heat.temperatureControlPerformanceFactor as TempControlEntry[]
    ).find((e) => e.key === key);
    if (entry) entry.value.splice(yearIndex, 1);
  });
};

export const addTemperatureControlColumn = (
  key: string,
  controlKey: string,
) => {
  updateConfig((draft) => {
    const entry = (
      draft.heat.temperatureControlPerformanceFactor as TempControlEntry[]
    ).find((e) => e.key === key);
    if (!entry) return;
    entry.value.forEach((yearRow) =>
      yearRow.value.push({ key: controlKey, value: 0 }),
    );
  });
};

export const deleteTemperatureControlColumn = (
  key: string,
  controlKey: string,
) => {
  updateConfig((draft) => {
    const entry = (
      draft.heat.temperatureControlPerformanceFactor as TempControlEntry[]
    ).find((e) => e.key === key);
    if (!entry) return;
    entry.value.forEach((yearRow) => {
      yearRow.value = yearRow.value.filter((v) => v.key !== controlKey);
    });
  });
};

export const updateElectricalRatio = (key: string, value: number) => {
  updateConfig((draft) => {
    const entry = draft.heat.electricalRatio.find((e) => e.key === key);
    if (entry) entry.value = value;
  });
};

export const updateHasInternalGains = (key: string, value: boolean) => {
  updateConfig((draft) => {
    const entry = draft.heat.hasInternalGains.find((e) => e.key === key);
    if (entry) entry.value = value;
  });
};

export const updateHeatingPerformanceFactor = (
  key: string,
  yearIndex: number,
  powerIndex: number,
  value: number,
) => {
  updateConfig((draft) => {
    const entry = (
      draft.heat.heatingPerformanceFactor as PerfFactorEntry[]
    ).find((e) => e.key === key);
    if (entry) entry.value[yearIndex]!.value[powerIndex]!.value = value;
  });
};

export const updateTemperatureControlPerformanceFactor = (
  key: string,
  yearIndex: number,
  controlKey: string,
  value: number,
) => {
  updateConfig((draft) => {
    const entry = (
      draft.heat.temperatureControlPerformanceFactor as TempControlEntry[]
    ).find((e) => e.key === key);
    if (!entry) return;
    const cell = entry.value[yearIndex]?.value?.find(
      (v) => v.key === controlKey,
    );
    if (cell) cell.value = value;
  });
};

export const updateHeatingPerformanceFactorYearBand = (
  key: string,
  yearIndex: number,
  from?: number,
  to?: number,
) => {
  updateConfig((draft) => {
    const entry = (
      draft.heat.heatingPerformanceFactor as PerfFactorEntry[]
    ).find((e) => e.key === key);
    if (!entry) return;
    const row = entry.value[yearIndex];
    if (!row) return;
    if (from !== undefined) row.from = from;
    else delete row.from;
    if (to !== undefined) row.to = to;
    else delete row.to;
  });
};

export const updateTemperatureControlYearBand = (
  key: string,
  yearIndex: number,
  from?: number,
  to?: number,
) => {
  updateConfig((draft) => {
    const entry = (
      draft.heat.temperatureControlPerformanceFactor as TempControlEntry[]
    ).find((e) => e.key === key);
    if (!entry) return;
    const row = entry.value[yearIndex];
    if (!row) return;
    if (from !== undefined) row.from = from;
    else delete row.from;
    if (to !== undefined) row.to = to;
    else delete row.to;
  });
};

export const updateHeatingSystemType = (
  index: number,
  updater: (draft: Selection) => void,
) => {
  updateConfig((draft) => {
    const item = draft.heat.heatingSystemTypes[index];
    if (item) updater(item as Selection);
  });
};

export const deleteHeatingSystemType = (index: number) => {
  updateConfig((draft) => {
    const value = draft.heat.heatingSystemTypes[index]?.value;
    draft.heat.heatingSystemTypes.splice(index, 1);
    if (!value) return;
    (draft.heat.heatingPerformanceFactor as PerfFactorEntry[]).splice(
      (draft.heat.heatingPerformanceFactor as PerfFactorEntry[]).findIndex(
        (e) => e.key === value,
      ),
      1,
    );
    (
      draft.heat.temperatureControlPerformanceFactor as TempControlEntry[]
    ).splice(
      (
        draft.heat.temperatureControlPerformanceFactor as TempControlEntry[]
      ).findIndex((e) => e.key === value),
      1,
    );
    draft.heat.allowedHeatingSystemTypesByCarrier.forEach((carrier) => {
      carrier.allowedValues = carrier.allowedValues.filter((v) => v !== value);
    });
    draft.heat.electricalRatio = draft.heat.electricalRatio.filter(
      (e) => e.key !== value,
    );
    draft.heat.hasInternalGains = draft.heat.hasInternalGains.filter(
      (e) => e.key !== value,
    );
  });
};

// Heizflächenarten //

export const addHeatingSurfaceType = (entry: Selection) => {
  updateConfig((draft) => {
    draft.heat.heatingSurfaceTypes.push(entry);
  });
};

export const deleteHeatingSurfaceType = (index: number) => {
  updateConfig((draft) => {
    draft.heat.heatingSurfaceTypes.splice(index, 1);
  });
};

export const updateHeatingSurfaceType = (
  index: number,
  updater: (draft: Selection) => void,
) => {
  updateConfig((draft) => {
    const item = draft.heat.heatingSurfaceTypes[index];
    if (item) updater(item as Selection);
  });
};

// Energieeffizienzklassen //

export const updateEnergyEfficiencyClass = (
  index: number,
  updater: (draft: EnergyEfficiencyEntry) => void,
) => {
  updateConfig((draft) => {
    const item = draft.general.energyEfficiencyClasses[index];
    if (!item) return;
    updater(item);
  });
};

export const deleteEnergyEfficiencyClass = (index: number) => {
  updateConfig((draft) => {
    draft.general.energyEfficiencyClasses.splice(index, 1);
  });
};

export const addEnergyEfficiencyClass = (entry: EnergyEfficiencyEntry) => {
  updateConfig((draft) => {
    (draft.general.energyEfficiencyClasses as EnergyEfficiencyEntry[]).push(
      entry,
    );
  });
};

// Wärmeübergangswiderstände //

export const updateInnerSurfaceThermalResistance = (
  key: HeatFlowDirection,
  value: number,
) => {
  updateConfig((draft) => {
    const entry = draft.heat.innerSurfaceThermalResistance.find(
      (e) => e.key === key,
    );
    if (entry) entry.value = value;
  });
};

export const updateOuterSurfaceThermalResistance = (
  key: HeatFlowDirection,
  value: number,
) => {
  updateConfig((draft) => {
    const entry = draft.heat.outerSurfaceThermalResistance.find(
      (e) => e.key === key,
    );
    if (entry) entry.value = value;
  });
};

const applyUValueUpdate = (
  uValueRows: unknown[],
  constructionIndex: number,
  band: YearBandEntry,
  value: number,
) => {
  const row = uValueRows[constructionIndex] as { value: (YearBandEntry & { value: number })[] } | undefined;
  if (!row) return;
  setValueForBand(row.value, band, value);
};

// Dach //

export const updateRoofUValue = (
  constructionIndex: number,
  band: YearBandEntry,
  value: number,
) => {
  updateConfig((draft) => {
    applyUValueUpdate(draft.roof.uValue, constructionIndex, band, value);
  });
};

// Oberste Geschossdecke //

export const updateTopFloorDefaultType = (index: number, value: string) => {
  updateConfig((draft) => {
    const entry = draft.topFloor.defaultTopFloorType[index];
    if (entry) entry.value = value;
  });
};

export const updateTopFloorUValue = (
  typeIndex: number,
  band: YearBandEntry,
  value: number,
) => {
  updateConfig((draft) => {
    applyUValueUpdate(draft.topFloor.uValue, typeIndex, band, value);
  });
};

// Außenwand //

export const updateOuterWallConstructionType = (
  index: number,
  updater: (draft: Selection) => void,
) => {
  updateConfig((draft) => {
    const item = draft.outerWall.constructionTypes[index];
    if (item) updater(item as Selection);
  });
};

export const updateOuterWallUValue = (
  constructionIndex: number,
  band: YearBandEntry,
  value: number,
) => {
  updateConfig((draft) => {
    applyUValueUpdate(draft.outerWall.uValue, constructionIndex, band, value);
  });
};

export const updateOuterWallDefaultConstructionType = (
  index: number,
  value: string,
) => {
  updateConfig((draft) => {
    const entry = (
      draft.outerWall.defaultConstructionType as Array<
        RangeKey & { value: string }
      >
    )[index];
    if (entry) entry.value = value;
  });
};

// Fenster //

export const updateWindowDefaultType = (index: number, value: string) => {
  updateConfig((draft) => {
    const entry = (
      draft.windows.defaultWindowType as Array<RangeKey & { value: string }>
    )[index];
    if (entry) entry.value = value;
  });
};

export const updateWindowsUValue = (
  constructionIndex: number,
  band: YearBandEntry,
  value: number,
) => {
  updateConfig((draft) => {
    applyUValueUpdate(draft.windows.uValue, constructionIndex, band, value);
  });
};

// Unterste Geschossdecke //

export const updateBottomFloorConstructionType = (
  index: number,
  updater: (draft: Selection) => void,
) => {
  updateConfig((draft) => {
    const item = draft.bottomFloor.constructionTypes[index];
    if (item) updater(item as Selection);
  });
};

export const updateBottomFloorUValue = (
  constructionIndex: number,
  band: YearBandEntry,
  value: number,
) => {
  updateConfig((draft) => {
    applyUValueUpdate(draft.bottomFloor.uValue, constructionIndex, band, value);
  });
};

export const updateBottomFloorDefaultConstructionType = (
  groupIndex: number,
  bandIndex: number,
  value: string,
) => {
  updateConfig((draft) => {
    const group = draft.bottomFloor.defaultConstructionType[groupIndex];
    if (group?.value?.[bandIndex]) group.value[bandIndex].value = value;
  });
};

export const toggleAllowedBottomFloorConstructionType = (
  groupIndex: number,
  value: string,
  checked: boolean,
) => {
  updateConfig((draft) => {
    const group =
      draft.bottomFloor.allowedConstructionTypesByHeatedCellar[groupIndex];
    if (!group) return;
    if (checked) {
      if (!group.allowedValues.includes(value)) group.allowedValues.push(value);
    } else {
      group.allowedValues = group.allowedValues.filter(
        (v: string) => v !== value,
      );
    }
  });
};

// Förderprogramme //

export const foerderprogramme = atom<Foerderprogramm[]>([]);

export const addFoerderprogramm = (entry: Foerderprogramm) => {
  foerderprogramme.set([...foerderprogramme.get(), entry]);
};

export const updateFoerderprogramm = (
  id: string,
  updater: (draft: Foerderprogramm) => void,
) => {
  foerderprogramme.set(
    produce(foerderprogramme.get(), (draft) => {
      const item = draft.find((f) => f.id === id);
      if (item) updater(item);
    }),
  );
};

export const deleteFoerderprogramm = (id: string) => {
  foerderprogramme.set(foerderprogramme.get().filter((f) => f.id !== id));
};

// Heat Config Updates
export const updatePrimaryEnergyCarrier = (
  index: number,
  updater: (draft: CarrierSelection) => void,
) => {
  updateConfig((draft) => {
    const item = draft.heat.primaryEnergyCarriers[index];
    if (item) updater(item as CarrierSelection);
  });
};
