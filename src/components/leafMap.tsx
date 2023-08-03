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
    <div className="relative h-[calc(100vh_-_4rem)] w-full">
      <div className="absolute bottom-4 left-[45%] z-[9999] h-[3.75rem] w-[9rem] rounded-2xl bg-gradient-to-b from-gray-600 to-black opacity-100 blur-xl"></div>
      <div className="absolute bottom-4 left-[45%] z-[9999] flex h-[3.75rem] w-[9rem] items-center justify-center rounded-xl bg-[#222831]">
        {/* leo */}
        <svg
          width="51"
          height="34"
          viewBox="0 0 51 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.449951 0.75C0.449951 0.6 0.56998 0.469971 0.72998 0.469971H2.44995C2.59995 0.469971 2.72998 0.59 2.72998 0.75V20.04C2.72998 20.19 2.60995 20.3199 2.44995 20.3199H0.72998C0.57998 20.3199 0.449951 20.2 0.449951 20.04V0.75ZM6.13 20.04C6.13 20.19 6.25003 20.3199 6.41003 20.3199H11.75C11.9 20.3199 12.03 20.2 12.03 20.04V18.35C12.03 18.2 11.91 18.0699 11.75 18.0699H6.42004C6.27004 18.0699 6.14001 18.19 6.14001 18.35L6.13 20.04Z"
            fill="white"
          />
          <path
            d="M50.99 10.39C50.98 15.27 47.52 19.4699 42.7 20.4399C42.62 20.4599 42.53 20.44 42.46 20.38C42.39 20.33 42.36 20.25 42.36 20.16V18.4399C42.36 18.3099 42.45 18.19 42.58 18.16C46.18 17.28 48.72 14.07 48.72 10.38C48.72 6.69 46.19 3.47997 42.58 2.59997C42.45 2.56997 42.36 2.46001 42.36 2.32001V0.590025C42.36 0.510025 42.4 0.419993 42.46 0.369993C42.53 0.319993 42.61 0.299995 42.7 0.309995C44.97 0.759995 47.02 1.95996 48.52 3.70996C50.12 5.58996 51 7.95001 50.99 10.39ZM30.3199 10.39C30.3299 15.27 33.8 19.4699 38.62 20.4399C38.7 20.4599 38.79 20.44 38.85 20.38C38.91 20.32 38.95 20.25 38.95 20.16V18.4399C38.95 18.3099 38.86 18.19 38.73 18.16C35.13 17.28 32.59 14.07 32.59 10.38C32.59 6.69 35.12 3.47997 38.73 2.59997C38.86 2.56997 38.95 2.46001 38.95 2.32001V0.590025C38.95 0.510025 38.91 0.429993 38.85 0.369993C38.78 0.319993 38.7 0.299995 38.62 0.309995C33.8 1.31 30.3299 5.51001 30.3199 10.39Z"
            fill="white"
          />
          <path
            d="M15.4301 20.04C15.4301 20.19 15.55 20.3199 15.71 20.3199H27.01C27.16 20.3199 27.29 20.2 27.29 20.04V18.34C27.29 18.19 27.17 18.0601 27.01 18.0601H17.98C17.83 18.0601 17.7 17.94 17.7 17.78V2.97998C17.7 2.82998 17.82 2.70001 17.98 2.70001H27.01C27.16 2.70001 27.29 2.57998 27.29 2.41998V0.719971C27.29 0.569971 27.17 0.440002 27.01 0.440002H15.71C15.56 0.440002 15.4301 0.559971 15.4301 0.719971V20.04Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21.37 8.38997L27.22 12.1099C27.25 12.1499 27.27 12.2 27.27 12.25C27.27 12.3 27.25 12.36 27.22 12.39C27.19 12.43 27.15 12.4499 27.11 12.4499H21.26C21.17 12.4499 21.1 12.36 21.1 12.25V8.52998C21.1 8.44998 21.14 8.37992 21.2 8.33992C21.26 8.31992 21.33 8.32997 21.37 8.38997Z"
            fill="#2BD1E4"
          />
          <path
            d="M46.74 33.6899C46.74 33.7399 46.78 33.78 46.83 33.78H50.63C50.68 33.78 50.72 33.7399 50.72 33.6899V33.12C50.72 33.07 50.68 33.03 50.63 33.03H47.59C47.54 33.03 47.5 32.9899 47.5 32.9399V27.96C47.5 27.91 47.54 27.87 47.59 27.87H50.63C50.68 27.87 50.72 27.83 50.72 27.78V27.21C50.72 27.16 50.68 27.12 50.63 27.12H46.83C46.78 27.12 46.74 27.16 46.74 27.21V33.6899Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M48.74 29.77L50.71 31.02C50.72 31.03 50.73 31.0499 50.73 31.0699C50.73 31.0899 50.72 31.11 50.71 31.12C50.7 31.13 50.69 31.14 50.67 31.14H48.7C48.67 31.14 48.65 31.1099 48.65 31.0699V29.8199C48.65 29.7899 48.6601 29.77 48.6801 29.76C48.7001 29.75 48.72 29.75 48.74 29.77Z"
            fill="#2BD1E4"
          />
          <path
            d="M2.80005 27.11H0.560059C0.510059 27.11 0.459961 27.15 0.459961 27.2V31.79C0.459961 31.84 0.500059 31.88 0.560059 31.88H1.14001C1.17001 31.88 1.18996 31.87 1.20996 31.85C1.22996 31.83 1.23999 31.81 1.23999 31.78V27.95C1.23999 27.9 1.27997 27.86 1.33997 27.86H2.80005C4.26005 27.86 5.44995 29.0099 5.44995 30.4399C5.44995 31.8699 4.26005 33.02 2.80005 33.02H0.560059C0.510059 33.02 0.459961 33.06 0.459961 33.11V33.6801C0.459961 33.7301 0.500059 33.77 0.560059 33.77H2.80005C4.69005 33.77 6.22998 32.2801 6.22998 30.4301C6.22998 28.6001 4.69005 27.11 2.80005 27.11Z"
            fill="white"
          />
          <path
            d="M25.33 33.6899C25.33 33.7399 25.3799 33.78 25.4399 33.78H26.12C26.15 33.78 26.18 33.77 26.2 33.75C26.22 33.73 26.23 33.7101 26.23 33.6801V27.2C26.23 27.17 26.22 27.15 26.2 27.13C26.18 27.11 26.15 27.1 26.12 27.1H25.4399C25.3799 27.1 25.33 27.1399 25.33 27.1899V33.6899Z"
            fill="white"
          />
          <path
            d="M18.17 29.16C18.17 28.62 17.9501 28.1 17.5601 27.71C17.1701 27.33 16.63 27.11 16.08 27.11H13.46C13.43 27.11 13.41 27.12 13.39 27.14C13.37 27.16 13.36 27.18 13.36 27.21V33.6899C13.36 33.7199 13.37 33.74 13.39 33.76C13.41 33.78 13.43 33.79 13.46 33.79H14.04C14.09 33.79 14.14 33.75 14.14 33.7V27.97C14.14 27.94 14.15 27.92 14.17 27.9C14.19 27.88 14.21 27.87 14.24 27.87H16.08C16.81 27.87 17.4 28.45 17.4 29.16C17.4 29.87 16.81 30.45 16.08 30.45H15.4C15.37 30.45 15.35 30.46 15.33 30.48C15.31 30.5 15.3 30.52 15.3 30.55V31.12C15.3 31.15 15.31 31.1699 15.33 31.1899C15.35 31.2099 15.37 31.22 15.4 31.22H15.9399C15.9799 31.22 16.01 31.24 16.03 31.27L16.7 32.51L17.37 33.75C17.39 33.78 17.42 33.8 17.46 33.8H18.12C18.15 33.8 18.19 33.78 18.2 33.75C18.21 33.72 18.22 33.69 18.2 33.66L17.54 32.45L16.85 31.1899C16.84 31.1699 16.84 31.14 16.85 31.11C16.86 31.09 16.88 31.0701 16.9 31.0601C17.25 30.9101 17.56 30.67 17.79 30.36C18.04 29.99 18.17 29.58 18.17 29.16Z"
            fill="white"
          />
          <path
            d="M33.99 27.11C34.03 27.11 34.0599 27.13 34.0699 27.16L34.9499 29.02L35.8399 30.89C35.8499 30.92 35.8499 30.95 35.8399 30.97L35.65 31.37L35.53 31.63C35.51 31.66 35.4799 31.6801 35.4499 31.6801C35.4099 31.6801 35.38 31.66 35.37 31.63L34.3399 29.46L33.3 27.25C33.29 27.22 33.29 27.19 33.31 27.16C33.33 27.13 33.36 27.12 33.39 27.12H34.02L33.99 27.11ZM36.05 33.02C36.04 33.05 36.04 33.08 36.05 33.1L36.1899 33.39L36.3399 33.71C36.3499 33.73 36.37 33.75 36.39 33.76C36.43 33.78 36.48 33.78 36.52 33.76C36.54 33.75 36.5499 33.73 36.5699 33.71L38.14 30.41L39.65 27.24C39.66 27.21 39.66 27.18 39.65 27.15C39.63 27.12 39.5999 27.11 39.5699 27.11H38.9399C38.8999 27.11 38.87 27.13 38.86 27.16L37.4699 30.08L36.05 33.02Z"
            fill="white"
          />
        </svg>
      </div>
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
        center={[41.0287, 28.9769]}
        zoom={14}
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
