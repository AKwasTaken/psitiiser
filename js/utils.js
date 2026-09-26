export function randomPick(arr, n) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

export async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}
