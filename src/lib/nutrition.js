export const NUTRITION_FIELDS = [
  { key: "energyKj", label: "Energia", unit: "kJ" },
  { key: "energyKcal", label: "Energia", unit: "kcal" },
  { key: "fat", label: "Grassi", unit: "g" },
  { key: "saturates", label: "di cui acidi grassi saturi", unit: "g", indent: true },
  { key: "carbs", label: "Carboidrati", unit: "g" },
  { key: "sugars", label: "di cui zuccheri", unit: "g", indent: true },
  { key: "fibre", label: "Fibre", unit: "g" },
  { key: "protein", label: "Proteine", unit: "g" },
  { key: "salt", label: "Sale", unit: "g" },
];

export const emptyNutrition = () => ({
  baseLabel: "",
  values: NUTRITION_FIELDS.reduce((acc, field) => {
    acc[field.key] = { per100g: "", perBase: "" };
    return acc;
  }, {}),
});

export const normalizeNutrition = (nutrition) => {
  const empty = emptyNutrition();
  if (!nutrition || typeof nutrition !== "object") return empty;

  return {
    baseLabel: nutrition.baseLabel || "",
    values: NUTRITION_FIELDS.reduce((acc, field) => {
      const current = nutrition.values?.[field.key] || {};
      acc[field.key] = {
        per100g: current.per100g ?? "",
        perBase: current.perBase ?? "",
      };
      return acc;
    }, {}),
  };
};

export const hasNutritionData = (nutrition) => {
  const values = nutrition?.values;
  if (!values) return false;
  return Object.values(values).some((row) => String(row?.per100g || "").trim() || String(row?.perBase || "").trim());
};
