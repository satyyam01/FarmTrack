import { Animal } from "../types/animal";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Trash2 } from "lucide-react";

interface AnimalCardProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onDelete: (animal: Animal) => void;
}

export function AnimalCard({ animal, onEdit, onDelete }: AnimalCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{animal.name}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {animal.tagNumber}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span>{animal.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Age:</span>
            <span>{animal.age} years</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gender:</span>
            <span>{animal.gender}</span>
          </div>
          {animal.gender === "Female" && animal.lastPregnancyDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Pregnancy:</span>
              <span>{new Date(animal.lastPregnancyDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onEdit(animal)}
        >
          Edit
        </Button>
        <Button 
          variant="destructive" 
          size="icon"
          className="rounded-full"
          onClick={() => onDelete(animal)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
