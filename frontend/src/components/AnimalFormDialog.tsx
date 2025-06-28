import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Animal, AnimalFormData } from "../types/animal";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tag_number: z.string().min(1, "Tag number is required"),
  age: z.coerce.number().min(0, "Age must be a positive number"),
  gender: z.enum(["Male", "Female"]),
  type: z.enum(["Cow", "Goat", "Hen", "Horse", "Sheep"]),
  is_producing_yield: z.boolean().default(false),
});

interface AnimalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AnimalFormData) => void;
  animal?: Animal;
  title: string;
}

export function AnimalFormDialog({
  open,
  onOpenChange,
  onSubmit,
  animal,
  title,
}: AnimalFormDialogProps) {
  const form = useForm<AnimalFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      tag_number: "",
      age: 0,
      gender: "Male",
      type: "Cow",
      is_producing_yield: false,
    },
  });

  const gender = form.watch("gender");

  useEffect(() => {
    if (animal) {
      form.reset({
        name: animal.name,
        tag_number: animal.tag_number,
        age: animal.age,
        gender: animal.gender,
        type: animal.type,
        is_producing_yield: animal.is_producing_yield || false,
      });
    } else {
      form.reset({
        name: "",
        tag_number: "",
        age: 0,
        gender: "Male",
        type: "Cow",
        is_producing_yield: false,
      });
    }
    console.log('Form reset with values:', form.getValues());
  }, [animal, form]);

  const handleSubmit = (data: AnimalFormData) => {
    console.log('AnimalFormDialog handleSubmit called with data:', data);
    console.log('Form is valid:', form.formState.isValid);
    console.log('Form errors:', form.formState.errors);
    
    try {
      // Ensure is_producing_yield is set for female animals
      if (data.gender === 'Female' && data.is_producing_yield === undefined) {
        data.is_producing_yield = false;
      }
      
      onSubmit(data);
      console.log('onSubmit called successfully');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      console.log('Dialog onOpenChange called with:', newOpen);
      if (!newOpen) {
        // Only close if form is not being submitted
        console.log('Attempting to close dialog');
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              console.log('Form onSubmit event triggered');
              form.handleSubmit(handleSubmit)(e);
            }} 
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {gender === "Female" && (
              <FormField
                control={form.control}
                name="is_producing_yield"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Producing Yield</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        console.log('is_producing_yield changed to:', value);
                        field.onChange(value === "true");
                      }}
                      value={field.value ? "true" : "false"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {gender === "Male" && (
              <FormField
                control={form.control}
                name="is_producing_yield"
                render={({ field }) => (
                  <input type="hidden" {...field} value="false" />
                )}
              />
            )}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cow">Cow</SelectItem>
                      <SelectItem value="Goat">Goat</SelectItem>
                      <SelectItem value="Hen">Hen</SelectItem>
                      <SelectItem value="Horse">Horse</SelectItem>
                      <SelectItem value="Sheep">Sheep</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="submit"
                onClick={() => {
                  console.log('Save button clicked');
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}