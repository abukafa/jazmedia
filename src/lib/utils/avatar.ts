/**
 * Extracts 1-2 uppercase initials from a person's name.
 * e.g.:
 * "Abdul Aziz" -> "AA"
 * "Mr. Abukafa" -> "MA"
 * "Radhan" -> "RA"
 * "" or undefined -> "U"
 */
export function getInitials(name?: string | null): string {
  if (!name || typeof name !== "string") return "U";
  const trimmed = name.trim();
  if (!trimmed) return "U";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
