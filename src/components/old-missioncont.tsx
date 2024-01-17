import BurgerMenu from "./burgermenu";
import {
  useEffect,
  // useRef,
  useState,
  useCallback,
} from "react";
import {
  inputFieldsAtom,
  localeAtom,
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
  destinationAtom,
} from "../jotai/atoms";
import { motion, AnimatePresence } from "framer-motion";
import Lang from "../languages/a.json";
import { useAtom } from "jotai";
import { toast } from "react-hot-toast";
import { PanelExtensionContext } from "@foxglove/studio";
import { ImMap2 } from "react-icons/im";
import { IoMdRemove } from "react-icons/io";
import { GrAdd } from "react-icons/gr";

const OldMissionControl = ({ context }: { context: PanelExtensionContext }) => {
  const [recInputFields, setRecInputFields] = useAtom(inputFieldsAtom);

  // const removeRef = useRef<HTMLDivElement>(null);
  // const removeRefCP = useRef<HTMLDivElement>(null);

  const [_processValue, setProcessValue] = useAtom(processAtom);
  const [_processButton, setProcessButton] = useAtom(publishProcessAtom);

  const [vehicleState, _setVehicleState] = useAtom(VehicleStateState);
  const [pose, setPose] = useAtom(poseAtom);
  const [locale, _setLocale] = useAtom(localeAtom);

  const [goalpointButton, setGoalpointButton] = useAtom(goalpointbuttonAtom);
  const [checkpointButton, setCheckpointButton] = useAtom(checkpointsbuttonAtom);
  const [autowareProcess, _setAutowareProcess] = useAtom(autowareProcessDiagAtom);

  const [_publishGoalpoint, _setPublishGoalpoint] = useAtom(publishGoalPointButtonLeftAtom);
  const [publishCheckpoint, setPublishCheckpoint] = useAtom(publishCheckpointButtonLeftAtom);
  const [hasArrived, setHasArrived] = useState(false);
  const [_conditionToCycle, setConditionToCycle] = useState(false);

  const [returnedValue, setReturnedValue] = useState(0);
  const [bufferValue, setBufferValue] = useState(0);
  const [isWaitingForCheckpoint, setIsWaitingForCheckpoint] = useState(false);

  const [unchangedCheckpoints, setUnchangedCheckpoints] = useAtom(repeatCycleCheckpointsState);
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

  const callService = useCallback(
    async (serviceName: string, request: any) => {
      if (!context.callService) {
        return;
      }

      try {
        const response = await context.callService(serviceName, request);
        console.log(`Service ${serviceName} response:`, response);
        return response;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    [context.callService],
  );

  const [_selectDestination, _setSelectDestination] = useAtom(destinationAtom);

  return (
    <div
      id="left"
      className="font-prompt no-scrollbar relative z-0 flex h-full w-[30%] flex-col items-center gap-y-6 overflow-auto pt-12 pb-32"
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

      <div className="relative rounded-3xl h-72 w-[30rem] bg-[#F4F4F4] font-mono font-normal ">
        <div className="absolute top-0 flex flex-col items-center justify-center">
          <div className="rounded-3xl relative flex h-20 w-[30rem] items-center bg-[#eaeaea]">
            {/* <div className="center absolute -z-10 h-[110%] w-[110%] rounded-3xl bg-gradient-to-b from-gray-600 to-black opacity-100 blur-xl"></div> */}
            <div className="absolute left-4 flex h-12 w-12 flex-col items-center justify-center rounded-full bg-[#C0C5C5C5] text-sm">
              <ImMap2 className="h-6 w-6 text-[#3F3F3F] font-semibold" />
            </div>
            <div className="fullRoundLeftXlRoundRight ml-20 flex h-12 w-full items-center text-xs font-semibold text-black">
              Select Destination From Map
            </div>
          </div>
        </div>

        <div className="absolute flex flex-col items-center top-32 left-12">
          {/* small circle */}
          <div className="flex h-2 w-2 flex-col items-center justify-center rounded-full bg-[#5D5D5D] text-sm" />
          {/* long stick */}
          <div className="flex h-20 w-0.5 flex-col items-center justify-center bg-[#5D5D5D] text-sm" />
          {/* small circle */}
          <div className="flex h-2 w-2 flex-col items-center justify-center rounded-full bg-[#5D5D5D] text-sm" />
        </div>

        <div className="absolute top-28 left-20 flex flex-col items-center justify-center">
          <div className="text-xs rounded-md font-semibold text-black relative flex h-12 w-80 items-center bg-[#bababa] px-4">
            Your location
          </div>
          d
        </div>
        <div className="absolute top-48 left-20 flex items-center justify-between ">
          <div
            onClick={() => {
              if (pose[0] === 0) setGoalpointButton(!goalpointButton);
            }}
            className={`text-xs rounded-md font-semibold relative px-4 flex h-12 w-80 items-center justify-between bg-[#d6d6d6] ${
              pose[0] === 0 ? "text-[#2F9AE7] cursor-pointer " : "text-black"
            }`}
          >
            {pose[0] === 0
              ? "Select a destination"
              : pose[0]?.toFixed(6) + ", " + pose[1]?.toFixed(6)}

            {/* remove button */}

            {pose[0] !== 0 && !(goalpointButton || checkpointButton) && (
              <IoMdRemove
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
                className="h-6 w-6 text-[#3F3F3F] cursor-pointer font-semibold"
              />
            )}

            {goalpointButton || checkpointButton ? (
              <div
                className={`inline-block h-6 w-6 
                ${goalpointButton && "text-[#e63946]"}
                ${checkpointButton && "text-[#00adb5]"}
                    animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
                role="status"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
            ) : null}
          </div>
        </div>
        {pose[0] !== 0 && (
          <div
            onClick={() => {
              setCheckpointButton(!checkpointButton);
            }}
            className="absolute bottom-4 left-6 font-semibold flex items-center text-[#2F9AE7] text-xs space-x-2 cursor-pointer"
          >
            <GrAdd className="h-4 w-4" />
            <span>Add a checkpoint</span>
          </div>
        )}
      </div>

      {/* <div className="flex w-80 flex-col items-center justify-start">
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
      </div> */}

      <div
        className={`mt-6 w-72 
          ${
            vehicleStateInfo() === Lang.missionCont.buttons.Driving[locale]
              ? "bg-[#E63946]"
              : vehicleStateInfo() !== Lang.missionCont.buttons.ReadyForEngage[locale]
              ? "bg-[#D9D9D9] opacity-25"
              : "bg-[#D9D9D9]"
          }
          
           XlRounded relative flex h-12 items-center justify-between transition-all duration-300 text-black font-mono font-semibold`}
      >
        <div
          className={`bg-gradient-to-b from-gray-600 
          ${
            vehicleStateInfo() === Lang.missionCont.buttons.Driving[locale]
              ? "to-[#E63946]"
              : vehicleStateInfo() === Lang.missionCont.buttons.WaitingForGoal[locale]
              ? "to-[#E63946]"
              : "to-[#D9D9D9]"
          }
           center XlRounded absolute -z-10 h-[110%] w-[110%] opacity-50 blur-xl
           `}
        ></div>

        {vehicleStateInfo() === Lang.missionCont.buttons.Driving[locale] ? (
          <button
            onClick={async () => {
              await callService("/api/autoware/set/engage", { engage: false });
            }}
            // disabled={vehicleStateInfo() !== "Driving"}
            className={`h-14 w-full px-4 py-2 text-sm font-semibold  leading-5 transition-colors duration-200
              ${vehicleStateInfo() === Lang.missionCont.buttons.Driving[locale] && "bg-[#E63946]"}
                    XlRounded transform focus:outline-none`}
          >
            {Lang.missionCont.buttons.stop[locale]} Ride
          </button>
        ) : (
          <button
            onClick={async () => {
              await callService("/api/autoware/set/engage", { engage: true });
            }}
            disabled={vehicleStateInfo() !== Lang.missionCont.buttons.ReadyForEngage[locale]}
            className={`XlRounded h-14 w-full transform px-4 py-2 
               text-sm font-semibold leading-5
                transition-colors duration-200 focus:outline-none`}
          >
            {Lang.missionCont.buttons.start[locale]} Ride
          </button>
        )}
      </div>
      {/* {pose[0] !== 0 && hasArrived && conditionToCycle && (
        <div
          className={`XlRounded relative flex h-12 w-72 items-center justify-between bg-[#D9D9D9] transition-all duration-300`}
        >
          <div
            className={`center XlRounded absolute -z-10 h-[110%] w-[110%] bg-gradient-to-b from-gray-600 to-[#D9D9D9] opacity-50 blur-xl`}
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
      )} */}

      <BurgerMenu />
    </div>
  );
};

export default OldMissionControl;
