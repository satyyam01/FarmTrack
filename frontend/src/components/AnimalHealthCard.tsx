import { Animal } from "@/types/animal";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnimalHealthCardProps {
  animal: Animal;
  checkupCount: number;
  medicationCount: number;
  onAddCheckup: () => void;
  onAddMedication: () => void;
}

export function AnimalHealthCard({ 
    animal, 
    checkupCount, 
    medicationCount, 
    onAddCheckup, 
    onAddMedication 
}: AnimalHealthCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{animal.name}</CardTitle>
                <CardDescription>Tag: {animal.tag_number}</CardDescription>
            </div>
            <Badge variant={animal.type === 'Cow' ? "default" : "secondary"}>{animal.type}</Badge> 
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
          <p>Age: {animal.age}</p>
          <p>Gender: {animal.gender}</p>
          <div className="mt-2 pt-2 border-t">
              <p>Checkups: {checkupCount}</p>
              <p>Medications: {medicationCount}</p>
          </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onAddCheckup}>Checkups</Button>
        <Button variant="outline" size="sm" onClick={onAddMedication}>Medications</Button>
      </CardFooter>
    </Card>
  );
} 