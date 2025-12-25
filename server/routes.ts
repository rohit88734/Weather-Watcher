import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

function getWeatherCondition(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 71 && code <= 75) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";
  return "Unknown";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Locations CRUD
  app.get(api.locations.list.path, async (req, res) => {
    const locations = await storage.getLocations();
    res.json(locations);
  });

  app.post(api.locations.create.path, async (req, res) => {
    try {
      const input = api.locations.create.input.parse(req.body);
      const location = await storage.createLocation(input);
      res.status(201).json(location);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.locations.delete.path, async (req, res) => {
    await storage.deleteLocation(Number(req.params.id));
    res.status(204).send();
  });

  // Proxy: Geocoding Search
  app.get(api.locations.search.path, async (req, res) => {
    const query = req.query.query as string;
    if (!query) return res.json([]);

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );
      const data = await response.json();
      
      if (!data.results) return res.json([]);

      const results = data.results.map((item: any) => ({
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country,
        admin1: item.admin1,
      }));
      
      res.json(results);
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ message: "Failed to search locations" });
    }
  });

  // Proxy: Weather Data
  app.get(api.weather.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const location = await storage.getLocation(id);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day`
      );
      const data = await response.json();
      
      if (!data.current) {
        throw new Error("Invalid weather data received");
      }

      const weather = {
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        windSpeed: data.current.wind_speed_10m,
        humidity: data.current.relative_humidity_2m,
        condition: getWeatherCondition(data.current.weather_code),
        isDay: data.current.is_day,
      };

      res.json(weather);
    } catch (error) {
      console.error("Weather fetch error:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Seed default locations if empty
  const existingLocations = await storage.getLocations();
  if (existingLocations.length === 0) {
    await storage.createLocation({
      name: "London",
      latitude: 51.5074,
      longitude: -0.1278,
      country: "United Kingdom",
      admin1: "England"
    });
    await storage.createLocation({
      name: "New York",
      latitude: 40.7128,
      longitude: -74.0060,
      country: "United States",
      admin1: "New York"
    });
  }

  return httpServer;
}
