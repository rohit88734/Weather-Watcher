import { pgTable, text, serial, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  isFavorite: boolean("is_favorite").default(false),
  country: text("country"),
  admin1: text("admin1"), // State/Region
});

export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type WeatherData = {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  condition: string;
  isDay: number;
};

export type SearchResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};
