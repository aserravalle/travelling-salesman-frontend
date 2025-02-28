import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FlattenedJob } from '../types';

// Use a public token or disable the map if no token is available
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

interface MapProps {
  jobs: FlattenedJob[];
}

const Map: React.FC<MapProps> = ({ jobs }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<boolean>(false);

  useEffect(() => {
    if (!jobs.length) return;

    // Initialize map only once
    if (map.current) return;
    
    if (mapContainer.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [-74.0060, 40.7128], // Default to NYC
          zoom: 11
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Handle map load errors
        map.current.on('error', () => {
          setMapError(true);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !jobs.length || mapError) return;

    // Wait for map to load
    map.current.on('load', () => {
      try {
        // Add markers for each job
        const bounds = new mapboxgl.LngLatBounds();

        jobs.forEach(job => {
          if (!job.latitude || !job.longitude) return;
          
          const lng = parseFloat(job.longitude);
          const lat = parseFloat(job.latitude);
          
          if (isNaN(lng) || isNaN(lat)) return;
          
          const color = job.assignment_status === 'assigned' ? '#10B981' : '#EF4444';
          
          // Create marker element
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundColor = color;
          el.style.width = '15px';
          el.style.height = '15px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2)';
          
          // Add popup
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div>
              <h3 class="font-bold">Job ID: ${job.job_id}</h3>
              <p>Status: ${job.assignment_status}</p>
              ${job.salesman_id ? `<p>Salesman: ${job.salesman_id}</p>` : ''}
              <p>Duration: ${job.duration_mins} mins</p>
            </div>
          `);
          
          // Add marker to map
          new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map.current!);
          
          // Extend bounds
          bounds.extend([lng, lat]);
        });
        
        // Fit map to bounds if we have valid coordinates
        if (!bounds.isEmpty()) {
          map.current!.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        }
      } catch (error) {
        console.error('Error adding markers to map:', error);
        setMapError(true);
      }
    });
  }, [jobs, mapError]);

  if (mapError) {
    return (
      <div className="rounded-lg overflow-hidden shadow-lg bg-gray-100 p-6 text-center">
        <div className="h-96 w-full flex items-center justify-center flex-col">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map could not be loaded</h3>
          <p className="text-gray-600">
            The map service is currently unavailable. You can still view and download the job assignments data below.
          </p>
        </div>
        <div className="bg-white p-3 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Assigned Jobs</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Unassigned Jobs</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="h-96 w-full" />
      <div className="bg-white p-3 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Assigned Jobs</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span>Unassigned Jobs</span>
        </div>
      </div>
    </div>
  );
};

export default Map;