import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertLocation } from "@shared/schema";

export function useLocations() {
  return useQuery({
    queryKey: [api.locations.list.path],
    queryFn: async () => {
      const res = await fetch(api.locations.list.path);
      if (!res.ok) throw new Error("Failed to fetch locations");
      return api.locations.list.responses[200].parse(await res.json());
    },
  });
}

export function useAddLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertLocation) => {
      // Validate input before sending - helpful for debugging
      const validated = api.locations.create.input.parse(data);
      
      const res = await fetch(api.locations.create.path, {
        method: api.locations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.locations.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to add location");
      }
      
      return api.locations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.locations.list.path] });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.locations.delete.path, { id });
      const res = await fetch(url, {
        method: api.locations.delete.method,
      });
      
      if (!res.ok) throw new Error("Failed to delete location");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.locations.list.path] });
    },
  });
}

export function useSearchLocations(query: string) {
  return useQuery({
    queryKey: [api.locations.search.path, query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      // Construct URL with query param
      const url = `${api.locations.search.path}?query=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Search failed");
      return api.locations.search.responses[200].parse(await res.json());
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache search results for 5 mins
  });
}

export function useWeather(locationId: number | undefined) {
  return useQuery({
    queryKey: [api.weather.get.path, locationId],
    queryFn: async () => {
      if (!locationId) return null;
      
      const url = buildUrl(api.weather.get.path, { id: locationId });
      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Failed to fetch weather");
      return api.weather.get.responses[200].parse(await res.json());
    },
    enabled: !!locationId,
    refetchInterval: 60000, // Refresh every minute
  });
}
