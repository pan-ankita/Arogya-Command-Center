import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FacilityLayout } from "@/layouts/FacilityLayout";
import { 
  useGetStock, 
  useCreateStockTransaction,
  getGetStockQueryKey,
  StockTransactionInputType
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { SkeletonList } from "@/components/SkeletonCard";
import { PackagePlus, PackageMinus, Search } from "lucide-react";

export default function FacilityStock() {
  const { user } = useAuth();
  const facilityId = user?.facilityId as number;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);
  
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  const { data: stock, isLoading } = useGetStock(
    { facilityId },
    { query: { enabled: !!facilityId, queryKey: getGetStockQueryKey({ facilityId }) } }
  );

  const transactionMutation = useCreateStockTransaction();

  const handleTransaction = (type: StockTransactionInputType, e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicineId || !quantity) return;

    transactionMutation.mutate(
      { 
        data: {
          facilityId,
          medicineId: parseInt(selectedMedicineId),
          type,
          quantity: parseInt(quantity),
          note
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetStockQueryKey({ facilityId }) });
          toast({
            title: "Success",
            description: `Stock ${type === 'restock' ? 'added' : 'consumed'} successfully.`,
          });
          setIsAddModalOpen(false);
          setIsConsumeModalOpen(false);
          setQuantity("");
          setSelectedMedicineId("");
          setNote("");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update stock.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const filteredStock = stock?.filter(item => 
    item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <FacilityLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Medicine Stock</h2>
            <p className="text-muted-foreground">Manage inventory and log consumption.</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isConsumeModalOpen} onOpenChange={setIsConsumeModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="btn-open-consume-modal">
                  <PackageMinus className="mr-2 h-4 w-4" /> Log Consumption
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Consumption</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => handleTransaction('consumption', e)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicine">Medicine</Label>
                    <Select value={selectedMedicineId} onValueChange={setSelectedMedicineId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {stock?.map(item => (
                          <SelectItem key={item.medicineId} value={item.medicineId.toString()}>
                            {item.medicineName} ({item.currentQuantity} {item.unit} available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Consumed</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      min="1" 
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Input 
                      id="note" 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsConsumeModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={transactionMutation.isPending}>Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button data-testid="btn-open-add-modal">
                  <PackagePlus className="mr-2 h-4 w-4" /> Add Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Stock</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => handleTransaction('restock', e)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicine">Medicine</Label>
                    <Select value={selectedMedicineId} onValueChange={setSelectedMedicineId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {stock?.map(item => (
                          <SelectItem key={item.medicineId} value={item.medicineId.toString()}>
                            {item.medicineName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Received</Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      min="1" 
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Batch/Note (Optional)</Label>
                    <Input 
                      id="note" 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={transactionMutation.isPending}>Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader className="py-4 px-6 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search medicines..."
                className="pl-8 max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6"><SkeletonList /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Days Remaining</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No medicines found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStock?.map((item) => (
                      <TableRow key={item.id} data-testid={`row-medicine-${item.medicineId}`}>
                        <TableCell className="font-medium">{item.medicineName}</TableCell>
                        <TableCell className="text-muted-foreground">{item.category}</TableCell>
                        <TableCell className="text-right font-mono">
                          {item.currentQuantity} <span className="text-xs text-muted-foreground">{item.unit}</span>
                        </TableCell>
                        <TableCell>
                          {item.daysRemaining !== null && item.daysRemaining !== undefined 
                            ? `${Math.round(item.daysRemaining)} days` 
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge 
                            status={item.stockStatus === 'ok' ? 'success' : item.stockStatus === 'low' ? 'warning' : 'critical'} 
                            text={item.stockStatus === 'ok' ? 'Adequate' : item.stockStatus === 'low' ? 'Low Stock' : item.stockStatus === 'out' ? 'Out of Stock' : 'Critical'} 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </FacilityLayout>
  );
}
