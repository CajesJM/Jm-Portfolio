import { useEffect, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import "../styles/GitHubActivity.css";

type ContributionDay = {
  contributionCount: number;
  contributionLevel: string;
  date: string;
  weekday: number;
};

type ActivityData = {
  username: string;
  totalContributions: number;
  activeDays: number;
  currentStreak: number;
  months: Array<{ name: string; year: number; totalWeeks: number }>;
  weeks: Array<{ contributionDays: ContributionDay[] }>;
};

type LoadState = "loading" | "ready" | "error";

const levelNames: Record<string, string> = {
  NONE: "none",
  FIRST_QUARTILE: "low",
  SECOND_QUARTILE: "medium",
  THIRD_QUARTILE: "high",
  FOURTH_QUARTILE: "highest",
};

export default function GitHubActivity() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function loadActivity() {
      try {
        const response = await fetch("/api/github", {
          signal: controller.signal,
        });
        const contentType = response.headers.get("content-type") ?? "";
        if (!response.ok || !contentType.includes("application/json")) {
          throw new Error("Activity unavailable");
        }
        setData((await response.json()) as ActivityData);
        setState("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setState("error");
      }
    }

    loadActivity();
    return () => controller.abort();
  }, []);

  return (
    <section id="activity" className="activity">
      <div className="container">
        <div className="activity__header">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <span className="eyebrow">Build log / Live from GitHub</span>
            <h2 className="section-heading">A year of building.</h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.1 }}
          >
            A running record of experiments, improvements, and work shipped
            along the way.
          </motion.p>
        </div>

        <motion.div
          className="activity__panel"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65 }}
        >
          {state === "loading" && (
            <div className="activity__loading" aria-live="polite">
              <span className="mono">Loading build log</span>
              <div aria-hidden="true">
                {Array.from({ length: 53 }, (_, index) => (
                  <i key={index} />
                ))}
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="activity__empty" role="status">
              <span className="mono">Live feed unavailable</span>
              <p>
                The work is still happening. See the latest directly on GitHub.
              </p>
              <a
                className="button"
                href="https://github.com/CajesJM"
                target="_blank"
                rel="noreferrer"
              >
                View GitHub profile ↗
              </a>
            </div>
          )}

          {state === "ready" && data && (
            <>
              <div className="activity__stats">
                <div>
                  <strong>{data.totalContributions}</strong>
                  <span className="mono">Contributions</span>
                </div>
                <div>
                  <strong>{data.activeDays}</strong>
                  <span className="mono">Active days</span>
                </div>
                <div>
                  <strong>{data.currentStreak}</strong>
                  <span className="mono">Day streak</span>
                </div>
              </div>

              <div
                className="activity__scroll"
                tabIndex={0}
                aria-label="GitHub contribution calendar"
              >
                <div className="activity__calendar">
                  <div className="activity__months" aria-hidden="true">
                    {data.months.map((month, index) => (
                      <span
                        key={`${month.name}-${month.year}-${index}`}
                        style={{
                          gridColumn: `span ${Math.max(month.totalWeeks, 1)}`,
                        }}
                      >
                        {month.name.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                  <div className="activity__body">
                    <div className="activity__days mono" aria-hidden="true">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                    </div>
                    <div className="activity__weeks">
                      {data.weeks.map((week, weekIndex) => (
                        <div className="activity__week" key={weekIndex}>
                          {week.contributionDays.map((day, dayIndex) => {
                            const label = `${day.contributionCount} contribution${day.contributionCount === 1 ? "" : "s"} on ${new Date(`${day.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
                            return (
                              <span
                                className="activity__cell"
                                data-level={
                                  levelNames[day.contributionLevel] ?? "none"
                                }
                                data-tooltip={label}
                                aria-label={label}
                                role="img"
                                key={day.date}
                                style={
                                  {
                                    gridRow: day.weekday + 1,
                                    "--cell-delay": `${weekIndex * 10 + dayIndex * 4}ms`,
                                  } as CSSProperties
                                }
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="activity__legend mono" aria-hidden="true">
                <span>Less</span>
                <i data-level="none" />
                <i data-level="low" />
                <i data-level="medium" />
                <i data-level="high" />
                <i data-level="highest" />
                <span>More</span>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
