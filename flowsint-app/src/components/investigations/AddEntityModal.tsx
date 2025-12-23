import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VehicleEntitySelector } from "./VehicleEntitySelector";
import { VehicleSearchPanel } from "./VehicleSearchPanel";

interface AddEntityModalProps {
  investigationId?: string;
  dossierId?: string;
  onEntityAdded?: (entity: any) => void;
}

type EntityCategory = "vehicles" | null;
type VehicleSearchType = "placa" | "veiculo" | "condutor" | "radar" | null;

export function AddEntityModal({ investigationId, dossierId, onEntityAdded }: AddEntityModalProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<EntityCategory>(null);
  const [vehicleSearchType, setVehicleSearchType] = useState<VehicleSearchType>(null);

  const handleReset = () => {
    setCategory(null);
    setVehicleSearchType(null);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(handleReset, 300); // Reset after close animation
  };

  const handleVehicleSelect = (searchType: VehicleSearchType) => {
    setVehicleSearchType(searchType);
  };

  const handleAddToDossier = async (vehicleData: any) => {
    // TODO: Implement API call to add vehicle to dossier
    console.log("Adding vehicle to dossier:", { vehicleData, dossierId, investigationId });
    
    if (onEntityAdded) {
      onEntityAdded(vehicleData);
    }
    
    // Close modal after adding
    handleClose();
  };

  const renderContent = () => {
    // Show vehicle search type selector
    if (category === "vehicles" && !vehicleSearchType) {
      return (
        <VehicleEntitySelector 
          onSelect={handleVehicleSelect}
        />
      );
    }

    // Show vehicle search panel
    if (category === "vehicles" && vehicleSearchType) {
      return (
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => setVehicleSearchType(null)}
            className="mb-4"
          >
            ← Back to Vehicle Types
          </Button>
          <VehicleSearchPanel 
            dossierId={dossierId}
            onAddToDossier={handleAddToDossier}
          />
        </div>
      );
    }

    // Default: Show category selector
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Identities & Entities</h2>
          <p className="text-muted-foreground">
            Select the type of entity you want to add to this investigation
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Vehicles Category */}
          <div
            className="cursor-pointer rounded-lg border-2 border-muted p-6 hover:border-primary transition-colors"
            onClick={() => setCategory("vehicles")}
          >
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Vehicles</h3>
                <p className="text-sm text-muted-foreground">
                  Search vehicles by plate, owner, driver, or radar detections
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-secondary px-2 py-1 rounded">4 search types</span>
              </div>
            </div>
          </div>

          {/* Individual Category - Coming Soon */}
          <div
            className="cursor-not-allowed opacity-50 rounded-lg border-2 border-muted p-6"
          >
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Individual</h3>
                <p className="text-sm text-muted-foreground">
                  Search individuals by CPF, name, or other identifiers
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-muted px-2 py-1 rounded">Coming soon</span>
              </div>
            </div>
          </div>

          {/* Organization Category - Coming Soon */}
          <div
            className="cursor-not-allowed opacity-50 rounded-lg border-2 border-muted p-6"
          >
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                  <path d="M9 9v.01" />
                  <path d="M9 12v.01" />
                  <path d="M9 15v.01" />
                  <path d="M9 18v.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Organization</h3>
                <p className="text-sm text-muted-foreground">
                  Search organizations by CNPJ, name, or other data
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-muted px-2 py-1 rounded">Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleClose();
      } else {
        setOpen(true);
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Entity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category === "vehicles" && vehicleSearchType ? "Search Vehicles" : "Add Entity"}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
