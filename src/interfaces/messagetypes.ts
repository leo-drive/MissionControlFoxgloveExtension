import { Header, OccupancyGrid, Pose, Duration } from "./ros";

export interface IAutowareState {
    stamp: {
        sec: number;
        nsec: number;
    };
    state: number;
}

export interface markerArray {
    action: number;
    color: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    colors: {
        r: number;
        g: number;
        b: number;
        a: number;
    }[];
    frame_locked: boolean;
    header: {
        frame_id: string;
        stamp: {
            sec: number;
            nanosec: number;
        };
    };
    id: number;
    lifetime: {
        sec: number;
        nanosec: number;
    };
    mesh_file: {
        data: string;
        filename: string;
    };
    mesh_resource: string;
    mesh_use_embedded_materials: boolean;
    ns: string;
    points: {
        x: number;
        y: number;
        z: number;
    }[];
    pose: {
        position: {
            x: number;
            y: number;
            z: number;
        };
        orientation: {
            x: number;
            y: number;
            z: number;
            w: number;
        };
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
    text: string;
    texture: {
        data: string;
        format: string;
        header: {
            frame_id: string;
            stamp: {
                sec: number;
                nanosec: number;
            };
        };
    };
    texture_resource: string;
    type: number;
    uv_coordinates: number[];
}

export interface IAwapiAutowareGetStatus {
    header: {
        stamp: {
            sec: number;
            nsec: number;
        };
        frame_id: string;
    };
    autoware_state: string;
    control_mode: number;
    gate_mode: number;
    emergency_stopped: string;
    current_max_velocity: number;
    hazard_status: unknown;
    stop_reason: unknown;
    diagnostics: [
        {
            hardware_id: string;
            level: number;
            message: string;
            name: string;
            values: [
                {
                    key: string;
                    value: string;
                },
            ];
        },
    ];
    error_diagnostics: unknown;
    autonomous_overridden: string;
    arrived_goal: string;
}

export interface IAwapiVehicleGetStatus {
    header: {
        stamp: {
            sec: number;
            nsec: number;
        };
        frame_id: string;
    };
    pose: {
        position: { x: number; y: number; z: number };
        orientation: { x: number; y: number; z: number; w: number };
    };
    eulerangle: {
        roll: number;
        pitch: number;
        yaw: number;
    };
    geo_point: {
        latitude: number;
        longitude: number;
        altitude: number;
    };
    velocity: number;
    acceleration: number;
    steering: number;
    steering_velocity: number;
    angular_velocity: number;
    gear: number;
    energy_level: number;
    turn_signal: number;
    target_velocity: number;
    target_acceleration: number;
    target_steering: number;
    target_steering_velocity: number;
}

export interface PathPoint {
    /**
     * @description Represents a pose from a lanelet map, contains twist information.
     */

    pose: Pose;
    longitudinal_velocity_mps: number;
    lateral_velocity_mps: number;
    heading_rate_rps: number;
    is_final: boolean;
}

export interface Path {
    /**
     * @description Contains a PathPoint path and an OccupancyGrid of drivable_area.
     */
    header: Header;
    points: PathPoint[];
    drivable_area: OccupancyGrid;
}

export interface TrajectoryPoint {
    /**
     * @description Representation of a trajectory point for the controller
     */
    time_from_start: Duration;
    pose: Pose;
    longitudinal_velocity_mps: number;
    lateral_velocity_mps: number;
    heading_rate_rps: number;
    acceleration_mps2: number;
    front_wheel_angle_rad: number;
    rear_wheel_angle_rad: number;
}

export interface Trajectory {
    /**
     * @description A set of trajectory points for the controller
     */
    header: Header;
    points: TrajectoryPoint[];
}

export interface TrafficLight {
    /**
     * @description Represents a traffic light color
     * 1: RED
     * 2: AMBER
     * 3: GREEN
     * 4: WHITE
     */
    color: number;
    /**
     * @description Represents the shape of a traffic light
     * 5: CIRCLE
     * 6: LEFT_ARROW
     * 7: RIGHT_ARROW
     * 8: UP_ARROW
     * 9: DOWN_ARROW
     * 10: DOWN_LEFT_ARROW
     * 11: DOWN_RIGHT_ARROW
     * 12: CROSS
     */
    shape: number;
    /**
     * @description Represents the status of a traffic light
     * 13: SOLID_OFF
     * 14: SOLID_ON
     * 15: FLASHING
     * 16: UNKNOWN
     */
    status: number;
    /**
     * @description Represents the confidence of a traffic light
     * Values range from 0 to 1
     * 0: No confidence
     * 1: Full confidence
     */
    confidence: number;
}

export interface TrafficSignal {
    map_primitive_id: number;
    lights: TrafficLight[];
}

export interface TrafficSignalArray {
    header: {
        stamp: {
            sec: number;
            nsec: number;
        };
        frame_id: string;
    };
    signals: TrafficSignal[];
}

export interface hazardType {
    hardware_id: string;
    level: number;
    message: string;
    name: string;
    values: [
        {
            key: string;
            value: string;
        },
    ];
}

export interface hazardStatus {
    stamp: {
        sec: number;
        nanosec: number;
    };
    status: {
        diag_latent_fault: hazardType[];
        diag_no_fault: hazardType[];
        diag_safe_fault: hazardType[];
        diag_single_fault: hazardType[];
        emergency: boolean;
        emergency_holding: boolean;
        level: number;
    };
}
