import MapMain from "./leafMap";
import BurgerMenu from "./burgermenu";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  inputFieldsAtom,
  engageReceivedAtom,
  emergencyStateAtom,
  awapiAWStatusAtom,
  localeAtom,
  vehicleHazardStatusAtom,
  checkpointsbuttonAtom,
  processAtom,
  publishProcessAtom,
  autowareProcessDiagAtom,
  VehicleStateState,
  poseAtom,
  goalpointbuttonAtom,
  publishCheckpointButtonLeftAtom,
  publishGoalPointButtonLeftAtom,
  repeatCycleCheckpointsState,
  restartPCAtom,
  restartAWAtom,
  shutdownPCAtom,
  engageStateAtom,
  publishEmergencyServiceAtom,
} from "../jotai/atoms";
// import { Publisher, RosConnection, useRos } from "rosreact";
import { motion, AnimatePresence } from "framer-motion";
import Lang from "../languages/a.json";
import { useAtom } from "jotai";
import { toast } from "react-hot-toast";

const MissionControl = () => {
  const [recInputFields, setRecInputFields] = useAtom(inputFieldsAtom);
  const [recEngage, _setRecEngage] = useAtom(engageReceivedAtom);
  const [awapiAWStatus, _setAwapiAWStatus] = useAtom(awapiAWStatusAtom);

  const [recEmergency, _setRecEmergency] = useAtom(emergencyStateAtom);
  const [emegencyHazardStatus, _setEmergencyHazardStatus] = useState(false);
  const [emergencyHoldingStatus, _setEmergencyHoldingStatus] = useState(false);
  const [_hazardStatus, _setHazardStatus] = useAtom(vehicleHazardStatusAtom);

  const removeRef = useRef<HTMLDivElement>(null);
  const removeRefCP = useRef<HTMLDivElement>(null);

  const [_engageState, setEngageState] = useAtom(engageStateAtom);
  const [_serviceCallEmergency, setServiceCallEmergency] = useAtom(publishEmergencyServiceAtom);

  const [_processValue, setProcessValue] = useAtom(processAtom);
  const [_processButton, setProcessButton] = useAtom(publishProcessAtom);

  const [vehicleState, _setVehicleState] = useAtom(VehicleStateState);
  const [pose, setPose] = useAtom(poseAtom);
  const [locale, _setLocale] = useAtom(localeAtom);

  const [goalpointButton, setGoalpointButton] = useAtom(goalpointbuttonAtom);
  const [checkpointButton, setCheckpointButton] = useAtom(checkpointsbuttonAtom);
  const [autowareProcess, _setAutowareProcess] = useAtom(autowareProcessDiagAtom);

  const [_publishGoalpoint, setPublishGoalpoint] = useAtom(publishGoalPointButtonLeftAtom);
  const [publishCheckpoint, setPublishCheckpoint] = useAtom(publishCheckpointButtonLeftAtom);
  const [hasArrived, setHasArrived] = useState(false);
  const [conditionToCycle, setConditionToCycle] = useState(false);

  const [returnedValue, setReturnedValue] = useState(0);
  const [bufferValue, setBufferValue] = useState(0);
  const [isWaitingForCheckpoint, setIsWaitingForCheckpoint] = useState(false);

  const [unchangedCheckpoints, setUnchangedCheckpoints] = useAtom(repeatCycleCheckpointsState);
  //    const [open, setOpen] = useState(false);
  const [restart, setRestart] = useAtom(restartPCAtom);
  const [restartAW, setRestartAW] = useAtom(restartAWAtom);
  const [shutdown, setShutdown] = useAtom(shutdownPCAtom);

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

  const controlModeInfo = () => {
    return awapiAWStatus.control_mode === 0
      ? Lang.missionCont.manual[locale]
      : awapiAWStatus.control_mode === 1
      ? Lang.missionCont.autonomous[locale]
      : awapiAWStatus.control_mode === 2
      ? Lang.missionCont.intervention[locale]
      : Lang.missionCont.buttons.Unknown[locale];
  };
  const vehicleStateInfo = useCallback(() => {
    {
      return vehicleState === 1
        ? Lang.missionCont.buttons.Initializing[locale]
        : vehicleState === 2
        ? Lang.missionCont.buttons.WaitingForGoal[locale]
        : vehicleState === 3
        ? Lang.missionCont.buttons.Planning[locale]
        : vehicleState === 4
        ? Lang.missionCont.buttons.ReadyForEngage[locale]
        : vehicleState === 5
        ? Lang.missionCont.buttons.Driving[locale]
        : vehicleState === 6
        ? Lang.missionCont.buttons.ArrivedGoal[locale]
        : Lang.missionCont.buttons.Unknown[locale];
    }
  }, [vehicleState, locale]);

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

  // setPublishCheckpoint(false);
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
  return (
    <div className="flex h-full bg-[#222831]">
      <div
        id="left"
        className="font-prompt no-scrollbar relative z-0 flex h-full w-2/5 flex-col items-center gap-y-6 overflow-auto pt-12 pb-32"
      >
        <AnimatePresence>
          {restart && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute z-10 h-full w-full"
            >
              <div className="center absolute inset-0 flex h-full w-full items-center justify-center p-0 px-4 py-6">
                <div
                  onClick={() => {
                    setRestart(false);
                  }}
                  className="fixed inset-0 z-10 transition-opacity"
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="no-scrollbar z-20 w-full transform overflow-auto rounded-lg bg-white shadow-xl transition-all">
                  <div className="flex h-40 flex-col items-center justify-center gap-y-8 bg-[#222831] p-2">
                    <span className="text-center text-sm font-semibold text-white">
                      {Lang.missionCont.restartPC[locale]}
                    </span>
                    <div className="flex items-center gap-x-12">
                      <button
                        className="rounded-md bg-[#00adb5] px-4 py-2 font-semibold text-white"
                        onClick={() => {
                          setProcessValue(1);
                          setRestart(false);
                          setProcessButton(true);
                          setTimeout(() => {
                            setProcessButton(false);
                          }, 300);
                        }}
                      >
                        {Lang.missionCont.yes[locale]}
                      </button>
                      <button
                        onClick={() => {
                          setRestart(false);
                        }}
                        className="rounded-md bg-[#e63946] px-4 py-2 font-semibold text-white"
                      >
                        {Lang.missionCont.no[locale]}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {restartAW && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute z-10 h-full w-full"
            >
              <div className="center absolute inset-0 z-50 flex h-full w-full items-center justify-center p-0 px-4 py-6">
                <div
                  onClick={() => {
                    setRestartAW(false);
                  }}
                  className="fixed inset-0 z-10 transition-opacity"
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="no-scrollbar z-[9999] w-full transform overflow-auto rounded-lg bg-white shadow-xl transition-all">
                  <div className="flex h-40 flex-col items-center justify-center gap-y-8 bg-[#222831] p-2">
                    <span className="text-center text-sm font-semibold text-white">
                      {Lang.missionCont.restartAW[locale]}
                    </span>
                    <div className="flex items-center gap-x-12">
                      <button
                        className="rounded-md bg-[#00adb5] px-4 py-2 font-semibold text-white"
                        onClick={() => {
                          setProcessValue(3);
                          setRestartAW(false);
                          setProcessButton(true);
                          setTimeout(() => {
                            setProcessButton(false);
                          }, 300);
                        }}
                      >
                        {Lang.missionCont.yes[locale]}
                      </button>
                      <button
                        onClick={() => {
                          setRestartAW(false);
                        }}
                        className="rounded-md bg-[#e63946] px-4 py-2 font-semibold text-white"
                      >
                        {Lang.missionCont.no[locale]}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {shutdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute z-10 h-full w-full"
            >
              <div className="center absolute inset-0 flex h-full w-full items-center justify-center p-0 px-4 py-6">
                <div
                  onClick={() => {
                    setShutdown(false);
                  }}
                  className="fixed inset-0 z-10 transition-opacity"
                >
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="no-scrollbar z-[999999] w-full transform overflow-auto rounded-lg bg-white shadow-xl transition-all">
                  <div className="flex h-40 flex-col items-center justify-center gap-y-8 bg-[#222831] p-2">
                    <span className="text-center text-sm font-semibold text-white">
                      {Lang.missionCont.shutdownPC[locale]}
                    </span>
                    <div className="flex items-center gap-x-12">
                      <button
                        className="rounded-md bg-[#00adb5] px-4 py-2 font-semibold text-white"
                        onClick={() => {
                          setProcessValue(0);
                          setShutdown(false);
                          setProcessButton(true);
                          setTimeout(() => {
                            setProcessButton(false);
                          }, 300);
                        }}
                      >
                        {Lang.missionCont.yes[locale]}
                      </button>
                      <button
                        onClick={() => {
                          setShutdown(false);
                        }}
                        className="rounded-md bg-[#e63946] px-4 py-2 font-semibold text-white"
                      >
                        {Lang.missionCont.no[locale]}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="fullRoundLeftXlRoundRight relative flex h-12 w-72 items-center bg-[#222831]">
          <div className="center absolute -z-10 h-[110%] w-[110%] rounded-3xl bg-gradient-to-b from-gray-600 to-black opacity-100 blur-xl"></div>

          <div className="absolute flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#00ADB5] text-xl">
            {controlModeInfo() === Lang.missionCont.manual[locale] ? (
              <svg
                width="30"
                height="34"
                viewBox="0 0 30 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.73 33.89C16.7 33.72 18.67 33.62 20.63 33.38C22.84 33.11 25.01 32.64 26.95 31.48C28.63 30.48 29.44 29.04 29.02 27.3C27.97 23 25.32 19.94 21.42 17.92C20.87 17.64 20.38 17.7 19.8 18.02C16.4 19.9 12.95 19.9 9.54996 18.01C8.96996 17.69 8.46997 17.63 7.92997 17.91C4.06997 19.91 1.42995 22.95 0.349952 27.2C-0.0500479 28.79 0.499991 30.21 1.88999 31.09C2.92999 31.74 4.07999 32.28 5.25999 32.64C8.32999 33.58 11.52 33.77 14.73 33.89ZM14.62 17.35C19.19 17.37 22.89 13.71 22.9 9.17C22.91 4.6 19.2599 0.900025 14.7199 0.880025C10.1699 0.860025 6.45998 4.53003 6.43998 9.07003C6.41998 13.64 10.07 17.33 14.62 17.35Z"
                  fill="white"
                />
                <path
                  d="M14.73 33.89C11.52 33.77 8.32998 33.58 5.25998 32.65C4.08998 32.29 2.92999 31.76 1.88999 31.1C0.499989 30.22 -0.0600498 28.8 0.34995 27.21C1.42995 22.96 4.06997 19.92 7.92997 17.92C8.46997 17.64 8.96996 17.69 9.54996 18.02C12.95 19.9 16.39 19.9 19.8 18.03C20.38 17.71 20.88 17.65 21.42 17.93C25.32 19.95 27.97 23.01 29.02 27.31C29.44 29.06 28.63 30.5 26.95 31.49C25 32.65 22.83 33.12 20.63 33.39C18.66 33.61 16.69 33.72 14.73 33.89Z"
                  fill="black"
                />
                <path
                  d="M14.62 17.35C10.07 17.33 6.41001 13.64 6.43001 9.08004C6.45001 4.54004 10.16 0.870035 14.71 0.890035C19.25 0.910035 22.9 4.60001 22.89 9.18001C22.9 13.71 19.2 17.37 14.62 17.35Z"
                  fill="black"
                />
              </svg>
            ) : (
              <svg
                width="41"
                height="46"
                viewBox="0 0 41 46"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
              >
                <path
                  d="M20.62 44.42L3.19998 34.35L38.02 34.38L20.62 44.42ZM20.22 1.81L2.14998 32.78L2.09998 12.34L20.22 1.81ZM21.02 1.81L39.2 12.24L39.25 32.55L21.02 1.81ZM20.62 22.82L38.29 33.92L3.26998 33.89L20.62 22.82ZM20.62 2.03L38.75 32.6L20.61 21.2L2.79998 32.57L20.62 2.03ZM40.57 11.45L20.62 0L0.72998 11.55L0.789982 34.55L20.62 46L40.62 34.45L40.57 11.45Z"
                  fill="black"
                />
              </svg>
            )}
          </div>
          <div className="fullRoundLeftXlRoundRight ml-20 flex h-12 w-full items-center text-sm font-semibold text-white">
            {vehicleStateInfo()}
          </div>
        </div>
        <div className="fullRoundLeftXlRoundRight relative flex h-12 w-72 items-center bg-[#222831]">
          <div className="center absolute -z-10 h-[110%] w-[110%] rounded-3xl bg-gradient-to-b from-gray-600 to-black opacity-100 blur-xl"></div>

          <div className="absolute flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#00ADB5] text-xl">
            <svg
              width="32"
              height="31"
              viewBox="0 0 32 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-11 w-11 p-2"
            >
              <path
                d="M30.2199 0.0300293C30.4499 0.180029 30.7199 0.280026 30.8999 0.480026C31.2999 0.910026 31.2899 1.42003 31.0699 1.95003C29.5499 5.67003 28.0299 9.38004 26.5099 13.1C24.2799 18.56 22.0399 24.01 19.8099 29.47C19.6299 29.92 19.3799 30.3 18.8799 30.43C18.1399 30.63 17.4599 30.22 17.3099 29.47C17.0399 28.07 16.7899 26.67 16.5399 25.27C16.0199 22.41 15.4999 19.54 14.9799 16.68C14.9399 16.44 14.8499 16.34 14.5999 16.29C11.3799 15.72 8.16991 15.13 4.95991 14.55C3.95991 14.37 2.95991 14.18 1.94991 14.01C1.34991 13.91 0.989907 13.55 0.779907 13.01C0.779907 12.83 0.779907 12.65 0.779907 12.47C0.949907 11.99 1.26991 11.67 1.74991 11.47C11.0799 7.67003 20.4099 3.85002 29.7399 0.0400238C29.8999 0.0300238 30.0599 0.0300293 30.2199 0.0300293Z"
                fill="#222831"
                transform="scale(0.9),translate(-1.00012207 2.50012207)"
              />
            </svg>
          </div>
          <div className="fullRoundLeftXlRoundRight ml-20 flex  h-12 w-full items-center text-sm font-semibold text-white">
            {recEngage !== undefined && recEngage.toString() === "true"
              ? Lang.missionCont.missionActive[locale]
              : Lang.missionCont.missionInactive[locale]}
          </div>
        </div>
        <div
          className={`w-72 ${
            recEmergency ? "emergencyRed2" : "bg-[#222831]"
          } fullRoundLeftXlRoundRight relative flex h-12 items-center`}
        >
          <div className="center absolute -z-10 h-[110%] w-[110%] rounded-3xl bg-gradient-to-b from-gray-600 to-black opacity-100 blur-xl"></div>
          <div
            className={`h-12 w-12 rounded-full 
                  ${recEmergency ? "bg-[#e63946]" : "bg-[#00ADB5]"}  
           absolute flex flex-col items-center justify-center text-xl`}
          >
            {recEmergency ? (
              <svg
                width="29"
                height="32"
                viewBox="0 0 29 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-11 w-11 p-2"
              >
                <path d="M14.68 0.299988L0.880005 24.2H28.48L14.68 0.299988Z" fill="#222831" />
                <path
                  d="M13.4779 9.66642H15.8979V19.4664H13.4779V9.66642ZM14.6779 23.9464C14.2779 23.9464 13.9379 23.8131 13.6579 23.5464C13.3912 23.2664 13.2579 22.9331 13.2579 22.5464C13.2579 22.1464 13.3912 21.8131 13.6579 21.5464C13.9379 21.2798 14.2779 21.1464 14.6779 21.1464C15.0779 21.1464 15.4112 21.2798 15.6779 21.5464C15.9579 21.8131 16.0979 22.1464 16.0979 22.5464C16.0979 22.9331 15.9579 23.2664 15.6779 23.5464C15.3979 23.8131 15.0646 23.9464 14.6779 23.9464Z"
                  fill="#EEEEEE"
                  transform="translate(0.00012207 -2.00012)"
                />
              </svg>
            ) : (
              <svg
                version="1.0"
                xmlns="http://www.w3.org/2000/svg"
                width="512.000000pt"
                height="512.000000pt"
                className="h-11 w-11 p-2"
                viewBox="0 0 512.000000 512.000000"
                preserveAspectRatio="xMidYMid meet"
              >
                <g
                  transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                  fill="#000000"
                  stroke="none"
                >
                  <path
                    d="M4090 4211 c-14 -5 -41 -16 -60 -25 -19 -10 -502 -484 -1073 -1054
l-1037 -1037 -398 397 c-272 271 -411 403 -442 419 -68 34 -177 38 -255 8 -51
-19 -77 -40 -181 -143 -144 -145 -167 -184 -168 -296 -2 -144 -39 -99 678
-819 436 -438 654 -649 681 -662 51 -24 119 -24 170 0 28 13 434 413 1321
1302 1430 1432 1320 1311 1318 1459 -1 112 -24 151 -168 296 -102 102 -130
124 -179 142 -59 22 -156 28 -207 13z"
                  />
                </g>
              </svg>
            )}
          </div>
          <div className="fullRoundLeftXlRoundRight ml-20 flex  h-12 w-full items-center text-sm font-semibold text-white">
            {recEmergency
              ? Lang.missionCont.emergencyStatus[locale]
              : Lang.missionCont.normalStatus[locale]}
          </div>
        </div>
        <div
          className={`fullRoundLeftXlRoundRight w-72
          ${vehicleState === 1 || vehicleState === 0 ? "opacity-50" : ""}
          ${goalpointButton || checkpointButton ? "bg-[#E63946]" : "bg-[#00adb5]"}
          relative flex h-12 cursor-pointer items-center transition-all duration-300`}
        >
          <div
            className={`bg-gradient-to-b from-gray-600 
          ${goalpointButton || checkpointButton ? "to-[#E63946]" : "to-[#00adb5]"}
           center XlRounded absolute -z-10 h-[110%] w-[110%] opacity-50 blur-xl`}
          ></div>

          {pose[0] === 0 ? (
            <button
              onClick={() => {
                setGoalpointButton(!goalpointButton);
              }}
              disabled={vehicleState === 1 || vehicleState === 0}
            >
              <div
                className={`h-12 w-12 rounded-full
                ${vehicleState === 1 || vehicleState === 0 ? "opacity-50" : "bg-transparent"}
                absolute flex flex-col items-center justify-center text-xl`}
              >
                <svg
                  width="26"
                  height="38"
                  viewBox="0 0 26 38"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 bg-transparent p-2"
                >
                  <path
                    d="M12.1799 37.43C12.1299 37.32 12.0899 37.21 12.0399 37.11C9.3099 32.47 6.5499 27.86 3.8599 23.2C2.2999 20.49 1.0299 17.64 0.339898 14.56C-0.0301024 12.94 0.149898 11.33 0.589898 9.74999C1.5899 6.14999 3.7699 3.47999 7.1099 1.81999C10.4999 0.129993 14.0199 0.0299772 17.5099 1.45998C20.7699 2.79998 23.0799 5.16998 24.3899 8.45998C25.0699 10.16 25.3699 11.93 25.1899 13.75C25.0399 15.23 24.5699 16.65 23.9199 17.97C23.1099 19.62 22.2699 21.26 21.3199 22.82C18.3899 27.62 15.3899 32.37 12.4199 37.15C12.3599 37.24 12.3199 37.34 12.2699 37.43C12.2299 37.43 12.1999 37.43 12.1799 37.43ZM19.8199 12.63C19.8199 8.67999 16.5899 5.44998 12.6299 5.45998C8.65989 5.45998 5.4499 8.67 5.4599 12.64C5.4699 16.61 8.6799 19.83 12.6399 19.82C16.5799 19.82 19.8199 16.58 19.8199 12.63Z"
                    // fill="#222831"
                    className={String(goalpointButton ? "fill-black" : "fill-[#222831]")}
                  />
                </svg>
              </div>
              <div className="fullRoundLeftXlRoundRight ml-20 flex h-12 w-full items-center text-sm font-semibold ">
                {Lang.missionCont.buttons.addGoalpoint[locale]}
              </div>
            </button>
          ) : (
            <div
              onClick={() => {
                setCheckpointButton(!checkpointButton);
              }}
            >
              <div className="absolute flex h-12 w-12 flex-col items-center justify-center rounded-full bg-transparent text-xl">
                <svg
                  width="26"
                  height="38"
                  viewBox="0 0 26 38"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 bg-transparent p-2"
                >
                  <path
                    d="M12.1799 37.43C12.1299 37.32 12.0899 37.21 12.0399 37.11C9.3099 32.47 6.5499 27.86 3.8599 23.2C2.2999 20.49 1.0299 17.64 0.339898 14.56C-0.0301024 12.94 0.149898 11.33 0.589898 9.74999C1.5899 6.14999 3.7699 3.47999 7.1099 1.81999C10.4999 0.129993 14.0199 0.0299772 17.5099 1.45998C20.7699 2.79998 23.0799 5.16998 24.3899 8.45998C25.0699 10.16 25.3699 11.93 25.1899 13.75C25.0399 15.23 24.5699 16.65 23.9199 17.97C23.1099 19.62 22.2699 21.26 21.3199 22.82C18.3899 27.62 15.3899 32.37 12.4199 37.15C12.3599 37.24 12.3199 37.34 12.2699 37.43C12.2299 37.43 12.1999 37.43 12.1799 37.43ZM19.8199 12.63C19.8199 8.67999 16.5899 5.44998 12.6299 5.45998C8.65989 5.45998 5.4499 8.67 5.4599 12.64C5.4699 16.61 8.6799 19.83 12.6399 19.82C16.5799 19.82 19.8199 16.58 19.8199 12.63Z"
                    fill="#222831"
                  />
                </svg>
              </div>
              <div className="ml-20 flex h-12 w-full items-center text-sm font-semibold">
                {Lang.missionCont.buttons.addCheckpoint[locale]}
              </div>
            </div>
          )}
        </div>
        <div className="flex w-80 flex-col items-center justify-start">
          <div className="no-scrollbar relative flex h-[24rem]  w-72 flex-col items-center overflow-auto rounded-3xl bg-[#222831] pt-2 text-sm font-semibold text-white shadow-xl shadow-gray-900">
            {pose[0] !== 0 && (
              <div className="my-2 flex h-20 w-64 items-center justify-between rounded-xl bg-[#393E46] px-4 py-2 text-base font-semibold">
                {Lang.missionCont.goalpoint[locale]}
                <div
                  className={`flex h-12 w-12 transform cursor-pointer items-center justify-center rounded-full bg-[#e63946] text-lg font-bold text-[#222222] transition-colors duration-200 hover:bg-red-700 focus:outline-none `}
                  onClick={() => {
                    const newGoalPoint = [0, 0, 48.35];
                    const newCheckPoints = [...recInputFields];
                    newCheckPoints.splice(0, recInputFields.length);
                    setRecInputFields(newCheckPoints);
                    setUnchangedCheckpoints(newCheckPoints);
                    setPose(newGoalPoint);
                    setConditionToCycle(false);
                    setReturnedValue(0);
                    setHasArrived(false);
                  }}
                  ref={removeRef}
                >
                  X
                </div>
              </div>
            )}

            {recInputFields
              .map((_checkpoint, index) => (
                <div
                  key={index}
                  className="my-2 flex h-20 w-64 items-center justify-between rounded-xl bg-[#393E46] px-4 py-2 text-base font-semibold"
                >
                  {Lang.missionCont.checkpoint[locale]} {recInputFields.length - index}
                  <div
                    className={`flex h-12 w-12 transform cursor-pointer items-center justify-center rounded-full bg-[#e63946] text-lg font-bold text-[#222222] transition-colors duration-200 hover:bg-red-700 focus:outline-none `}
                    onClick={() => {
                      const newGoalPoints = [...recInputFields];
                      newGoalPoints.splice(index, 1);
                      setRecInputFields(newGoalPoints);
                      setUnchangedCheckpoints(newGoalPoints);
                    }}
                    ref={removeRefCP}
                  >
                    X
                  </div>
                </div>
              ))
              .reverse()}
          </div>
        </div>
        <div
          className={`mt-6 w-72 
          ${
            vehicleStateInfo() === Lang.missionCont.buttons.Driving[locale]
              ? "bg-[#E63946]"
              : vehicleStateInfo() !== Lang.missionCont.buttons.ReadyForEngage[locale]
              ? "bg-[#00adb5] opacity-25"
              : "bg-[#00adb5]"
          }
          
           XlRounded relative flex h-12 items-center justify-between transition-all duration-300`}
        >
          <div
            className={`bg-gradient-to-b from-gray-600 
          ${
            vehicleStateInfo() === Lang.missionCont.buttons.Driving[locale]
              ? "to-[#E63946]"
              : vehicleStateInfo() === Lang.missionCont.buttons.WaitingForGoal[locale]
              ? "to-[#E63946]"
              : "to-[#00adb5]"
          }
           center XlRounded absolute -z-10 h-[110%] w-[110%] opacity-50 blur-xl
           `}
          ></div>

          {vehicleStateInfo() === Lang.missionCont.buttons.Driving[locale] ? (
            <button
              onClick={() => {
                setEngageState(true);
                setTimeout(() => {
                  setEngageState(false);
                }, 500);
              }}
              // disabled={vehicleStateInfo() !== "Driving"}
              className={`h-14 w-full px-4 py-2 text-sm font-semibold  leading-5 transition-colors duration-200
              ${vehicleStateInfo() === Lang.missionCont.buttons.Driving[locale] && "bg-[#E63946]"}
                    XlRounded transform focus:outline-none`}
            >
              {Lang.missionCont.buttons.stop[locale]}
            </button>
          ) : (
            <button
              onClick={() => {
                setEngageState(true);
                setTimeout(() => {
                  setEngageState(false);
                }, 500);
              }}
              disabled={vehicleStateInfo() !== Lang.missionCont.buttons.ReadyForEngage[locale]}
              className={`XlRounded h-14 w-full transform px-4 py-2 
               text-sm font-semibold leading-5
                transition-colors duration-200 focus:outline-none`}
            >
              {Lang.missionCont.buttons.start[locale]}
            </button>
          )}
        </div>
        {pose[0] !== 0 && hasArrived && conditionToCycle && (
          <div
            className={`XlRounded relative flex h-12 w-72 items-center justify-between bg-[#00adb5] transition-all duration-300`}
          >
            <div
              className={`center XlRounded absolute -z-10 h-[110%] w-[110%] bg-gradient-to-b from-gray-600 to-[#00adb5] opacity-50 blur-xl`}
            ></div>

            <button
              onClick={() => {
                //  set up the repeat cycle here of sending the goal point and checkpoints to the robot in order to recreate the path
                // TODO : Fix this function
                // the function that publishes the checkpoints sends the checkpoints in reverse order from the array
                // from first in to last in.
                // the checkpoints are being added to the array in this way [newest, ..., oldest]
                // so the checkpoints are being sent in the order of [oldest, ..., newest]
                // this is why the checkpoints are being sent in reverse order
                // the goal point is being sent first, then the checkpoints are being sent in reverse order

                // after the goal point is sent, the robot will start planning the path, then send a "ready for engage" message
                // once the robot has that status, the checkpoints will be sent in reverse order, and the robot will start planning the path
                // after each checkpoint is sent, the robot will start planning the path, then send a "ready for engage" message
                // once the robot has that status, the next checkpoint will be sent, and the robot will start planning the path
                // this will continue until the array is empty, then the robot will send a "ready for engage" message
                // once the robot has that status, the cycle will end

                // TODO : On click of the button, send goal point, then send checkpoints in the correct order
                // TODO : while waiting for the robot to finish planning everytime
                // TODO : Once the robot has finished planning, send the next checkpoint and slice the array element that was sent
                // TODO : Once the array is empty, send change the isWaitingForCheckpoint to false and finish the cycle.
                setPublishGoalpoint(true);
                setTimeout(() => {
                  setPublishGoalpoint(false);
                }, 200);
                setBufferValue(0);
                setIsWaitingForCheckpoint(true);
              }}
              className={`XlRounded h-14 w-full transform px-4 py-2  text-sm font-semibold leading-5
                transition-colors duration-200 focus:outline-none`}
            >
              {Lang.missionCont.repeatCycle[locale]}
            </button>
          </div>
        )}
        {(emergencyHoldingStatus || emegencyHazardStatus || recEmergency) && (
          <div
            className={`XlRounded relative flex h-12 w-72 items-center justify-between bg-[#E63946] transition-all duration-300`}
          >
            <div
              className={`center XlRounded absolute -z-10 h-[110%] w-[110%] bg-gradient-to-b from-gray-600 to-[#E63946] opacity-50 blur-xl`}
            ></div>

            <button
              onClick={() => {
                setServiceCallEmergency(true);
                setTimeout(() => {
                  setServiceCallEmergency(false);
                }, 200);
              }}
              disabled={!emergencyHoldingStatus && !emegencyHazardStatus && !recEmergency}
              className={`XlRounded h-14 w-full transform px-4 py-2  text-sm font-semibold leading-5
                transition-colors duration-200 focus:outline-none`}
            >
              {Lang.missionCont.clearEmergency[locale]}
            </button>
          </div>
        )}
        <BurgerMenu />
      </div>

      <div id="right" className="relative h-full w-3/5 overflow-hidden">
        <MapMain />
      </div>
    </div>
  );
};

export default MissionControl;
