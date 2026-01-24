import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Solar project models saved by users
 */
export const solarModels = mysqlTable("solar_models", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  mw: int("mw").notNull(),
  capexPerMW: int("capexPerMW").notNull(),
  privateWireCost: int("privateWireCost").notNull(),
  gridConnectionCost: int("gridConnectionCost").default(0).notNull(),
  developmentPremiumPerMW: int("developmentPremiumPerMW").notNull(),
  opexPerMW: int("opexPerMW").notNull(),
  opexEscalation: varchar("opexEscalation", { length: 20 }).notNull(),
  generationPerMW: varchar("generationPerMW", { length: 20 }).notNull(),
  degradationRate: varchar("degradationRate", { length: 20 }).notNull(),
  projectLife: int("projectLife").notNull(),
  discountRate: varchar("discountRate", { length: 20 }).notNull(),
  powerPrice: int("powerPrice").notNull(),
  lcoe: varchar("lcoe", { length: 20 }),
  irr: varchar("irr", { length: 20 }),
  paybackPeriod: varchar("paybackPeriod", { length: 20 }),
  totalNpv: varchar("totalNpv", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SolarModel = typeof solarModels.$inferSelect;
export type InsertSolarModel = typeof solarModels.$inferInsert;

/**
 * Grid connection cost breakdown for solar projects
 */
export const gridConnectionCosts = mysqlTable("grid_connection_costs", {
  id: int("id").autoincrement().primaryKey(),
  solarModelId: int("solarModelId").notNull(),
  // Trenching costs
  agriculturalTrenchingMin: int("agriculturalTrenchingMin").default(600000).notNull(),
  agriculturalTrenchingMax: int("agriculturalTrenchingMax").default(1050000).notNull(),
  roadTrenchingMin: int("roadTrenchingMin").default(1200000).notNull(),
  roadTrenchingMax: int("roadTrenchingMax").default(2400000).notNull(),
  // Major crossings
  majorRoadCrossingsMin: int("majorRoadCrossingsMin").default(300000).notNull(),
  majorRoadCrossingsMax: int("majorRoadCrossingsMax").default(600000).notNull(),
  // Joint bays and terminations
  jointBaysMin: int("jointBaysMin").default(120000).notNull(),
  jointBaysMax: int("jointBaysMax").default(240000).notNull(),
  // Transformers
  transformersMin: int("transformersMin").default(500000).notNull(),
  transformersMax: int("transformersMax").default(800000).notNull(),
  // Land rights - compensation
  landRightsCompensationMin: int("landRightsCompensationMin").default(20000).notNull(),
  landRightsCompensationMax: int("landRightsCompensationMax").default(60000).notNull(),
  // Land rights - legal fees
  landRightsLegalMin: int("landRightsLegalMin").default(50000).notNull(),
  landRightsLegalMax: int("landRightsLegalMax").default(90000).notNull(),
  // Planning
  planningFeesMin: int("planningFeesMin").default(600).notNull(),
  planningFeesMax: int("planningFeesMax").default(1200).notNull(),
  planningConsentsMin: int("planningConsentsMin").default(15000).notNull(),
  planningConsentsMax: int("planningConsentsMax").default(40000).notNull(),
  // Calculated totals
  constructionMin: int("constructionMin").default(3200000).notNull(),
  constructionMax: int("constructionMax").default(4200000).notNull(),
  softCostsMin: int("softCostsMin").default(85000).notNull(),
  softCostsMax: int("softCostsMax").default(190000).notNull(),
  projectMin: int("projectMin").default(3300000).notNull(),
  projectMax: int("projectMax").default(4400000).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GridConnectionCost = typeof gridConnectionCosts.$inferSelect;
export type InsertGridConnectionCost = typeof gridConnectionCosts.$inferInsert;