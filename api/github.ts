const GITHUB_USERNAME = "CajesJM";

type ContributionDay = {
  contributionCount: number;
  contributionLevel: string;
  date: string;
  weekday: number;
};

type GitHubResponse = {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          months: Array<{
            name: string;
            year: number;
            totalWeeks: number;
          }>;
          weeks: Array<{
            contributionDays: ContributionDay[];
          }>;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
};

function json(data: object, status = 200, cache = false) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": cache
        ? "public, s-maxage=86400, stale-while-revalidate=604800"
        : "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function getCurrentStreak(days: ContributionDay[]) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  let index = sorted.length - 1;

  if (index >= 0 && sorted[index].contributionCount === 0) index -= 1;

  let streak = 0;
  while (index >= 0 && sorted[index].contributionCount > 0) {
    streak += 1;
    index -= 1;
  }
  return streak;
}

export default {
  async fetch(request: Request) {
    if (request.method !== "GET") {
      return json({ message: "Method not allowed." }, 405);
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return json(
        { message: "GitHub activity is temporarily unavailable." },
        503,
      );
    }

    const to = new Date();
    const from = new Date(to);
    from.setUTCFullYear(from.getUTCFullYear() - 1);

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "jm-cajes-portfolio/1.0",
      },
      body: JSON.stringify({
        query: `
          query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $login) {
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  totalContributions
                  months { name year totalWeeks }
                  weeks {
                    contributionDays {
                      contributionCount
                      contributionLevel
                      date
                      weekday
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          login: GITHUB_USERNAME,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
    });

    if (!response.ok) {
      console.error("GitHub API request failed:", response.status);
      return json({ message: "GitHub activity could not be loaded." }, 502);
    }

    const result = (await response.json()) as GitHubResponse;
    const calendar = result.data?.user?.contributionsCollection.contributionCalendar;

    if (!calendar || result.errors?.length) {
      console.error("GitHub GraphQL error:", result.errors);
      return json({ message: "GitHub activity could not be loaded." }, 502);
    }

    const days = calendar.weeks.flatMap((week) => week.contributionDays);

    return json(
      {
        username: GITHUB_USERNAME,
        totalContributions: calendar.totalContributions,
        activeDays: days.filter((day) => day.contributionCount > 0).length,
        currentStreak: getCurrentStreak(days),
        months: calendar.months,
        weeks: calendar.weeks,
        updatedAt: new Date().toISOString(),
      },
      200,
      true,
    );
  },
};
