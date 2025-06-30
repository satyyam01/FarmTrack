import { Animal } from "@/types/animal";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { HeartPulse, CheckCircle } from "lucide-react";

interface AnimalHealthCardProps {
  animal: Animal;
  checkupCount: number;
  medicationCount: number;
  onAddRecord: (animal: Animal) => void;
  onViewHistory: (animal: Animal) => void;
  onToggleTreatment?: (animal: Animal) => void;
  userRole?: string | null;
}

export function AnimalHealthCard({ 
    animal, 
    checkupCount, 
    medicationCount, 
    onAddRecord,
    onViewHistory,
    onToggleTreatment,
    userRole
}: AnimalHealthCardProps) {
  return (
    <Card className="shadow-lg border-2 border-muted/40 hover:shadow-xl transition-shadow duration-200 bg-white/90">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                  {animal.under_treatment && <HeartPulse className="w-5 h-5 text-destructive animate-pulse" />}
                  {animal.name}
                </CardTitle>
                <CardDescription>Tag: {animal.tag_number}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={animal.type === 'Cow' ? "default" : "secondary"}>{animal.type}</Badge>
              {animal.under_treatment && (
                <Badge variant="destructive" className="flex items-center gap-1 mt-1"><HeartPulse className="w-3 h-3" /> Under Treatment</Badge>
              )}
            </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
          <div className="flex gap-4 mb-2">
            <span>Age: <span className="font-medium text-foreground">{animal.age}</span></span>
            <span>Gender: <span className="font-medium text-foreground">{animal.gender}</span></span>
          </div>
          <div className="mt-2 pt-2 border-t flex gap-6">
              <span>Checkups: <span className="font-semibold text-primary">{checkupCount}</span></span>
              <span>Ongoing Meds: <span className="font-semibold text-primary">{medicationCount}</span></span>
          </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 items-stretch">
        {(userRole === 'admin' || userRole === 'veterinarian') && (
          <Button
            variant={animal.under_treatment ? "destructive" : "secondary"}
            size="sm"
            className={
              `w-full flex items-center justify-center gap-2 rounded-full font-semibold py-2 px-4 shadow-sm transition-colors ` +
              (animal.under_treatment ? "ring-2 ring-destructive/40" : "ring-2 ring-primary/20")
            }
            onClick={() => onToggleTreatment && onToggleTreatment(animal)}
          >
            {animal.under_treatment ? <><CheckCircle className="w-4 h-4" /> Unmark Treatment</> : <><HeartPulse className="w-4 h-4" /> Mark Under Treatment</>}
          </Button>
        )}
        <div className="flex gap-2">
          {(userRole === 'admin' || userRole === 'veterinarian') && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onAddRecord(animal)}>Add Record</Button>
          )}
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewHistory(animal)}>View History</Button>
        </div>
      </CardFooter>
    </Card>
  );
} 