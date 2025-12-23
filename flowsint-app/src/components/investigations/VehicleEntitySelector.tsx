import { Car, Users, Radar, Navigation } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EntityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  fieldCount: number;
  onClick?: () => void;
}

function EntityCard({ icon, title, description, fieldCount, onClick }: EntityCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={onClick}
    >
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="min-h-[60px]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Badge variant="secondary">{fieldCount} fields</Badge>
      </CardContent>
    </Card>
  );
}

interface VehicleEntitySelectorProps {
  onSelect: (entityType: "placa" | "veiculo" | "condutor" | "radar") => void;
}

export function VehicleEntitySelector({ onSelect }: VehicleEntitySelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vehicles</h2>
        <p className="text-muted-foreground">
          Select a type of vehicle search to add
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EntityCard
          icon={<Car className="h-6 w-6 text-primary" />}
          title="Placa"
          description="Search vehicle by license plate number."
          fieldCount={15}
          onClick={() => onSelect("placa")}
        />

        <EntityCard
          icon={<Car className="h-6 w-6 text-primary" />}
          title="Veículo"
          description="Search by vehicle details like brand, model, or year."
          fieldCount={12}
          onClick={() => onSelect("veiculo")}
        />

        <EntityCard
          icon={<Users className="h-6 w-6 text-primary" />}
          title="Condutor"
          description="Search vehicles by driver's information and CPF."
          fieldCount={8}
          onClick={() => onSelect("condutor")}
        />

        <EntityCard
          icon={<Radar className="h-6 w-6 text-primary" />}
          title="Radar"
          description="Show where this vehicle has been detected by radars."
          fieldCount={10}
          onClick={() => onSelect("radar")}
        />
      </div>
    </div>
  );
}
