import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

export type LatLng = {
  lat: number;
  lng: number;
};

type GoogleMapProps = {
  userLocation: LatLng;
  facilityLocation: LatLng;
};

// Must be declared outside the component so it's a stable reference across
// renders (react-google-maps/api requires the `libraries` array identity to
// stay constant, otherwise it reloads the script and warns in the console).
const GOOGLE_MAPS_LIBRARIES: (
  "places" | "geometry" | "drawing" | "visualization"
)[] = ["places"];

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "450px",
  borderRadius: "16px",
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  clickableIcons: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

export default function GoogleMapComponent({
  userLocation,
  facilityLocation,
}: GoogleMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Icons must be created only after the Maps JS SDK has finished loading,
  // since `google.maps.Size` / `google.maps.Point` don't exist beforehand.
  //   const userIcon = useMemo<google.maps.Symbol | undefined>(() => {
  //     if (!isLoaded) return undefined;
  //     return {
  //       path: google.maps.SymbolPath.CIRCLE,
  //       scale: 9,
  //       fillColor: "#2563EB", // blue-600
  //       fillOpacity: 1,
  //       strokeColor: "#FFFFFF",
  //       strokeWeight: 3,
  //     };
  //   }, [isLoaded]);

  const userIcon = useMemo(
    () => ({
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
           <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#2563EB"><path d="M575.33-391.83q42.67-25.17 68-66.84-34.33-27-75.81-40.83-41.47-13.83-87.66-13.83t-87.53 13.83q-41.33 13.83-75.66 40.83 25.33 41.67 68 66.84 42.66 25.16 95.33 25.16t95.33-25.16Zm-95.27-174.84q30.27 0 51.77-21.56 21.5-21.55 21.5-51.83 0-30.27-21.56-51.77-21.55-21.5-51.83-21.5-30.27 0-51.77 21.56-21.5 21.55-21.5 51.83 0 30.27 21.56 51.77 21.55 21.5 51.83 21.5ZM480-168q129.33-118 191.33-214.17 62-96.16 62-169.83 0-114.86-73.5-188.1-73.5-73.23-179.83-73.23-106.33 0-179.83 73.23-73.5 73.24-73.5 188.1 0 73.67 63 169.83Q352.67-286 480-168Zm0 88Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>
      `),
    }),
    [],
  );

  //   const facilityIcon = useMemo<google.maps.Icon | undefined>(() => {
  //     if (!isLoaded) return undefined;
  //     // Google's hosted hospital pin — clearly reads as a medical facility
  //     // and needs no custom asset hosting.
  //     return {
  //       url: "https://maps.gstatic.com/mapfiles/ms2/micons/hospitals.png",
  //       scaledSize: new google.maps.Size(36, 36),
  //     };
  //   }, [isLoaded]);

  const facilityIcon = useMemo(
    () => ({
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#DC2626"><path d="M440-400h80v-120h120v-80H520v-120h-80v120H320v80h120v120Zm40 214q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>
      `),
    }),
    [],
  );

  // Fetch the driving route whenever the endpoints change.
  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;
    setIsRouting(true);
    setDirectionsError(null);

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: facilityLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (cancelled) return;
        setIsRouting(false);
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          setDirections(null);
          setDirectionsError(
            "Could not calculate a driving route between these locations.",
          );
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    userLocation.lat,
    userLocation.lng,
    facilityLocation.lat,
    facilityLocation.lng,
  ]);

  // Auto-fit both markers (and the route, once available) whenever the map
  // instance or the endpoints change.
  const fitBoundsToMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(userLocation);
    bounds.extend(facilityLocation);
    map.fitBounds(bounds, 64); // 64px padding so markers aren't flush to the edge
  }, [isLoaded, userLocation, facilityLocation]);

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      fitBoundsToMarkers();
    },
    [fitBoundsToMarkers],
  );

  useEffect(() => {
    fitBoundsToMarkers();
  }, [fitBoundsToMarkers]);

  const leg = directions?.routes[0]?.legs[0];

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load Google Maps. Please check your API key and network
        connection.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={containerStyle}
        className="flex items-center justify-center bg-slate-100 text-sm text-slate-500"
      >
        Loading map…
      </div>
    );
  }

  return (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        options={mapOptions}
        onLoad={handleMapLoad}
      >
        <MarkerF
          position={userLocation}
          icon={userIcon}
          title="Your current location"
        />

        <MarkerF
          position={facilityLocation}
          icon={facilityIcon}
          title="Health centre"
        />

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true, // keep our custom markers only
              polylineOptions: {
                strokeColor: "#1A73E8", // Google Maps' standard route blue
                strokeWeight: 5,
                strokeOpacity: 0.9,
              },
            }}
          />
        )}
      </GoogleMap>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
        {isRouting && (
          <p className="text-sm text-slate-500">Calculating route…</p>
        )}

        {!isRouting && directionsError && (
          <p className="text-sm text-red-600">{directionsError}</p>
        )}

        {!isRouting && leg && (
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Distance
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {leg.distance?.text}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Estimated Time
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {leg.duration?.text}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
