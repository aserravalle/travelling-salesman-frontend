import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Route } from 'lucide-react';
import { RosterTableRow } from '@/types/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Define the GeoJSON namespace for TypeScript
declare namespace GeoJSON {
  type Feature = {
    type: 'Feature';
    properties: any;
    geometry: {
      type: string;
      coordinates: number[][];
    };
  };
  
  type FeatureCollection = {
    type: 'FeatureCollection';
    features: Feature[];
  };
}

interface MapProps {
  data: RosterTableRow[];
  filteredData?: RosterTableRow[];
  title?: string;
  description?: string;
}

const Map = ({ 
  data, 
  filteredData, 
  title = "Trip Visualization", 
  description = "Visual representation of delivery routes and salesmen locations" 
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const routeRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  const [showDirections, setShowDirections] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Get Mapbox token from environment variable or use fallback to input method
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  
  // Use filtered data if provided, otherwise use all data
  const displayData = filteredData || data;
  
  // Determine if we are filtering by a specific salesman
  const getFilteredSalesmanId = (): string | null => {
    if (!filteredData || filteredData.length === 0) return null;
    
    // Check if all filtered jobs have the same salesman_id
    const firstSalesmanId = filteredData[0].salesman_id;
    const allSameSalesman = filteredData.every(job => job.salesman_id === firstSalesmanId);
    
    // If filtering by a specific salesman or unassigned jobs
    if (allSameSalesman) {
      return firstSalesmanId;
    }
    
    return null; // Mixed salesmen or all data
  };
  
  const filteredSalesmanId = getFilteredSalesmanId();
  
  // Sort data by salesman_id and start_time to determine the route order
  const sortedData = [...displayData].sort((a, b) => {
    // First sort by salesman_id
    if (a.salesman_id !== b.salesman_id) {
      if (!a.salesman_id) return 1;
      if (!b.salesman_id) return -1;
      return a.salesman_id.localeCompare(b.salesman_id);
    }
    
    // Then sort by start_time
    if (!a.start_time) return 1;
    if (!b.start_time) return -1;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  // Clean up the current map and all its resources
  const cleanupMap = () => {
    if (map.current) {
      // Remove all markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      
      // Remove the map
      map.current.remove();
      map.current = null;
      routeRef.current = null;
    }
  };
  
  const initializeMap = () => {
    // Clean up existing map if it exists
    cleanupMap();
    
    if (!mapContainer.current) return;
    
    mapboxgl.accessToken = mapboxToken;
    
    // Calculate bounds to fit all locations
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add job locations to bounds - only for visible/filtered data
    displayData.forEach(job => {
      if (job.location.latitude && job.location.longitude) {
        bounds.extend([job.location.longitude, job.location.latitude]);
      }
    });
    
    // If we have no valid bounds, set default center
    const hasValidBounds = !bounds.isEmpty();
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: hasValidBounds ? bounds.getCenter() : [-74.006, 40.7128], // Default to NYC
      zoom: hasValidBounds ? 9 : 12,
    });
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add a source for the route lines
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });
      
      // Add a layer for the route lines
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 3,
          'line-opacity': 0.75,
          'line-dasharray': [0.5, 2]
        }
      });
      
      routeRef.current = map.current.getSource('route') as mapboxgl.GeoJSONSource;
      
      // Add markers for each job - only for visible/filtered data
      displayData.forEach(job => {
        if (!job.location.latitude || !job.location.longitude) return;
        
        addMarker(job);
      });
      
      // Draw routes if directions are enabled
      if (showDirections) {
        drawRoutes();
      }
      
      // Fit map to bounds if we have locations
      if (hasValidBounds) {
        map.current.fitBounds(bounds, {
          padding: 70,
          maxZoom: 13,
        });
      }
      
      setMapInitialized(true);
    });
  };
  
  const addMarker = (job: RosterTableRow) => {
    if (!map.current || !job.location.latitude || !job.location.longitude) return;
    
    const isAssigned = job.assignment_status === 'Assigned';
    
    // Create marker element
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundSize = '100%';
    el.style.borderRadius = '50%';
    el.style.cursor = 'pointer';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.backgroundColor = isAssigned ? '#3b82f6' : '#ef4444'; // Blue for assigned, red for unassigned
    el.style.color = 'white';
    el.style.fontSize = '14px';
    el.style.fontWeight = 'bold';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    
    // Create popup for job details
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
      <div style="font-family: system-ui, sans-serif; padding: 4px;">
        <h3 style="margin: 0 0 8px; font-weight: 600;">Delivery #${job.job_id}</h3>
        <p style="margin: 0 0 4px;"><strong>Duration:</strong> ${job.duration_mins} mins</p>
        <p style="margin: 0 0 4px;"><strong>Entry:</strong> ${new Date(job.entry_time).toLocaleTimeString()}</p>
        <p style="margin: 0 0 4px;"><strong>Exit:</strong> ${new Date(job.exit_time).toLocaleTimeString()}</p>
        <p style="margin: 0; ${isAssigned ? 'color: #3b82f6;' : 'color: #ef4444;'} font-weight: 600;">
          ${isAssigned ? `Assigned to: Salesman ${job.salesman_id}` : 'Unassigned'}
        </p>
        ${isAssigned && job.start_time ? `<p style="margin: 4px 0 0;"><strong>Start Time:</strong> ${new Date(job.start_time).toLocaleTimeString()}</p>` : ''}
      </div>
    `);
    
    // Add job number inside marker
    const icon = document.createElement('div');
    icon.innerHTML = job.job_id;
    el.appendChild(icon);
    
    // Add marker to map
    const marker = new mapboxgl.Marker(el)
      .setLngLat([job.location.longitude, job.location.latitude])
      .setPopup(popup)
      .addTo(map.current);
    
    // Store marker reference for later updates
    markersRef.current[job.job_id] = marker;
  };
  
  const drawRoutes = () => {
    if (!map.current || !routeRef.current) return;
    
    // Group jobs by salesman_id
    const salesmanJobs: { [key: string]: RosterTableRow[] } = {};
    
    // If filtered by a specific salesman, only add routes for that salesman
    if (filteredSalesmanId) {
      salesmanJobs[filteredSalesmanId] = sortedData.filter(
        job => job.salesman_id === filteredSalesmanId
      );
    } else {
      // Only show routes when filtering by a specific salesman
      // For "all salesmen" view, don't show any routes
      routeRef.current.setData({
        type: 'FeatureCollection',
        features: []
      } as any);
      return;
    }
    
    // Create route lines for each salesman's jobs
    const salesmanRoutes: GeoJSON.Feature[] = [];
    
    Object.entries(salesmanJobs).forEach(([salesmanId, jobs]) => {
      if (salesmanId === 'null' || salesmanId === 'undefined' || jobs.length < 2) return;
      
      // Sort jobs by start_time
      const sortedJobs = [...jobs].sort((a, b) => {
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      });
      
      // Create coordinates array for the route
      const coordinates = sortedJobs.map(job => [job.location.longitude!, job.location.latitude!]);
      
      // Add route feature
      salesmanRoutes.push({
        type: 'Feature',
        properties: {
          salesmanId
        },
        geometry: {
          type: 'LineString',
          coordinates
        }
      });
    });
    
    // Update the route source with all routes
    routeRef.current.setData({
      type: 'FeatureCollection',
      features: salesmanRoutes
    } as any);
  };
  
  const toggleDirections = () => {
    setShowDirections(!showDirections);
  };
  
  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
    
    return () => {
      cleanupMap();
    };
  }, []);
  
  // Completely reinitialize the map when filtered data changes
  useEffect(() => {
    // Only reinitialize if the map has been previously initialized
    // This prevents double initialization on first render
    if (mapInitialized) {
      initializeMap();
    }
  }, [filteredData, showDirections]);
  
  return (
    <Card className="w-full mb-8 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-sky-100 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/20">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-sky-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md overflow-hidden">
          <div className="flex flex-wrap px-4 py-2 border-b gap-6 items-center bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/20">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Assigned Deliveries</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Unassigned Deliveries</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="showDirections" 
                  checked={showDirections} 
                  onCheckedChange={() => toggleDirections()}
                />
                <Label htmlFor="showDirections" className="flex items-center gap-1">
                  <Route className="h-4 w-4" />
                  <span>Show Routes</span>
                </Label>
              </div>
            </div>
          </div>
          <div ref={mapContainer} className="w-full h-[500px]" />
        </div>
      </CardContent>
    </Card>
  );
};

export default Map;
