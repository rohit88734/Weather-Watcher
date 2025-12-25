import { motion } from "framer-motion";
import { type WeatherData, type Location } from "@shared/schema";
import { 
  Wind, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  CloudSun, 
  Sun, 
  Moon,
  CloudFog,
  CloudLightning,
  Snowflake
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherCardProps {
  weather: WeatherData;
  location: Location;
}

export function WeatherCard({ weather, location }: WeatherCardProps) {
  // Determine gradient based on day/night and condition
  const getBackgroundGradient = () => {
    if (!weather.isDay) return "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950";
    if (weather.weatherCode >= 50 && weather.weatherCode <= 67) return "bg-gradient-to-br from-slate-600 via-slate-500 to-slate-400"; // Rain
    if (weather.weatherCode >= 71) return "bg-gradient-to-br from-blue-100 via-blue-200 to-white text-slate-800"; // Snow
    if (weather.weatherCode >= 95) return "bg-gradient-to-br from-gray-800 via-gray-700 to-yellow-900"; // Thunderstorm
    return "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"; // Clear/Cloudy
  };

  const getWeatherIcon = () => {
    const code = weather.weatherCode;
    const isDay = weather.isDay;
    const iconClass = "w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl text-white/90";

    if (code === 0) return isDay ? <Sun className={iconClass} /> : <Moon className={iconClass} />;
    if (code >= 1 && code <= 3) return <CloudSun className={iconClass} />;
    if (code >= 45 && code <= 48) return <CloudFog className={iconClass} />;
    if (code >= 51 && code <= 67) return <CloudRain className={iconClass} />;
    if (code >= 71 && code <= 77) return <Snowflake className={iconClass} />;
    if (code >= 95) return <CloudLightning className={iconClass} />;
    return <CloudSun className={iconClass} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "w-full rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-between",
        getBackgroundGradient()
      )}
    >
      {/* Abstract patterns overlay */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-2">
            {location.name}
          </h2>
          <p className="text-lg md:text-xl text-white/80 font-medium">
            {[location.admin1, location.country].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-sm font-semibold tracking-wide uppercase">
          {weather.isDay ? "Daytime" : "Nighttime"}
        </div>
      </div>

      {/* Main Weather Display */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 my-12">
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          {getWeatherIcon()}
        </motion.div>
        
        <div className="text-center md:text-left">
          <div className="text-7xl md:text-9xl font-display font-bold leading-none tracking-tighter">
            {Math.round(weather.temperature)}°
          </div>
          <div className="text-2xl md:text-3xl font-medium text-white/90 mt-2 capitalize">
            {weather.condition}
          </div>
        </div>
      </div>

      {/* Weather Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Wind className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-white/60 text-sm font-medium uppercase tracking-wider">Wind Speed</p>
            <p className="text-xl md:text-2xl font-bold font-display">{weather.windSpeed} <span className="text-sm font-normal">km/h</span></p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Droplets className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-white/60 text-sm font-medium uppercase tracking-wider">Humidity</p>
            <p className="text-xl md:text-2xl font-bold font-display">{weather.humidity}<span className="text-sm font-normal">%</span></p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Thermometer className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-white/60 text-sm font-medium uppercase tracking-wider">Feels Like</p>
            <p className="text-xl md:text-2xl font-bold font-display">{Math.round(weather.temperature + (weather.humidity > 60 ? 2 : -2))}°</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
