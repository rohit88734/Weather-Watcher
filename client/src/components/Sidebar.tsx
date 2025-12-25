import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MapPin, Plus, Trash2, CloudSun } from "lucide-react";
import { useLocations, useDeleteLocation } from "@/hooks/use-weather";
import { AddLocationDialog } from "./AddLocationDialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { data: locations, isLoading } = useLocations();
  const { mutate: deleteLocation } = useDeleteLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Extract ID from path like /location/123
  const currentId = location.startsWith('/location/') 
    ? parseInt(location.split('/')[2]) 
    : locations?.[0]?.id;

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this location?")) {
      deleteLocation(id);
      if (currentId === id && locations && locations.length > 1) {
        const next = locations.find(l => l.id !== id);
        if (next) setLocation(`/location/${next.id}`);
      } else if (locations?.length === 1) {
        setLocation('/');
      }
    }
  };

  return (
    <div className="w-full md:w-80 h-full flex flex-col glass-panel border-r border-white/5 md:h-screen sticky top-0 bg-background/95 md:bg-background/80">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20">
            <CloudSun className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Weather X
          </h1>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
        >
          <Plus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">Add New Location</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {isLoading ? (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center animate-pulse">
            Loading places...
          </div>
        ) : locations?.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <MapPin className="w-8 h-8 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No locations saved yet.</p>
          </div>
        ) : (
          <AnimatePresence>
            {locations?.map((loc) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                layout
              >
                <Link href={`/location/${loc.id}`} className={cn(
                  "relative group flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer border border-transparent",
                  currentId === loc.id 
                    ? "bg-primary/10 border-primary/20 shadow-sm" 
                    : "hover:bg-white/5 hover:border-white/5"
                )}>
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      currentId === loc.id ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
                    )} />
                    <div className="truncate">
                      <p className={cn(
                        "font-medium truncate text-sm",
                        currentId === loc.id ? "text-white" : "text-muted-foreground group-hover:text-white"
                      )}>
                        {loc.name}
                      </p>
                      {loc.admin1 && (
                        <p className="text-xs text-muted-foreground/60 truncate">{loc.admin1}, {loc.country}</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => handleDelete(e, loc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/20 hover:text-destructive rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="p-4 border-t border-white/5 text-xs text-center text-muted-foreground/40">
        Updates automatically every minute
      </div>

      <AddLocationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
