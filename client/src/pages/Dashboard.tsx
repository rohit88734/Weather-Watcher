import { useParams, useLocation } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { WeatherCard } from "@/components/WeatherCard";
import { useLocations, useWeather } from "@/hooks/use-weather";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AddLocationDialog } from "@/components/AddLocationDialog";

export default function Dashboard() {
  const params = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { data: locations, isLoading: isLocationsLoading } = useLocations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // If no ID in URL, check if we have locations. If so, redirect to first one.
  // If no locations, we show empty state.
  const locationId = params.id ? parseInt(params.id) : undefined;
  
  useEffect(() => {
    if (!isLocationsLoading && locations && locations.length > 0 && !locationId) {
      navigate(`/location/${locations[0].id}`);
    }
  }, [locations, isLocationsLoading, locationId, navigate]);

  const currentLocation = locations?.find(l => l.id === locationId);
  const { data: weather, isLoading: isWeatherLoading, error } = useWeather(locationId);

  // Empty state logic
  const showEmptyState = !isLocationsLoading && locations?.length === 0;
  const showLoading = isLocationsLoading || (locationId && isWeatherLoading);
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 relative overflow-y-auto h-screen p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center">
        {/* Ambient Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-accent/5 pointer-events-none" />
        
        <div className="w-full max-w-5xl relative z-10">
          {showLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-pulse" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-primary animate-spin" />
              </div>
              <p className="text-muted-foreground animate-pulse font-medium">Fetching atmosphere data...</p>
            </div>
          ) : showEmptyState ? (
            <div className="text-center space-y-6 max-w-md mx-auto py-20 px-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm shadow-2xl">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-bold text-white">No locations yet</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Add your first city to see real-time weather updates, forecasts, and more.
              </p>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
              >
                <Plus className="w-5 h-5" />
                Add Location
              </button>
            </div>
          ) : currentLocation && weather ? (
            <WeatherCard weather={weather} location={currentLocation} />
          ) : error ? (
            <div className="text-center p-12 glass-panel rounded-3xl border-destructive/20">
              <h3 className="text-xl font-bold text-destructive mb-2">Connection Error</h3>
              <p className="text-muted-foreground">Unable to fetch weather data for this location.</p>
            </div>
          ) : null}
        </div>
      </main>

      <AddLocationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
