// Simple leveling curve: each level requires a bit more XP than the last,
// so early levels come quickly (satisfying at the start) and it gradually
// takes more effort — completing a task is worth 10 XP, logging a habit
// is worth 5 XP.
export function levelFromXp(xp: number) {
  let level = 1;
  let remaining = xp;
  let needed = 100;
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed += 50;
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: needed };
}
