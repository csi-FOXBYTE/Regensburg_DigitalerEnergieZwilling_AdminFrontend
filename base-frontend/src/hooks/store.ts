import type {
  DETConfig,
  EnergyEfficiencyClass,
} from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import { DEFAULT_CONFIG } from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import { produce } from "immer";
import { atom } from "nanostores";

export interface EnergyEfficiencyEntry {
  to?: number;
  from?: number;
  value: EnergyEfficiencyClass;
}

export interface YearBandEntry {
  from?: number;
  to?: number;
}

export const config = atom<DETConfig>(DEFAULT_CONFIG);

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

export const deletePrimaryEnergyCarrier = (index: number) => {
  updateConfig((draft) => {
    draft.heat.primaryEnergyCarriers.splice(index, 1);
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
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
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
    draft.general.energyEfficiencyClasses.push(entry);
  });
};

export const addYearBand = (entry: YearBandEntry) => {
  updateConfig((draft) => {
    draft.general.generalYearBands.push(entry);
  });
};

export const addPrimaryEnergyCarrier = (entry: any) => {
  updateConfig((draft) => {
    draft.heat.primaryEnergyCarriers.push(entry);
  });
};

export const addHeatingSystemType = (entry: any) => {
  updateConfig((draft) => {
    draft.heat.heatingSystemTypes.push(entry);
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
