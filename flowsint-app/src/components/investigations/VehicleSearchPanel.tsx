import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface VehicleSearchPanelProps {
  dossierId?: string;
  onAddToDossier?: (vehicleData: any) => void;
}

export function VehicleSearchPanel({ dossierId, onAddToDossier }: VehicleSearchPanelProps) {
  const [activeTab, setActiveTab] = useState("placa");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Search by Plate
  const [plateQuery, setPlateQuery] = useState("");

  // Search by Owner CPF
  const [ownerCpf, setOwnerCpf] = useState("");

  // Search by Driver CPF
  const [driverCpf, setDriverCpf] = useState("");

  // Search by Radar
  const [radarLocation, setRadarLocation] = useState("");
  const [radarDateFrom, setRadarDateFrom] = useState("");
  const [radarDateTo, setRadarDateTo] = useState("");

  const searchByPlate = async () => {
    if (!plateQuery.trim()) {
      toast.error("Please enter a license plate");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/vehicles/search/plate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate: plateQuery.toUpperCase() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Search failed");
      }

      const data = await response.json();
      setResults(data);
      
      if (data.total === 0) {
        toast.info("No vehicles found with this plate");
      } else {
        toast.success(`Found ${data.total} vehicle(s)`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to search vehicles");
    } finally {
      setLoading(false);
    }
  };

  const searchByOwner = async () => {
    if (!ownerCpf.trim()) {
      toast.error("Please enter owner's CPF");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/vehicles/search/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_cpf: ownerCpf.replace(/\D/g, "") }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Search failed");
      }

      const data = await response.json();
      setResults(data);
      
      if (data.total === 0) {
        toast.info("No vehicles found for this owner");
      } else {
        toast.success(`Found ${data.total} vehicle(s)`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to search vehicles");
    } finally {
      setLoading(false);
    }
  };

  const searchByDriver = async () => {
    if (!driverCpf.trim()) {
      toast.error("Please enter driver's CPF");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/vehicles/search/driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver_cpf: driverCpf.replace(/\D/g, "") }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Search failed");
      }

      const data = await response.json();
      setResults(data);
      
      if (data.total === 0) {
        toast.info("No vehicles found for this driver");
      } else {
        toast.success(`Found ${data.total} vehicle(s)`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to search vehicles");
    } finally {
      setLoading(false);
    }
  };

  const searchByRadar = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/vehicles/search/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          location: radarLocation || undefined,
          date_from: radarDateFrom || undefined,
          date_to: radarDateTo || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Search failed");
      }

      const data = await response.json();
      setResults(data);
      
      if (data.total === 0) {
        toast.info("No radar detections found");
      } else {
        toast.success(`Found ${data.total} detection(s)`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to search radar detections");
    } finally {
      setLoading(false);
    }
  };

  const formatCpf = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, "");
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPlate = (plate: string) => {
    return plate.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="placa">Placa</TabsTrigger>
          <TabsTrigger value="veiculo">Veículo</TabsTrigger>
          <TabsTrigger value="condutor">Condutor</TabsTrigger>
          <TabsTrigger value="radar">Radar</TabsTrigger>
        </TabsList>

        {/* Search by Plate */}
        <TabsContent value="placa" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plate">License Plate</Label>
            <div className="flex gap-2">
              <Input
                id="plate"
                placeholder="ABC1234"
                value={plateQuery}
                onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
                maxLength={7}
              />
              <Button onClick={searchByPlate} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Search by Owner */}
        <TabsContent value="veiculo" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner-cpf">Owner's CPF</Label>
            <div className="flex gap-2">
              <Input
                id="owner-cpf"
                placeholder="000.000.000-00"
                value={ownerCpf}
                onChange={(e) => setOwnerCpf(e.target.value)}
                maxLength={14}
              />
              <Button onClick={searchByOwner} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Search vehicles by owner's CPF number
            </p>
          </div>
        </TabsContent>

        {/* Search by Driver */}
        <TabsContent value="condutor" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="driver-cpf">Driver's CPF</Label>
            <div className="flex gap-2">
              <Input
                id="driver-cpf"
                placeholder="000.000.000-00"
                value={driverCpf}
                onChange={(e) => setDriverCpf(e.target.value)}
                maxLength={14}
              />
              <Button onClick={searchByDriver} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Search vehicles by driver's CPF number
            </p>
          </div>
        </TabsContent>

        {/* Search by Radar */}
        <TabsContent value="radar" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="radar-location">Location (optional)</Label>
            <Input
              id="radar-location"
              placeholder="City or street name"
              value={radarLocation}
              onChange={(e) => setRadarLocation(e.target.value)}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date-from">Date From (optional)</Label>
              <Input
                id="date-from"
                type="date"
                value={radarDateFrom}
                onChange={(e) => setRadarDateFrom(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-to">Date To (optional)</Label>
              <Input
                id="date-to"
                type="date"
                value={radarDateTo}
                onChange={(e) => setRadarDateTo(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={searchByRadar} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search Radar Detections
          </Button>
        </TabsContent>
      </Tabs>

      {/* Results Table */}
      {results && results.total > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Results ({results.total})
          </h3>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate</TableHead>
                  <TableHead>Brand/Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.items.map((vehicle: any) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{formatPlate(vehicle.plate)}</TableCell>
                    <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>{vehicle.color}</TableCell>
                    <TableCell>{vehicle.owner_name}</TableCell>
                    <TableCell>
                      {vehicle.restrictions?.length > 0 ? (
                        <Badge variant="destructive">Restricted</Badge>
                      ) : (
                        <Badge variant="success">Clear</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {onAddToDossier && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onAddToDossier(vehicle)}
                        >
                          Add to Dossier
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Radar Detections Results */}
      {activeTab === "radar" && results && results.detections && results.detections.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Radar Detections ({results.detections.length})
          </h3>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Speed</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Fine</TableHead>
                  <TableHead>Plate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.detections.map((detection: any) => (
                  <TableRow key={detection.id}>
                    <TableCell>{new Date(detection.detection_date).toLocaleString()}</TableCell>
                    <TableCell>{detection.location}</TableCell>
                    <TableCell>{detection.speed} km/h</TableCell>
                    <TableCell>{detection.speed_limit} km/h</TableCell>
                    <TableCell>
                      {detection.has_fine ? (
                        <Badge variant="destructive">R$ {detection.fine_value}</Badge>
                      ) : (
                        <Badge variant="secondary">No Fine</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{formatPlate(detection.vehicle.plate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
