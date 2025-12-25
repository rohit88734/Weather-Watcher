import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2, MapPin } from "lucide-react";
import { useSearchLocations, useAddLocation } from "@/hooks/use-weather";
import { useDebounce } from "@/hooks/use-debounce"; // We'll need to create this quickly inside hooks
import { useLocation } from "wouter";

interface AddLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLocationDialog({ open, onOpenChange }: AddLocationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  const { data: results, isLoading } = useSearchLocations(debouncedQuery);
  const { mutate: addLocation, isPending: isAdding } = useAddLocation();
  const [_, setLocation] = useLocation();

  const handleSelect = (result: any) => {
    addLocation({
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      admin1: result.admin1,
      isFavorite: false
    }, {
      onSuccess: (data) => {
        onOpenChange(false);
        setSearchQuery("");
        setLocation(`/location/${data.id}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Add Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search city (e.g. London, Tokyo)..."
              className="pl-9 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-1 pr-1">
            {isLoading && searchQuery.length >= 2 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <span className="text-sm">Searching global database...</span>
              </div>
            ) : results?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No cities found matching "{searchQuery}"
              </div>
            ) : results ? (
              results.map((result, idx) => (
                <button
                  key={`${result.latitude}-${result.longitude}-${idx}`}
                  disabled={isAdding}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left p-3 rounded-lg hover:bg-white/5 hover:text-primary transition-all flex items-center gap-3 group border border-transparent hover:border-white/5"
                >
                  <div className="p-2 rounded-full bg-white/5 group-hover:bg-primary/10 transition-colors">
                    <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[result.admin1, result.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  {isAdding && <Loader2 className="w-4 h-4 ml-auto animate-spin text-primary" />}
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground/50 text-sm">
                Type at least 2 characters to search
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
