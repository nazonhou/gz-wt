import { useEffect, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { useDelivery, usePackage } from '../../contexts/DeliveryContext';
import { serverSocket } from '../../server-socket';
import { Delivery } from '../../types/delivery';

enum SocketEvent {
  LocationChanged = 'location_changed',
  StatusChanged = 'status_changed',
  DeliveryUpdated = 'delivery_updated',
}

const GoogleMap = () => {
  const packageContext = usePackage();
  const deliveryContext = useDelivery();

  // connect to socket
  useEffect(() => {
    // no-op if the socket is already connected
    serverSocket.connect();
    return () => {
      serverSocket.disconnect();
    };
  }, []);

  // register listeners
  useEffect(() => {
    if (deliveryContext.delivery?._id) {
      function onDeliveryUpdatedEvent(value: Delivery) {
        console.log(
          `Received ${SocketEvent.DeliveryUpdated} event with payload`,
          value,
        );

        if (value._id === deliveryContext.delivery?._id) {
          deliveryContext.updateDelivery(value);
        }
      }

      serverSocket.on(SocketEvent.DeliveryUpdated, onDeliveryUpdatedEvent);

      return () => {
        serverSocket.off(SocketEvent.DeliveryUpdated, onDeliveryUpdatedEvent);
      };
    }
  }, [deliveryContext]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-12">
      <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">
        MAP
      </h4>

      {packageContext.pack?.from_location?.lat &&
        packageContext.pack?.from_location?.lng && (
          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <div className="h-90">
              <Map
                defaultZoom={12}
                defaultCenter={{
                  lat: packageContext.pack?.from_location?.lat,
                  lng: packageContext.pack?.from_location?.lng,
                }}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
              >
                {/* Current Delivery Location Marker */}
                {deliveryContext.delivery?.location?.lat &&
                  deliveryContext.delivery?.location?.lng && (
                    <AdvancedMarker
                      position={{
                        lat: deliveryContext.delivery?.location?.lat,
                        lng: deliveryContext.delivery?.location?.lng,
                      }}
                    >
                      <Pin
                        background="#ffa70b"
                        glyphColor="#ffffff"
                        borderColor="#ffa70b"
                        glyph="C"
                      />
                    </AdvancedMarker>
                  )}

                {/* From Location Marker */}
                <AdvancedMarker
                  position={{
                    lat: packageContext.pack?.from_location?.lat,
                    lng: packageContext.pack?.from_location?.lng,
                  }}
                >
                  <Pin
                    background="#3c50e0"
                    glyphColor="#ffffff"
                    borderColor="#3c50e0"
                    glyph="S"
                  />
                </AdvancedMarker>

                {/* To Location Marker */}
                {packageContext.pack?.to_location?.lat &&
                  packageContext.pack?.to_location?.lng && (
                    <AdvancedMarker
                      position={{
                        lat: packageContext.pack?.to_location?.lat,
                        lng: packageContext.pack?.to_location?.lng,
                      }}
                    >
                      <Pin
                        background="#219653"
                        glyphColor="#ffffff"
                        borderColor="#219653"
                        glyph="D"
                      />
                    </AdvancedMarker>
                  )}
              </Map>
            </div>
          </APIProvider>
        )}
    </div>
  );
};

export default GoogleMap;
