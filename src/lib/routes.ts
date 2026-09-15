/** Robot IDs are free text (spaces, "#"), so every link encodes them and every page decodes the param. */
export function robotPath(id: string, sub?: "connector") {
  const base = `/fleet/${encodeURIComponent(id)}`;
  return sub ? `${base}/${sub}` : base;
}

export function consolePath(id: string) {
  return `/console?robot=${encodeURIComponent(id)}`;
}

export function decodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
