import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto glass-panel border-white/10">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold font-display text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            The weather station you are looking for has been moved or does not exist.
          </p>

          <div className="mt-6">
            <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Return Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
