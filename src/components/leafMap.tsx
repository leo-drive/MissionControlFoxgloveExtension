import { PanelExtensionContext } from "@foxglove/studio";
import {
  checkpointAtom,
  followMarkerAtom,
  inputFieldsAtom,
  poseAtom,
  publishCheckpointButtonAtom,
  publishGoalPointButtonAtom,
  repeatCycleCheckpointsState,
} from "../jotai/atoms";
import { checkpointsbuttonAtom } from "../jotai/atoms";
import { goalpointbuttonAtom } from "../jotai/atoms";
import { vehicleLocationAtom } from "../jotai/atoms";
import { awapiVehicleStatusAtom } from "../jotai/atoms";
import { useAtom, useAtomValue } from "jotai";
import { DivIcon, divIcon, Map } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvent } from "react-leaflet";

function degToRad(deg: number) {
  return deg * (Math.PI / 180);
}

function getUTMZoneLetter(lat: number) {
  if (-80 <= lat && lat <= 84) {
    var letters = "CDEFGHJKLMNPQRSTUVWX";
    return letters.charAt(Math.floor((lat + 80) / 8));
  } else {
    // Outside the UTM limits
    return null;
  }
}

export function latLongToUTM(
  lat: number,
  long: number,
): { x: number; y: number; zone: number; zoneLetter: string } {
  var zone = Math.floor((long + 180) / 6) + 1;
  var a = 6378137; // radius of earth
  var f = 1 / 298.257223563; // flattening
  var e = Math.sqrt(2 * f - Math.pow(f, 2)); // eccentricity
  var eSq = Math.pow(e, 2);
  var latRad = degToRad(lat);
  var longRad = degToRad(long);
  var k0 = 0.9996; // scale factor
  var falseEasting = 500000; // in meters

  var N = a / Math.sqrt(1 - eSq * Math.sin(latRad) * Math.sin(latRad));
  var T = Math.pow(Math.tan(latRad), 2);
  var C = (eSq / (1 - eSq)) * Math.pow(Math.cos(latRad), 2);
  var A = Math.cos(latRad) * (longRad - degToRad((zone - 1) * 6 - 180 + 3));
  var M =
    a *
    ((1 - eSq / 4 - (3 * Math.pow(eSq, 2)) / 64 - (5 * Math.pow(eSq, 3)) / 256) * latRad -
      ((3 * eSq) / 8 + (3 * Math.pow(eSq, 2)) / 32 + (45 * Math.pow(eSq, 3)) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * Math.pow(eSq, 2)) / 256 + (45 * Math.pow(eSq, 3)) / 1024) * Math.sin(4 * latRad) -
      ((35 * Math.pow(eSq, 3)) / 3072) * Math.sin(6 * latRad));

  var x =
    k0 *
      N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + Math.pow(T, 2) + 72 * C - 58 * eSq) * Math.pow(A, 5)) / 120) +
    falseEasting;
  var y =
    k0 *
    (M +
      N *
        Math.tan(latRad) *
        (Math.pow(A, 2) / 2 +
          ((5 - T + 9 * C + 4 * Math.pow(C, 2)) * Math.pow(A, 4)) / 24 +
          ((61 - 58 * T + Math.pow(T, 2) + 600 * C - 330 * eSq) * Math.pow(A, 6)) / 720));

  var zoneLetter = getUTMZoneLetter(lat);

  return { x: x, y: y, zone: zone, zoneLetter: zoneLetter ?? "" };
}

function MapMain({ context }: { context: PanelExtensionContext }) {
  const vehiclePosition = useAtomValue(awapiVehicleStatusAtom).geo_point;
  const eulAng = useAtomValue(awapiVehicleStatusAtom).eulerangle.yaw;
  const [recVehicleLocation, _setRecVehicleLocation] = useAtom(vehicleLocationAtom);
  const [recInputFields, setRecInputFields] = useAtom(inputFieldsAtom);
  const [unchangedCheckpoints, setUnchangedCheckpoints] = useAtom(repeatCycleCheckpointsState);
  const [pose, setPose] = useAtom(poseAtom);

  const [markerAngle, setMarkerAngle] = useState("0deg");
  const mapRef = useRef<Map>(null);

  const [goalpointButton, setGoalpointButton] = useAtom(goalpointbuttonAtom);
  const [checkpointButton, setCheckpointButton] = useAtom(checkpointsbuttonAtom);
  const [_publishGoalpoint, setPublishGoalpoint] = useAtom(publishGoalPointButtonAtom);
  const [_publishCheckpoint, setPublishCheckpoint] = useAtom(publishCheckpointButtonAtom);
  const [_checkPoint, setCheckPoint] = useAtom(checkpointAtom);

  // This code will allow the map to pan to the vehicle's position
  // and follow the marker with the correct angle

  const [followMarker, setFollowMarker] = useAtom(followMarkerAtom);
  const MarkerLocationFollow = () => {
    useEffect(() => {
      if (followMarker && mapRef.current) {
        mapRef.current.panTo([recVehicleLocation.latitude, recVehicleLocation.longitude]);
        mapRef.current.dragging.disable();
      }
      setMarkerAngle(`${eulAng * -57.2957795 + 95}deg`);
    }, []);
    return null;
  };

  const MouseLocationInfo = () => {
    const map = useMap();
    if (goalpointButton || checkpointButton) {
      map.dragging.disable();

      // eslint-disable-next-line react-hooks/rules-of-hooks
      useMapEvent("contextmenu", (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const goal = [lat, lng, 48.35];
        if (goalpointButton) {
          // console.log("gp", goal);
          context.publish?.("/gps_coordinates", { data: JSON.stringify(goal) });
          setPose([lat, lng, 48.35]);
          setGoalpointButton(false);
          setCheckpointButton(false);
          if (pose[0] !== 0 && recInputFields.length > 0) {
            const newGoalPoints = [goal];
            newGoalPoints.splice(0, recInputFields.length);
            setRecInputFields(newGoalPoints);
          }
          setPublishGoalpoint(true);
          setTimeout(() => {
            setPublishGoalpoint(false);
          }, 250);
        }
        if (checkpointButton) {
          // console.log("cp", goal);

          setRecInputFields([goal, ...recInputFields]);
          setUnchangedCheckpoints([goal, ...unchangedCheckpoints]);
          setCheckPoint([lat, lng, 48.35]);
          setGoalpointButton(false);
          setCheckpointButton(false);
          setPublishCheckpoint(true);
          setTimeout(() => {
            setPublishCheckpoint(false);
          }, 250);
        }
      });
    } else {
      map.dragging.enable();
    }

    return null;
  };

  return (
    <div className="relative h-[calc(100vh_-_5rem)] w-full">
      <div
        onClick={() => {
          if (pose[0] !== 0) setFollowMarker(!followMarker);
        }}
        className={`absolute bottom-4 left-2 h-14 w-14 rounded-full ${
          followMarker ? "bg-[#e63946]" : "bg-[#00ADB5]"
        } z-[500] flex cursor-pointer items-center justify-center border-[5px] border-[#222831] p-1`}
      >
        <svg
          width="41"
          height="41"
          viewBox="0 0 41 41"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M40.2999 21.0699C39.9899 21.7499 39.4699 22.01 38.7299 21.96C38.0699 21.92 37.3999 21.96 36.7299 21.95C36.4799 21.95 36.3999 22.02 36.3699 22.27C35.6799 29.69 29.9699 35.74 22.6399 36.83C22.2399 36.89 21.8399 36.93 21.3899 36.98C21.3899 37.81 21.3899 38.61 21.3899 39.42C21.3899 39.61 21.3899 39.82 21.3299 40C21.1699 40.55 20.6299 40.9 20.0699 40.84C19.4799 40.78 19.0199 40.3101 18.9999 39.6801C18.9699 38.9401 18.9699 38.1899 18.9999 37.4399C19.0199 37.0499 18.8899 36.95 18.5099 36.91C14.6499 36.49 11.3399 34.9 8.6199 32.14C6.0499 29.53 4.55991 26.38 4.06991 22.75C4.03991 22.49 4.00992 22.24 3.97992 21.95C3.05992 21.95 2.16991 21.96 1.27991 21.95C0.809906 21.94 0.459907 21.7 0.249907 21.28C0.0399069 20.86 0.079913 20.4401 0.349913 20.0601C0.589913 19.7101 0.939892 19.5601 1.35989 19.5601C2.07989 19.5601 2.7999 19.5601 3.5199 19.5601C3.6599 19.5601 3.79992 19.5601 3.94992 19.5601C4.05992 18.8701 4.1499 18.2101 4.2699 17.5601C5.4699 11.2001 10.7099 6.00001 17.0799 4.82001C17.6099 4.72001 18.1399 4.65003 18.6699 4.59003C18.9199 4.56003 19.0099 4.47998 18.9999 4.22998C18.9899 3.55998 19.0199 2.88998 18.9899 2.22998C18.9499 1.48998 19.2199 0.969983 19.8999 0.669983C20.1099 0.669983 20.3199 0.669983 20.5299 0.669983C21.2299 0.989983 21.4599 1.54003 21.4099 2.28003C21.3699 3.02003 21.3999 3.75999 21.3999 4.48999C21.4699 4.51999 21.5099 4.54999 21.5399 4.54999C21.5999 4.55999 21.6699 4.57002 21.7299 4.58002C24.3999 4.83002 26.8599 5.65997 29.0799 7.15997C33.3799 10.05 35.8099 14.09 36.3699 19.25C36.3999 19.51 36.4899 19.5799 36.7299 19.5699C37.3999 19.5599 38.0699 19.6001 38.7299 19.5601C39.4699 19.5101 39.9999 19.77 40.2999 20.45C40.2999 20.66 40.2999 20.8599 40.2999 21.0699ZM20.1899 6.89001C12.5599 6.89001 6.33991 13.09 6.31991 20.73C6.29991 28.36 12.5399 34.62 20.1899 34.62C27.8399 34.62 34.0799 28.37 34.0599 20.73C34.0299 13.08 27.8399 6.90001 20.1899 6.89001Z"
            fill="#222831"
          />
          <path
            d="M12.1499 20.76C12.1499 25.2 15.7499 28.7901 20.1899 28.7901C24.6399 28.7901 28.2199 25.2 28.2099 20.75C28.2099 16.3 24.6199 12.72 20.1699 12.73C15.7399 12.73 12.1499 16.33 12.1499 20.76Z"
            fill="#222831"
          />
          <path
            d="M12.1499 20.76C12.1499 16.32 15.7399 12.73 20.1799 12.72C24.6299 12.72 28.2099 16.3 28.2199 20.74C28.2199 25.19 24.6399 28.78 20.1999 28.78C15.7499 28.79 12.1599 25.2 12.1499 20.76Z"
            fill="#222831"
          />
        </svg>
      </div>
      <MapContainer
        ref={mapRef}
        center={[41.0196, 28.8894]}
        zoom={16}
        style={{
          userSelect: "none",
          height: "100%",
          backgroundColor: "white",
        }}
        attributionControl={false}
        zoomControl={false}
      >
        {/* {osm ? (
        ) : ( */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          minZoom={16}
        />
        {/* <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" minZoom={16} /> */}
        {/* )} */}

        <Marker
          position={[vehiclePosition.latitude, vehiclePosition.longitude]}
          // position={[41.0287, 28.9769]}
          icon={divIcon({
            className: "bg-transparent",
            html: `
                    <svg
                    style="transform: rotate(${markerAngle});" 
                    id="Layer_2" 
                    data-name="Layer 2" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 56.57 56.57"
                    >
                        <defs>
                        <style>
                        .cls-1 {
                            fill: #2bd1e5;
                        }
                    
                        .cls-2 {
                            fill: #ffffff;
                            opacity: 0.4;
                        }
                        </style>
                    </defs>
                    <g id="Layer_1-2" data-name="Layer 1">
                        <circle class="cls-2" cx="28.28" cy="28.28" r="28.28"/>
                        <path d="M28.28,11.01l-12,34.55,11.92-5.81,12.08,5.81L28.28,11.01Z" class="cls-1"/>
                    </g>
                    </svg>`,
            iconSize: [32, 32],
          })}
        >
          <Popup className="request-popup">
            <div className="m-0 h-full w-64 rounded-md bg-emerald-800 p-3 text-center text-white">
              This is where you are !
            </div>
          </Popup>
        </Marker>
        <MarkerLocationFollow />
        <MouseLocationInfo />
        {pose[0] !== 0 ? (
          <Marker
            position={[pose[0]!, pose[1]!]}
            icon={
              new DivIcon({
                className: "bg-transparent",
                html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path fill="#e63946" d="M12 2C8.13 2 5 5.13 5 9c0 4.17 4.42 9.92 6.24 12.11.4.48 1.13.48 1.53 0C14.58 18.92 19 13.17 19 9c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" className="color000000 svgShape" style="stroke: rgb(0,0,0); stroke-width:1.5px;"/></svg>`,
                iconSize: [48, 48],
                iconAnchor: [24, 48],
              })
            }
          />
        ) : null}
        {recVehicleLocation.latitude !== 9999 && (
          <Marker
            position={[
              // 40.808, 29.3588,
              recVehicleLocation.latitude,
              recVehicleLocation.longitude,
            ]}
            icon={
              new DivIcon({
                className: "bg-transparent",
                // html: `<svg style="transform: rotate(${markerAngle}); " width="24" height="24" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                // <path d="M256 0.959991L0 511.04L256 354.096L512 511.04L256 0.959991Z" fill="#ffffff"/>
                // </svg>`,
                html: `
                <svg style="transform: rotate(${markerAngle}); " id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.57 56.57">
  <g id="Layer_1-2" data-name="Layer 1">
    <circle
        fill=#fff
        opacity=.5
        cx="28.28" cy="28.28" r="28.28"/>
    <path fill=#e63946 d="M28.28,11.01l-12,34.55,11.92-5.81,12.08,5.81L28.28,11.01Z" style="stroke: rgb(0,0,0); stroke-width:1.5px;"/>
  </g>
</svg>`,
                iconSize: [36, 36],
              })
            }
          />
        )}
        {recInputFields.map((inputField, index) => {
          return (
            <Marker
              key={index}
              position={[inputField[0] ?? 0, inputField[1] ?? 0]}
              icon={
                new DivIcon({
                  className: "bg-transparent border-1 border-white ",
                  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path fill="#00adb5" d="M12 2C8.13 2 5 5.13 5 9c0 4.17 4.42 9.92 6.24 12.11.4.48 1.13.48 1.53 0C14.58 18.92 19 13.17 19 9c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" className="color000000 svgShape" style="stroke: rgb(0,0,0); stroke-width:1.5px;"/></svg>`,
                  iconSize: [48, 48],
                  iconAnchor: [24, 48],
                })
              }
            />
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapMain;
