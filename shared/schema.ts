import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const STATUSES = [
  "Bookmarked",
  "Applied",
  "Phone Screen",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export const INTEREST_LEVELS = ["High", "Medium", "Low"] as const;

export const SALARY_REGEX = /^\$\d{1,3}(,\d{3})*(\s*-\s*\$\d{1,3}(,\d{3})*)?$/;

export const prospects = pgTable("prospects", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  roleTitle: text("role_title").notNull(),
  jobUrl: text("job_url"),
  status: text("status").notNull().default("Bookmarked"),
  interestLevel: text("interest_level").notNull().default("Medium"),
  salary: text("salary"),
  notes: text("notes"),
  colleaguesRating: integer("colleagues_rating"),
  workLifeBalanceRating: integer("work_life_balance_rating"),
  excitementRating: integer("excitement_rating"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProspectSchema = createInsertSchema(prospects).omit({
  id: true,
  createdAt: true,
}).extend({
  companyName: z.string().min(1, "Company name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  status: z.enum(STATUSES).default("Bookmarked"),
  interestLevel: z.enum(INTEREST_LEVELS).default("Medium"),
  jobUrl: z.string().optional().nullable(),
  salary: z
    .string()
    .optional()
    .nullable()
    .transform((v) => {
      if (!v || v.trim() === "") return null;
      const t = v.trim();
      return t.startsWith("$") ? t : `$${t}`;
    })
    .refine(
      (v) => !v || SALARY_REGEX.test(v),
      { message: "Salary must be in the format $XXX,XXX or a range like $XXX,XXX - $XXX,XXX" },
    ),
  notes: z.string().optional().nullable(),
  colleaguesRating: z.number().int().min(1).max(10).optional().nullable(),
  workLifeBalanceRating: z.number().int().min(1).max(10).optional().nullable(),
  excitementRating: z.number().int().min(1).max(10).optional().nullable(),
});

export type InsertProspect = z.infer<typeof insertProspectSchema>;
export type Prospect = typeof prospects.$inferSelect;
