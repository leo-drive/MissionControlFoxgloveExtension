import MapMain from "./leafMap";
import { useEffect, useState, useCallback } from "react";
import {
  inputFieldsAtom,
  localeAtom,
  vehicleHazardStatusAtom,
  autowareProcessDiagAtom,
  VehicleStateState,
  publishCheckpointButtonLeftAtom,
  repeatCycleCheckpointsState,
  destinationAtom,
} from "../jotai/atoms";
import Lang from "../languages/a.json";
import { useAtom } from "jotai";
import { toast } from "react-hot-toast";
import { PanelExtensionContext } from "@foxglove/studio";
import { ImMap2 } from "react-icons/im";
import { RiStarSFill } from "react-icons/ri";
import { GiPathDistance } from "react-icons/gi";
import OldMissionControl from "./old-missioncont";

const MissionControl = ({ context }: { context: PanelExtensionContext }) => {
  const [recInputFields, _setRecInputFields] = useAtom(inputFieldsAtom);
  const [_hazardStatus, _setHazardStatus] = useAtom(vehicleHazardStatusAtom);

  const [vehicleState, _setVehicleState] = useAtom(VehicleStateState);
  const [locale, _setLocale] = useAtom(localeAtom);
  const [autowareProcess, _setAutowareProcess] = useAtom(autowareProcessDiagAtom);

  const [publishCheckpoint, setPublishCheckpoint] = useAtom(publishCheckpointButtonLeftAtom);
  const [hasArrived, setHasArrived] = useState(false);
  const [_conditionToCycle, setConditionToCycle] = useState(false);

  const [returnedValue, setReturnedValue] = useState(0);
  const [bufferValue, setBufferValue] = useState(0);
  const [isWaitingForCheckpoint, setIsWaitingForCheckpoint] = useState(false);

  const [unchangedCheckpoints, setUnchangedCheckpoints] = useAtom(repeatCycleCheckpointsState);

  const notifyWarningAutowareStatus = useCallback(
    () =>
      toast(Lang.missionCont.notifyWarningAutowareStatus[locale], {
        duration: 4000,
        iconTheme: {
          primary: "#f7df1e",
          secondary: "#f7df1e",
        },
        id: "warningAutowareStatus",
      }),
    [locale],
  );
  const notifySuccessAutowareStatus = useCallback(
    () =>
      toast(Lang.missionCont.notifySuccessAutowareStatus[locale], {
        duration: 4000,
        iconTheme: {
          primary: "#f7df1e",
          secondary: "#f7df1e",
        },
        id: "successAutowareStatus",
      }),
    [locale],
  );

  useEffect(() => {
    if (autowareProcess === 1) {
      notifySuccessAutowareStatus();
    } else if (autowareProcess === 0) {
      notifyWarningAutowareStatus();
    }
  }, [autowareProcess, notifySuccessAutowareStatus, notifyWarningAutowareStatus]);

  // const vehicleStateInfo = useCallback(() => {
  //   {
  //     return vehicleState === 1
  //       ? Lang.missionCont.buttons.Initializing[locale]
  //       : vehicleState === 2
  //       ? Lang.missionCont.buttons.WaitingForGoal[locale]
  //       : vehicleState === 3
  //       ? Lang.missionCont.buttons.Planning[locale]
  //       : vehicleState === 4
  //       ? Lang.missionCont.buttons.ReadyForEngage[locale]
  //       : vehicleState === 5
  //       ? Lang.missionCont.buttons.Driving[locale]
  //       : vehicleState === 6
  //       ? Lang.missionCont.buttons.ArrivedGoal[locale]
  //       : Lang.missionCont.buttons.Unknown[locale];
  //   }
  // }, [vehicleState, locale]);

  useEffect(() => {
    if (returnedValue === 0 && vehicleState === 6 && !hasArrived) {
      setConditionToCycle(false);
      setReturnedValue(1);
    }
    if (returnedValue === 1 && vehicleState === 2) {
      setConditionToCycle(true);
      setHasArrived(true);
    }
    if (vehicleState === 5) {
      setConditionToCycle(false);
      setReturnedValue(0);
      setHasArrived(false);
    }
  }, [hasArrived, returnedValue, vehicleState]);

  // TODO: have to figure out how to send checkpoints in correct order and timing
  const handleSetCheckpoint = useCallback(() => {
    setPublishCheckpoint(true);
    setBufferValue(1);
    setTimeout(() => {
      setIsWaitingForCheckpoint(false);
    }, 250);
  }, []);

  const handleSetOffCheckpoint = useCallback(() => {
    setPublishCheckpoint(false);
    setBufferValue(0);
    const temp = [...unchangedCheckpoints];
    temp.splice(temp.length - 1, 1);
    setUnchangedCheckpoints(temp);
    setIsWaitingForCheckpoint(true);
  }, []);

  const handleBufferCheckpoint = () => {
    setBufferValue(2);
  };

  useEffect(() => {
    if (vehicleState === 4 && bufferValue === 0 && isWaitingForCheckpoint) {
      handleSetCheckpoint();
    }
    if (bufferValue === 1) {
      handleBufferCheckpoint();
    }
    if (bufferValue === 2 && (vehicleState === 3 || publishCheckpoint) && !isWaitingForCheckpoint) {
      handleSetOffCheckpoint();
    }
  }, [
    bufferValue,
    handleSetCheckpoint,
    handleSetOffCheckpoint,
    isWaitingForCheckpoint,
    publishCheckpoint,
    vehicleState,
  ]);

  useEffect(() => {
    if (vehicleState === 5) {
      setUnchangedCheckpoints(recInputFields);
    }
  });

  const [selectDestination, setSelectDestination] = useAtom(destinationAtom);

  return (
    <div className="flex h-[calc(100vh_-_5rem)] bg-[#fff]">
      {!selectDestination ? (
        <div
          id="left"
          className="font-prompt no-scrollbar relative z-0 flex h-full w-[30%] flex-col items-center gap-y-6 overflow-auto pt-40 pb-32"
        >
          <div
            onClick={() => {
              setSelectDestination(true);
            }}
            className="rounded-3xl relative flex h-20 w-[30rem] items-center bg-[#eaeaea] font-mono font-normal cursor-pointer"
          >
            <div className="absolute left-4 flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#C0C5C5C5] text-sm">
              <ImMap2 className="h-6 w-6 text-[#3F3F3F] font-semibold" />
            </div>
            <div className="fullRoundLeftXlRoundRight ml-20 flex h-12 w-full items-center text-xs font-semibold text-black">
              Select Destination From Map
            </div>
          </div>
          {/* Select Saved Places */}
          <div className="rounded-3xl relative flex h-20 w-[30rem] items-center bg-[#eaeaea] font-mono font-normal">
            <div className="absolute left-4 flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#C0C5C5C5] text-sm">
              <RiStarSFill className="h-8 w-8 text-[#3F3F3F] font-semibold" />
            </div>
            <div className="fullRoundLeftXlRoundRight ml-20 flex h-12 w-full items-center text-xs font-semibold text-black">
              Select Saved Places
            </div>
          </div>
          {/* Latest Trips */}
          <div className="rounded-3xl relative flex h-20 w-[30rem] items-center bg-[#eaeaea] font-mono font-normal">
            <div className="absolute left-4 flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#C0C5C5C5] text-sm">
              <GiPathDistance className="h-8 w-8 text-[#3F3F3F] font-semibold" />
            </div>
            <div className="fullRoundLeftXlRoundRight ml-20 flex h-12 w-full items-center text-xs font-semibold text-black">
              Latest Trips
            </div>
          </div>
        </div>
      ) : (
        <OldMissionControl context={context} />
      )}

      <div id="right" className="relative h-full w-[70%] overflow-hidden">
        <MapMain context={context} />
      </div>
    </div>
  );
};

export default MissionControl;
