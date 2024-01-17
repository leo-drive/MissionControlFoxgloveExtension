/** @jsxImportSource jotai-signal */
import { IAwapiVehicleGetStatus, TrafficSignalArray } from "../interfaces/messagetypes";

import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { SyncStorage } from "jotai/vanilla/utils/atomWithStorage";
import { TransformStamped } from "../interfaces/ros";
import { MessageEvent } from "@foxglove/studio";

export const localeAtom = atomWithStorage<"en" | "fr" | "jp" | "de" | "tr" | "ru">(
  "localelanguage",
  "en",
);

export const messagesAtom = atom<MessageEvent[] | undefined>([]);

export const setLimitVelocityAtom = atom<boolean>(false);
export const LimitVelocityValueAtom = atom<number>(30);

export const engageStateAtom = atom<boolean>(false);
export const engageReceivedAtom = atom<boolean>(false);
export const VehicleStateState = atom<number>(0);

/**
 * This is a list of all the different markers for the road
 */
let seshStorage;
if (typeof window !== "undefined") {
  seshStorage = createJSONStorage(() => sessionStorage);
}

export const trafficLightsStatusAtom = atomWithStorage<TrafficSignalArray>(
  "trafficLightsStatus",
  { header: { stamp: { sec: 0, nsec: 0 }, frame_id: "" }, signals: [] },
  seshStorage as SyncStorage<TrafficSignalArray>,
);

export const awapiVehicleStatusAtom = atom<IAwapiVehicleGetStatus>({
  header: {
    stamp: {
      sec: 0,
      nsec: 0,
    },
    frame_id: "",
  },
  pose: {
    position: { x: 0, y: 0, z: 0 },
    orientation: { x: 0, y: 0, z: 0, w: 0 },
  },
  eulerangle: {
    roll: 0,
    pitch: 0,
    yaw: 0,
  },
  geo_point: {
    latitude: 0,
    longitude: 0,
    altitude: 0,
  },
  velocity: 0,
  acceleration: 0,
  steering: 0,
  steering_velocity: 0,
  angular_velocity: 0,
  gear: 0,
  energy_level: 0,
  turn_signal: 0,
  target_velocity: 0,
  target_acceleration: 0,
  target_steering: 0,
  target_steering_velocity: 0,
});

// getting the tf tree from the rosbridge server
export const tfDataAtom = atom<TransformStamped>({
  header: {
    frame_id: "",
    stamp: {
      sec: 0,
      nsec: 0,
    },
  },
  child_frame_id: "",
  transform: {
    translation: {
      x: 0,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 0,
    },
  },
});
export const tfStaticDataAtom = atomWithStorage<TransformStamped>(
  "tfStaticData",
  {
    header: {
      frame_id: "",
      stamp: {
        sec: 0,
        nsec: 0,
      },
    },
    child_frame_id: "",
    transform: {
      translation: {
        x: 0,
        y: 0,
        z: 0,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
        w: 0,
      },
    },
  },
  seshStorage as SyncStorage<TransformStamped>,
);

export const velocityLimitAtom = atom({
  stamp: {
    sec: 0,
    nanosec: 0,
  },
  max_velocity: 0,
  use_constraints: false,
  constraints: {
    min_acceleration: 0,
    max_jerk: 0,
    min_jerk: 0,
  },
  sender: "",
});

export const vehicleVelocityStatusAtom = atom({
  header: {
    stamp: {
      sec: 0,
      nanosec: 0,
    },
    frame_id: "",
  },
  longitudinal_velocity: 0,
  lateral_velocity: 0,
  heading_rate: 0,
});

export const inputFieldsAtom = atomWithStorage<number[][]>(
  "inputFieldsState",
  [],
  seshStorage as SyncStorage<number[][]>,
);

export const repeatCycleCheckpointsState = atomWithStorage<number[][]>(
  "unchangedCheckpointsState",
  [],
  seshStorage as SyncStorage<number[][]>,
);

export const emergencyStateAtom = atom<boolean>(false);

export const awapiAWStatusAtom = atom({
  header: {
    stamp: {
      sec: 0,
      nsec: 0,
    },
    frame_id: "",
  },
  autoware_state: "",
  control_mode: 888,
  gate_mode: 888,
  emergency_stopped: "",
  current_max_velocity: 0,
  hazard_status: "",
  stop_reason: {},
  diagnostics: [],
  error_diagnostics: {},
  autonomous_overridden: "",
  arrived_goal: "",
});

export const vehicleHazardStatusAtom = atom({
  stamp: {
    sec: 0,
    nanosec: 0,
  },
  status: {
    diag_latent_fault: [{}],
    diag_no_fault: [{}],
    diag_safe_fault: [{}],
    diag_single_point_fault: [{}],
    emergency: false,
    emergency_holding: false,
    level: 0,
  },
});

export const checkpointsbuttonAtom = atom(false);
export const goalpointbuttonAtom = atom(false);

export const poseAtom = atomWithStorage<number[]>(
  "poseState",
  [0, 0],
  seshStorage as SyncStorage<number[]>,
);

export const checkpointAtom = atom<number[]>([0, 0]);

export const processAtom = atom(0);

export const publishProcessAtom = atom(false);
export const autowareProcessDiagAtom = atom(2);

export const followMarkerAtom = atom(false);

export const vehicleLocationAtom = atom({
  latitude: 0,
  longitude: 0,
});

export const publishGoalPointButtonLeftAtom = atom(false);
export const publishCheckpointButtonLeftAtom = atom(false);

export const publishGoalPointButtonAtom = atom(false);
export const publishCheckpointButtonAtom = atom(false);

export const restartPCAtom = atom(false);
export const restartAWAtom = atom(false);
export const shutdownPCAtom = atom(false);

export const publishEmergencyServiceAtom = atom(false);

export const velocityLimitValueAtom = atom(30);
export const destinationAtom = atom(false);
