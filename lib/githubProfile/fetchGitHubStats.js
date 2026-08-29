import { GITHUB_USERNAME } from './config';
import { computeStreaks } from './streaks';
import { getContributionYear } from './utils';

const GITHUB_GRAPHQL = `
  query ($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

const emptyStats = (errorMessage) => ({
  username: GITHUB_USERNAME,
  contributionYear: getContributionYear(),
  totalContributions: 0,
  currentStreak: 0,
  longestStreak: 0,
  weeks: [],
  error: errorMessage,
});

async function fetchContributionYear(token, username, year) {
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'akshat-github-profile-svg',
    },
    body: JSON.stringify({
      query: GITHUB_GRAPHQL,
      variables: { username, from, to },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status}).`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || 'GitHub GraphQL error.');
  }

  return payload.data?.user?.contributionsCollection?.contributionCalendar ?? null;
}

const mergeDays = (weekLists) => {
  const dayMap = new Map();

  for (const weeks of weekLists) {
    for (const week of weeks || []) {
      for (const day of week.contributionDays || []) {
        dayMap.set(day.date, {
          date: day.date,
          contributionCount: Number(day.contributionCount || 0),
        });
      }
    }
  }

  return [...dayMap.values()].sort((a, b) => a.date.localeCompare(b.date));
};

const weeksForYear = (weeks, year) => {
  const yearPrefix = `${year}-`;

  return (weeks || [])
    .map((week) => ({
      contributionDays: (week.contributionDays || []).filter((day) =>
        day.date.startsWith(yearPrefix)
      ),
    }))
    .filter((week) => week.contributionDays.length > 0);
};

export async function fetchGitHubStats() {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    return emptyStats(
      'Add GITHUB_TOKEN to .env.local (local) or Vercel env vars, then restart the dev server.'
    );
  }

  const contributionYear = getContributionYear();
  const fromYear = Number(process.env.GITHUB_CONTRIBUTIONS_FROM_YEAR || 2020);
  const startYear = Math.min(contributionYear, Math.max(2008, fromYear));

  try {
    const yearCalendars = await Promise.all(
      Array.from({ length: contributionYear - startYear + 1 }, (_, index) => {
        const year = startYear + index;
        return fetchContributionYear(token, GITHUB_USERNAME, year);
      })
    );

    if (yearCalendars.every((calendar) => !calendar)) {
      return emptyStats('GitHub user or contribution calendar not found.');
    }

    const totalContributions = yearCalendars.reduce(
      (sum, calendar) => sum + (calendar?.totalContributions || 0),
      0
    );

    const currentYearCalendar = yearCalendars[yearCalendars.length - 1];
    const weeks = weeksForYear(currentYearCalendar?.weeks || [], contributionYear);
    const days = mergeDays(yearCalendars.map((calendar) => calendar?.weeks || []));
    const { currentStreak, longestStreak } = computeStreaks(days);

    return {
      username: GITHUB_USERNAME,
      contributionYear,
      totalContributions,
      currentStreak,
      longestStreak,
      weeks,
      error: null,
    };
  } catch (error) {
    return emptyStats(error.message || 'Failed to fetch GitHub stats.');
  }
}
