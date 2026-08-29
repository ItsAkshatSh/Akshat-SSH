const toDateKey = (date) => date.toISOString().slice(0, 10);

const parseDay = (day) => ({
  date: day.date,
  count: Number(day.contributionCount || 0),
});

export const computeStreaks = (days) => {
  const sorted = [...days]
    .map(parseDay)
    .sort((a, b) => a.date.localeCompare(b.date));

  let longestStreak = 0;
  let running = 0;

  for (const day of sorted) {
    if (day.count > 0) {
      running += 1;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 0;
    }
  }

  const countsByDate = new Map(sorted.map((day) => [day.date, day.count]));
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let currentStreak = 0;
  let cursor = new Date(today);

  const todayKey = toDateKey(cursor);
  const todayCount = countsByDate.get(todayKey) || 0;

  if (todayCount === 0) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (true) {
    const key = toDateKey(cursor);
    const count = countsByDate.get(key) || 0;
    if (count <= 0) break;
    currentStreak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { currentStreak, longestStreak };
};

export const flattenWeeks = (weeks) =>
  weeks.flatMap((week) => week.contributionDays || []);
