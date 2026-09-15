"use client";

import React from "react";
import { NUTRITION_FIELDS, hasNutritionData, normalizeNutrition } from "../lib/nutrition";

const formatCell = (value, unit) => {
  const text = String(value ?? "").trim();
  if (!text) return "–";
  return unit ? `${text} ${unit}` : text;
};

export default function NutritionTable({ nutrition }) {
  const data = normalizeNutrition(nutrition);

  if (!hasNutritionData(data)) {
    return (
      <p className="text-gray-500 italic text-sm">
        Valori nutrizionali non disponibili per questo prodotto.
      </p>
    );
  }

  const baseHeader = data.baseLabel?.trim()
    ? `per Base (${data.baseLabel.trim()})`
    : "per Base";

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-[#aa8510]/10">
          <tr>
            <th className="text-left px-3 py-2 font-semibold text-gray-800">Valori nutrizionali</th>
            <th className="text-right px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">per 100 g</th>
            <th className="text-right px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">{baseHeader}</th>
          </tr>
        </thead>
        <tbody>
          {NUTRITION_FIELDS.map((field) => (
            <tr key={field.key} className="border-t border-gray-100">
              <td className={`px-3 py-2 text-gray-700 ${field.indent ? "pl-7 text-gray-500" : "font-medium"}`}>
                {field.label} <span className="text-gray-400 font-normal">({field.unit})</span>
              </td>
              <td className="px-3 py-2 text-right text-gray-800 whitespace-nowrap">
                {formatCell(data.values[field.key]?.per100g, field.unit)}
              </td>
              <td className="px-3 py-2 text-right text-gray-800 whitespace-nowrap">
                {formatCell(data.values[field.key]?.perBase, field.unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NutritionFields({ nutrition, onChange }) {
  const data = normalizeNutrition(nutrition);

  const updateValue = (key, column, value) => {
    onChange({
      ...data,
      values: {
        ...data.values,
        [key]: {
          ...data.values[key],
          [column]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Etichetta colonna Base</label>
        <input
          type="text"
          value={data.baseLabel}
          onChange={(e) => onChange({ ...data, baseLabel: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="es. 1 pezzo (80 g)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Compare come intestazione della colonna &quot;per Base&quot;. Lascia vuoto se non serve.
        </p>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-gray-700">Nutriente</th>
              <th className="text-left px-3 py-2 font-medium text-gray-700 whitespace-nowrap">per 100 g</th>
              <th className="text-left px-3 py-2 font-medium text-gray-700 whitespace-nowrap">per Base</th>
            </tr>
          </thead>
          <tbody>
            {NUTRITION_FIELDS.map((field) => (
              <tr key={field.key} className="border-t border-gray-100">
                <td className={`px-3 py-2 ${field.indent ? "pl-7 text-gray-500" : "text-gray-800"}`}>
                  {field.label} <span className="text-gray-400">({field.unit})</span>
                </td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={data.values[field.key]?.per100g || ""}
                    onChange={(e) => updateValue(field.key, "per100g", e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    placeholder="–"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={data.values[field.key]?.perBase || ""}
                    onChange={(e) => updateValue(field.key, "perBase", e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    placeholder="–"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
