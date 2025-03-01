
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, AlertCircle, Route } from 'lucide-react';
import { JobTableRow } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface MapProps {
  data: JobTableRow[];
  filteredData?: JobTableRow[];
  title?: string;
  description?: string;
}

const Map = ({ 
  data, 
  filteredData, 
  title = "Job Locations Map", 
  description = "Visual representation of job assignments and salesmen locations" 
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInputVisible, setTokenInputVisible] = useState(true);
  const [showDirections, setShowDirections] = useState(true);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const routeRef = useRef<mapboxgl.GeoJSONSource | null>(null);
  
  // Use filtered data if provided, otherwise use all data
  const displayData = filteredData || data;
  
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
  
  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;
    
    mapboxgl.accessToken = mapboxToken;
    
    // Calculate bounds to fit all locations
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add job locations to bounds
    displayData.forEach(job => {
      if (job.longitude && job.latitude) {
        bounds.extend([job.longitude, job.latitude]);
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
      
      // Add markers for each job
      displayData.forEach(job => {
        if (!job.longitude || !job.latitude) return;
        
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
    });
  };
  
  const addMarker = (job: JobTableRow) => {
    if (!map.current || !job.longitude || !job.latitude) return;
    
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
        <h3 style="margin: 0 0 8px; font-weight: 600;">Job #${job.job_id}</h3>
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
      .setLngLat([job.longitude, job.latitude])
      .setPopup(popup)
      .addTo(map.current);
    
    // Store marker reference for later updates
    markersRef.current[job.job_id] = marker;
  };
  
  const drawRoutes = () => {
    if (!map.current || !routeRef.current) return;
    
    // Group jobs by salesman_id
    const salesmanJobs: { [key: string]: JobTableRow[] } = {};
    
    sortedData.forEach(job => {
      if (!job.longitude || !job.latitude) return;
      
      const salesmanId = job.salesman_id || 'unassigned';
      
      if (!salesmanJobs[salesmanId]) {
        salesmanJobs[salesmanId] = [];
      }
      
      salesmanJobs[salesmanId].push(job);
    });
    
    // Create route lines for each salesman's jobs
    const salesmanRoutes: GeoJSON.Feature[] = [];
    
    Object.entries(salesmanJobs).forEach(([salesmanId, jobs]) => {
      if (salesmanId === 'unassigned' || jobs.length < 2) return;
      
      // Sort jobs by start_time
      const sortedJobs = [...jobs].sort((a, b) => {
        if (!a.start_time) return 1;
        if (!b.start_time) return -1;
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      });
      
      // Create coordinates array for the route
      const coordinates = sortedJobs.map(job => [job.longitude!, job.latitude!]);
      
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
    });
  };
  
  const handleTokenSubmit = () => {
    if (mapboxToken.trim() !== '') {
      setTokenInputVisible(false);
      localStorage.setItem('mapboxToken', mapboxToken);
      initializeMap();
    }
  };
  
  const toggleDirections = () => {
    setShowDirections(!showDirections);
  };
  
  useEffect(() => {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('mapboxToken');
    if (savedToken) {
      setMapboxToken(savedToken);
      setTokenInputVisible(false);
    }
  }, []);
  
  useEffect(() => {
    if (!tokenInputVisible && mapboxToken) {
      initializeMap();
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [tokenInputVisible, mapboxToken]);
  
  // Update markers and routes when data changes
  useEffect(() => {
    if (!map.current || !mapboxToken) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    
    // Calculate new bounds
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add job locations to bounds and create new markers
    displayData.forEach(job => {
      if (!job.longitude || !job.latitude) return;
      
      bounds.extend([job.longitude, job.latitude]);
      addMarker(job);
    });
    
    // Update routes if directions are enabled
    if (showDirections && routeRef.current) {
      drawRoutes();
    } else if (routeRef.current) {
      // Clear routes if directions are disabled
      routeRef.current.setData({
        type: 'FeatureCollection',
        features: []
      });
    }
    
    // Fit map to new bounds if we have locations
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 70,
        maxZoom: 13,
      });
    }
  }, [displayData, showDirections]);
  
  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md overflow-hidden">
          {tokenInputVisible ? (
            <div className="bg-muted/30 p-8 rounded-md border flex flex-col items-center justify-center gap-4 text-center">
              <AlertCircle className="w-10 h-10 text-amber-500" />
              <div>
                <h3 className="text-lg font-medium mb-2">Mapbox API Token Required</h3>
                <p className="text-muted-foreground mb-4">
                  Please provide your Mapbox public token to display the map. 
                  <br />You can get one for free at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
                </p>
              </div>
              <div className="flex w-full max-w-md gap-2">
                <Input
                  type="text"
                  placeholder="Enter your Mapbox public token"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleTokenSubmit}>
                  Apply
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap px-4 py-2 border-b gap-6 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Assigned Jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Unassigned Jobs</span>
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('mapboxToken');
                      setTokenInputVisible(true);
                    }}
                  >
                    Change Token
                  </Button>
                </div>
              </div>
              <div ref={mapContainer} className="w-full h-[500px]" />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Map;
