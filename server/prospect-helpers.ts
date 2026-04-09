import { STATUSES, INTEREST_LEVELS, SALARY_REGEX } from "@shared/schema";

export function getNextStatus(currentStatus: string): string {
  const terminalStatuses = ["Offer", "Rejected", "Withdrawn"];
  if (terminalStatuses.includes(currentStatus)) {
    return currentStatus;
  }
  const index = STATUSES.indexOf(currentStatus as (typeof STATUSES)[number]);
  if (index === -1 || index >= STATUSES.length - 1) {
    return currentStatus;
  }
  const next = STATUSES[index + 1];
  if (next === "Rejected" || next === "Withdrawn") {
    return currentStatus;
  }
  return next;
}

const RATING_FIELDS: { key: string; label: string }[] = [
  { key: "colleaguesRating", label: "Colleagues rating" },
  { key: "workLifeBalanceRating", label: "Work/life balance rating" },
  { key: "excitementRating", label: "Excitement rating" },
];

export function validateProspect(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.companyName || typeof data.companyName !== "string" || data.companyName.trim() === "") {
    errors.push("Company name is required");
  }

  if (!data.roleTitle || typeof data.roleTitle !== "string" || data.roleTitle.trim() === "") {
    errors.push("Role title is required");
  }

  if (data.status !== undefined) {
    if (!STATUSES.includes(data.status as (typeof STATUSES)[number])) {
      errors.push(`Status must be one of: ${STATUSES.join(", ")}`);
    }
  }

  if (data.interestLevel !== undefined) {
    if (!INTEREST_LEVELS.includes(data.interestLevel as (typeof INTEREST_LEVELS)[number])) {
      errors.push(`Interest level must be one of: ${INTEREST_LEVELS.join(", ")}`);
    }
  }

  if (data.salary !== undefined && data.salary !== null && data.salary !== "") {
    const salary = String(data.salary).trim();
    if (!SALARY_REGEX.test(salary)) {
      errors.push("Salary must be in the format $XXX,XXX or a range like $XXX,XXX - $XXX,XXX");
    }
  }

  for (const { key, label } of RATING_FIELDS) {
    const raw = data[key];
    if (raw !== undefined && raw !== null) {
      const asNum = Number(raw);
      if (!Number.isInteger(asNum) || asNum < 1 || asNum > 10) {
        errors.push(`${label} must be an integer between 1 and 10`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function isTerminalStatus(status: string): boolean {
  return status === "Rejected" || status === "Withdrawn" || status === "Offer";
}
