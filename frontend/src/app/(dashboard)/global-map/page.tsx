'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { riskColor } from '@/lib/utils';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export default function GlobalMapPage() {
  const { data } = useQuery({
    queryKey: ['heatmap'],
    queryFn: async () => (await api.get('/api/risk/heatmap')).data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Global Risk Map</h1>
        <p className="mt-1 text-sm text-muted">Supplier and port locations, colored by disruption risk.</p>
      </div>

      <Card>
        <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: '100%', height: 460 }}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo} fill="#1B2540" stroke="#26314D" />
              ))
            }
          </Geographies>
          {data?.map((c: any) => (
            <Marker key={c.country} coordinates={[c.lng, c.lat]}>
              <circle r={5} fill={riskColor(c.riskTier)} stroke="#0B1220" strokeWidth={1.5} />
            </Marker>
          ))}
        </ComposableMap>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((tier) => (
          <div key={tier} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ background: riskColor(tier) }} />
            {tier}
          </div>
        ))}
      </div>
    </div>
  );
}
