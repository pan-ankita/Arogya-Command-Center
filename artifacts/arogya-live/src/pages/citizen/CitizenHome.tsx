import { PublicLayout } from "@/layouts/PublicLayout";
import { 
  useGetFacilities,
  getGetFacilitiesQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone, Building2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { Link } from "wouter";

export default function CitizenHome() {
  const [search, setSearch] = useState("");

  const { data: facilities, isLoading } = useGetFacilities({
    query: { queryKey: getGetFacilitiesQueryKey() }
  });

  const filteredFacilities = facilities?.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PublicLayout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900">
            Find Health Services Near You
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Check real-time bed availability, doctor presence, and medicine stock before you visit.
          </p>
          
          <div className="max-w-2xl mx-auto relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
            <Input 
              className="h-14 pl-12 pr-4 text-lg rounded-2xl shadow-md border-slate-200"
              placeholder="Search by area, PIN code, or facility name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h2 className="text-2xl font-bold mb-6">Nearby Facilities</h2>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredFacilities?.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No facilities found matching your search.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredFacilities?.map(facility => (
              <Link key={facility.id} href={`/citizen/facility/${facility.id}`}>
                <Card className="h-full hover:shadow-md transition-all cursor-pointer border-slate-200 group">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                            {facility.type}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {facility.name}
                        </h3>
                      </div>
                      <StatusBadge 
                        status={facility.healthStatus === 'critical' ? 'critical' : 'success'} 
                        text={facility.healthStatus === 'critical' ? 'High Load' : 'Normal Operations'} 
                      />
                    </div>
                    
                    <div className="space-y-2 mt-auto pt-4 text-sm text-slate-600 border-t border-slate-100">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                        <span>{facility.address}</span>
                      </div>
                      {facility.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                          <span>{facility.phone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
