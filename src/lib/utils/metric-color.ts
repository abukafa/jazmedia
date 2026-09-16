export interface MetricColorConfig {
  bar: string;
  text: string;
  badge: string;
  accent: string;
  iconBg: string;
  bgLight: string;
  border: string;
  label: string;
}

/**
 * Returns unified dynamic color classes based on numeric metric value (0 - 100).
 * - For positive metrics (Achievement, Lessons, Priority, Health, Average):
 *     >= 80: Emerald (Sangat Baik)
 *     60-79: Blue (Baik)
 *     40-59: Amber (Cukup)
 *     < 40:  Rose (Perlu Perhatian)
 * - For negative metric (Obstacles / Kendala):
 *     <= 20 (score >= 80): Emerald (Lancar)
 *     21-40 (score >= 60): Blue (Terkendali)
 *     41-60 (score >= 40): Amber (Ada Hambatan)
 *     > 60  (score < 40):  Rose (Hambatan Berat)
 */
export function getMetricColor(value: number, isObstacle = false): MetricColorConfig {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const score = isObstacle ? 100 - clamped : clamped;

  if (score >= 80) {
    return {
      bar: "bg-emerald-500",
      text: "text-emerald-600",
      badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
      accent: "accent-emerald-600",
      iconBg: "bg-emerald-100 text-emerald-700",
      bgLight: "bg-emerald-50",
      border: "border-emerald-200",
      label: isObstacle ? "Lancar" : "Sangat Baik",
    };
  }

  if (score >= 60) {
    return {
      bar: "bg-blue-500",
      text: "text-blue-600",
      badge: "bg-blue-50 border-blue-200 text-blue-700",
      accent: "accent-blue-600",
      iconBg: "bg-blue-100 text-blue-700",
      bgLight: "bg-blue-50",
      border: "border-blue-200",
      label: isObstacle ? "Terkendali" : "Baik",
    };
  }

  if (score >= 40) {
    return {
      bar: "bg-amber-500",
      text: "text-amber-600",
      badge: "bg-amber-50 border-amber-200 text-amber-700",
      accent: "accent-amber-600",
      iconBg: "bg-amber-100 text-amber-700",
      bgLight: "bg-amber-50",
      border: "border-amber-200",
      label: isObstacle ? "Ada Hambatan" : "Cukup",
    };
  }

  return {
    bar: "bg-rose-500",
    text: "text-rose-600",
    badge: "bg-rose-50 border-rose-200 text-rose-700",
    accent: "accent-rose-600",
    iconBg: "bg-rose-100 text-rose-700",
    bgLight: "bg-rose-50",
    border: "border-rose-200",
    label: isObstacle ? "Hambatan Berat" : "Perlu Perhatian",
  };
}