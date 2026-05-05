import type {
  DETConfig,
  EnergyEfficiencyClass,
  HeatFlowDirection,
} from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import { DEFAULT_CONFIG } from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import { produce } from "immer";
import { atom } from "nanostores";

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

const DEFAULT_ENERGY_CLASS_COLORS: Record<string, string> = {
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
    draft.general.energyEfficiencyClasses.forEach((entry: any) => {
      if (!entry.color) {
        entry.color = DEFAULT_ENERGY_CLASS_COLORS[entry.value] ?? "#6b7280";
      }
    });
  });

export const config = atom<DETConfig>(withDefaultColors(DEFAULT_CONFIG));

// Helper function for config-updates: Immer immer nutzen!!
export const updateConfig = (updater: (draft: DETConfig) => void) => {
  config.set(produce(config.get(), updater));
};

// General Config Updates
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

export const updateCorrectionFactor = (
  index: number,
  updater: (draft: any) => void,
) => {
  updateConfig((draft) => {
    updater(draft.general.heatedAirVolumeCorrectionFactor[index]);
  });
};

export const deleteCorrectionFactor = (index: number) => {
  updateConfig((draft) => {
    draft.general.heatedAirVolumeCorrectionFactor.splice(index, 1);
  });
};

// Heat Config Updates
export const updatePrimaryEnergyCarrier = (
  index: number,
  updater: (draft: any) => void,
) => {
  updateConfig((draft) => {
    updater(draft.heat.primaryEnergyCarriers[index]);
  });
};

export const deletePrimaryEnergyCarrier = (value: string) => {
  updateConfig((draft) => {
    const idx = draft.heat.primaryEnergyCarriers.findIndex(
      (c) => c.value === value,
    );
    if (idx >= 0) draft.heat.primaryEnergyCarriers.splice(idx, 1);
    draft.heat.primaryEnergyCarrierEfficiencyFactor =
      draft.heat.primaryEnergyCarrierEfficiencyFactor.filter(
        (c: any) => c.key !== value,
      );
    draft.heat.co2Factor = draft.heat.co2Factor.filter(
      (c: any) => c.key !== value,
    );
    draft.heat.primaryEnergyCarrierData =
      draft.heat.primaryEnergyCarrierData.filter((c: any) => c.key !== value);
    draft.heat.allowedHeatingSystemTypesByCarrier =
      draft.heat.allowedHeatingSystemTypesByCarrier.filter(
        (c: any) => c.key !== value,
      );
  });
};

export const updateHeatingSystemType = (
  index: number,
  updater: (draft: any) => void,
) => {
  updateConfig((draft) => {
    updater(draft.heat.heatingSystemTypes[index]);
  });
};

export const updateallowedHeatingSystemType = (
  key: string,
  index: number,
  newValue: string,
) => {
  updateConfig((draft: DETConfig) => {
    const carrier = draft.heat.allowedHeatingSystemTypesByCarrier.find(
      (c) => c.key === key,
    );

    if (!carrier) {
      console.error("Carrier nicht gefunden:", key);
      return;
    }

    if (!carrier.allowedValues[index]) {
      console.error("Index ungültig:", index);
      return;
    }

    carrier.allowedValues[index] = newValue;
  });
};

export const updateHeatingSurfaceType = (
  index: number,
  updater: (draft: any) => void,
) => {
  updateConfig((draft) => {
    updater(draft.heat.heatingSurfaceTypes[index]);
  });
};

export const deleteHeatingSurfaceType = (index: number) => {
  updateConfig((draft) => {
    draft.heat.heatingSurfaceTypes.splice(index, 1);
  });
};

// Simple value updates (using path notation)
export const updateSimpleValue = (path: string, value: any) => {
  updateConfig((draft) => {
    const keys = path.split(".");
    let current: any = draft;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]!];
    }
    current[keys[keys.length - 1]!] = value;
  });
};

// Roof Config Updates
export const updateRoofConstructionType = (
  index: number,
  updater: (draft: any) => void,
) => {
  updateConfig((draft) => {
    updater(draft.roof.constructionTypes[index]);
  });
};

export const deleteRoofConstructionType = (index: number) => {
  updateConfig((draft) => {
    draft.roof.constructionTypes.splice(index, 1);
  });
};

// Top Floor Config Updates
export const updateTopFloorType = (
  index: number,
  updater: (draft: any) => void,
) => {
  updateConfig((draft) => {
    updater(draft.topFloor.topFloorTypes[index]);
  });
};

export const deleteTopFloorType = (index: number) => {
  updateConfig((draft) => {
    draft.topFloor.topFloorTypes.splice(index, 1);
  });
};

// Outer Wall Config Updates
export const updateOuterWallConstructionType = (
  index: number,
  updater: (draft: any) => void,
) => {
  updateConfig((draft) => {
    updater(draft.outerWall.constructionTypes[index]);
  });
};

export const deleteOuterWallConstructionType = (index: number) => {
  updateConfig((draft) => {
    draft.outerWall.constructionTypes.splice(index, 1);
  });
};

// Bottom Floor Config Updates
export const updateBottomFloorConstructionType = (
  index: number,
  updater: (draft: any) => void,
) => {
  updateConfig((draft) => {
    updater(draft.bottomFloor.constructionTypes[index]);
  });
};

export const deleteBottomFloorConstructionType = (index: number) => {
  updateConfig((draft) => {
    draft.bottomFloor.constructionTypes.splice(index, 1);
  });
};

// Windows Config Updates
export const updateWindowType = (
  index: number,
  updater: (draft: any) => void,
) => {
  updateConfig((draft) => {
    updater(draft.windows.windowTypes[index]);
  });
};

export const deleteWindowType = (index: number) => {
  updateConfig((draft) => {
    draft.windows.windowTypes.splice(index, 1);
  });
};

// Add functions
export const addEnergyEfficiencyClass = (entry: EnergyEfficiencyEntry) => {
  updateConfig((draft) => {
    draft.general.energyEfficiencyClasses.push(entry as any);
  });
};

export const addYearBand = (entry: YearBandEntry) => {
  updateConfig((draft) => {
    draft.general.generalYearBands.push(entry as any);
  });
};

export const addPrimaryEnergyCarrier = (entry: any) => {
  updateConfig((draft) => {
    draft.heat.primaryEnergyCarriers.push(entry);
    draft.heat.primaryEnergyCarrierEfficiencyFactor.push({
      key: entry.value,
      value: 0,
    });
    draft.heat.co2Factor.push({ key: entry.value, value: 0 });
    draft.heat.primaryEnergyCarrierData.push({
      key: entry.value,
      value: { energyPerUnit: 0, unitRate: 0, baseRate: 0 },
    });
    draft.heat.allowedHeatingSystemTypesByCarrier.push({
      key: entry.value,
      allowedValues: [],
    });
  });
};

export const addHeatingSystemType = (entry: any) => {
  updateConfig((draft) => {
    draft.heat.heatingSystemTypes.push(entry);

    const surfaceTypeKeys = draft.heat.heatingSurfaceTypes.map(
      (s: any) => s.value,
    );
    const existingPerf = (draft.heat.heatingPerformanceFactor as any[])[0];
    const existingTemp = (
      draft.heat.temperatureControlPerformanceFactor as any[]
    )[0];

    const perfYearBands = existingPerf
      ? existingPerf.value.map((yearBand: any) => ({
          ...yearBand,
          value: [{ value: 0 }],
        }))
      : [{ value: [{ value: 0 }] }];

    const tempYearBands = existingTemp
      ? existingTemp.value.map((yearBand: any) => ({
          ...yearBand,
          value: surfaceTypeKeys.map((key: string) => ({ key, value: 0 })),
        }))
      : [{ value: surfaceTypeKeys.map((key: string) => ({ key, value: 0 })) }];

    (draft.heat.heatingPerformanceFactor as any[]).push({
      key: entry.value,
      value: perfYearBands,
    });
    (draft.heat.temperatureControlPerformanceFactor as any[]).push({
      key: entry.value,
      value: tempYearBands,
    });
  });
};

export const addHeatingSurfaceType = (entry: any) => {
  updateConfig((draft) => {
    draft.heat.heatingSurfaceTypes.push(entry);
  });
};

export const addCorrectionFactor = (entry: any) => {
  updateConfig((draft) => {
    draft.general.heatedAirVolumeCorrectionFactor.push(entry);
  });
};

export const addRoofConstructionType = (entry: any) => {
  updateConfig((draft) => {
    draft.roof.constructionTypes.push(entry);
  });
};

export const addOuterWallConstructionType = (entry: any) => {
  updateConfig((draft) => {
    draft.outerWall.constructionTypes.push(entry);
  });
};

export const addBottomFloorConstructionType = (entry: any) => {
  updateConfig((draft) => {
    draft.bottomFloor.constructionTypes.push(entry);
  });
};

export const addWindowType = (entry: any) => {
  updateConfig((draft) => {
    draft.windows.windowTypes.push(entry);
  });
};

// Nested Updates for primary energy carriers
export const updatePrimaryEnergyCarrierData = (
  carrierKey: string,
  updater: (draft: any) => void,
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

export const updatePrimaryEnergyCarrierEfficiencyFactor = (
  carrierKey: string,
  value: number,
) => {
  updateConfig((draft) => {
    const factor = draft.heat.primaryEnergyCarrierEfficiencyFactor.find(
      (f) => f.key === carrierKey,
    );
    if (factor) {
      factor.value = value;
    }
  });
};

export const updateCO2Factor = (carrierKey: string, value: number) => {
  updateConfig((draft) => {
    const factor = draft.heat.co2Factor.find((f) => f.key === carrierKey);
    if (factor) {
      factor.value = value;
    }
  });
};

// Roof U-Value Updates
export const updateRoofUValue = (
  constructionIndex: number,
  yearBandIndex: number,
  value: number,
) => {
  updateConfig((draft) => {
    if (
      draft.roof.uValue[constructionIndex]?.value[yearBandIndex] !== undefined
    ) {
      draft.roof.uValue[constructionIndex].value[yearBandIndex].value = value;
    }
  });
};

// Outer Wall U-Value Updates
export const updateOuterWallUValue = (
  constructionIndex: number,
  yearBandIndex: number,
  value: number,
) => {
  updateConfig((draft) => {
    if (
      draft.outerWall.uValue[constructionIndex]?.value[yearBandIndex] !==
      undefined
    ) {
      draft.outerWall.uValue[constructionIndex].value[yearBandIndex].value =
        value;
    }
  });
};

// Bottom Floor U-Value Updates
export const updateBottomFloorUValue = (
  constructionIndex: number,
  yearBandIndex: number,
  value: number,
) => {
  updateConfig((draft) => {
    if (
      draft.bottomFloor.uValue[constructionIndex]?.value[yearBandIndex] !==
      undefined
    ) {
      draft.bottomFloor.uValue[constructionIndex].value[yearBandIndex].value =
        value;
    }
  });
};

// Window U-Value Updates
export const updateWindowsUValue = (
  constructionIndex: number,
  yearBandIndex: number,
  value: number,
) => {
  updateConfig((draft) => {
    if (
      draft.windows.uValue[constructionIndex]?.value[yearBandIndex] !==
      undefined
    ) {
      draft.windows.uValue[constructionIndex].value[yearBandIndex].value =
        value;
    }
  });
};

// Top Floor U-Value Updates
export const updateTopFloorUValue = (
  typeIndex: number,
  yearBandIndex: number,
  value: number,
) => {
  updateConfig((draft) => {
    if (draft.topFloor.uValue[typeIndex]?.value[yearBandIndex] !== undefined) {
      draft.topFloor.uValue[typeIndex].value[yearBandIndex].value = value;
    }
  });
};

export const deleteHeatingSystemType = (index: number) => {
  updateConfig((draft) => {
    const value = draft.heat.heatingSystemTypes[index]?.value;
    draft.heat.heatingSystemTypes.splice(index, 1);
    if (!value) return;
    (draft.heat.heatingPerformanceFactor as any[]).splice(
      (draft.heat.heatingPerformanceFactor as any[]).findIndex(
        (e) => e.key === value,
      ),
      1,
    );
    (draft.heat.temperatureControlPerformanceFactor as any[]).splice(
      (draft.heat.temperatureControlPerformanceFactor as any[]).findIndex(
        (e) => e.key === value,
      ),
      1,
    );
    draft.heat.allowedHeatingSystemTypesByCarrier.forEach((carrier: any) => {
      carrier.allowedValues = carrier.allowedValues.filter(
        (v: string) => v !== value,
      );
    });
  });
};

// Allowed heating system type management per carrier
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

// Surface thermal resistance updates
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

// Net floor area from usable floor area factor (nested: buildingType → basement → value)
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

export const updateHeatingPerformanceFactor = (
  key: string,
  yearIndex: number,
  powerIndex: number,
  value: number,
) => {
  updateConfig((draft) => {
    const entry = (draft.heat.heatingPerformanceFactor as any[]).find(
      (e) => e.key === key,
    );
    if (entry) entry.value[yearIndex].value[powerIndex].value = value;
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
      draft.heat.temperatureControlPerformanceFactor as any[]
    ).find((e) => e.key === key);
    if (!entry) return;
    const cell = entry.value[yearIndex]?.value?.find(
      (v: any) => v.key === controlKey,
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
    const entry = (draft.heat.heatingPerformanceFactor as any[]).find(
      (e) => e.key === key,
    );
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
      draft.heat.temperatureControlPerformanceFactor as any[]
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

export const addHeatingPerformanceFactorRow = (
  key: string,
  yearBand: { from?: number; to?: number },
) => {
  updateConfig((draft) => {
    let entry = (draft.heat.heatingPerformanceFactor as any[]).find(
      (e) => e.key === key,
    );
    if (!entry) {
      entry = { key, value: [] };
      (draft.heat.heatingPerformanceFactor as any[]).push(entry);
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
    const entry = (draft.heat.heatingPerformanceFactor as any[]).find(
      (e) => e.key === key,
    );
    if (entry) entry.value.splice(yearIndex, 1);
  });
};

export const addHeatingPerformanceFactorColumn = (
  key: string,
  powerBand: { from?: number; to?: number },
) => {
  updateConfig((draft) => {
    const entry = (draft.heat.heatingPerformanceFactor as any[]).find(
      (e) => e.key === key,
    );
    if (!entry) return;
    entry.value.forEach((yearRow: any) =>
      yearRow.value.push({ ...powerBand, value: 0 }),
    );
  });
};

export const deleteHeatingPerformanceFactorColumn = (
  key: string,
  colIndex: number,
) => {
  updateConfig((draft) => {
    const entry = (draft.heat.heatingPerformanceFactor as any[]).find(
      (e) => e.key === key,
    );
    if (!entry) return;
    entry.value.forEach((yearRow: any) => yearRow.value.splice(colIndex, 1));
  });
};

export const addTemperatureControlRow = (
  key: string,
  yearBand: { from?: number; to?: number },
) => {
  updateConfig((draft) => {
    let entry = (draft.heat.temperatureControlPerformanceFactor as any[]).find(
      (e) => e.key === key,
    );
    if (!entry) {
      entry = { key, value: [] };
      (draft.heat.temperatureControlPerformanceFactor as any[]).push(entry);
    }
    const controlKeys: string[] =
      entry.value[0]?.value.map((v: any) => v.key) ?? [];
    entry.value.push({
      ...yearBand,
      value: controlKeys.map((k) => ({ key: k, value: 0 })),
    });
  });
};

export const deleteTemperatureControlRow = (key: string, yearIndex: number) => {
  updateConfig((draft) => {
    const entry = (
      draft.heat.temperatureControlPerformanceFactor as any[]
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
      draft.heat.temperatureControlPerformanceFactor as any[]
    ).find((e) => e.key === key);
    if (!entry) return;
    entry.value.forEach((yearRow: any) =>
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
      draft.heat.temperatureControlPerformanceFactor as any[]
    ).find((e) => e.key === key);
    if (!entry) return;
    entry.value.forEach((yearRow: any) => {
      yearRow.value = yearRow.value.filter((v: any) => v.key !== controlKey);
    });
  });
};

// Add top floor type (was missing unlike the other addX functions)
export const addTopFloorType = (entry: any) => {
  updateConfig((draft) => {
    draft.topFloor.topFloorTypes.push(entry);
  });
};

// Default type selector updates
export const updateTopFloorDefaultType = (index: number, value: string) => {
  updateConfig((draft) => {
    const entry = draft.topFloor.defaultTopFloorType[index];
    if (entry) entry.value = value;
  });
};

export const updateWindowDefaultType = (index: number, value: string) => {
  updateConfig((draft) => {
    const entry = (draft.windows.defaultWindowType as any[])[index];
    if (entry) entry.value = value;
  });
};

export const toggleAllowedBottomFloorConstructionType = (
  groupIndex: number,
  value: string,
  checked: boolean,
) => {
  updateConfig((draft) => {
    const group = (
      draft.bottomFloor.allowedConstructionTypesByHeatedCellar as any[]
    )[groupIndex];
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

export const updateBottomFloorDefaultConstructionType = (
  groupIndex: number,
  bandIndex: number,
  value: string,
) => {
  updateConfig((draft) => {
    const group = (draft.bottomFloor.defaultConstructionType as any[])[
      groupIndex
    ];
    if (group?.value?.[bandIndex]) group.value[bandIndex].value = value;
  });
};

export const updateOuterWallDefaultConstructionType = (
  index: number,
  value: string,
) => {
  updateConfig((draft) => {
    const entry = (draft.outerWall.defaultConstructionType as any[])[index];
    if (entry) entry.value = value;
  });
};
