import TunnelMate from "./mate";

export interface APIResponse {
    id: String;
    port: number;

    max_conn_count: number;
}

export interface StatsInfo {
    id: String;

    localURL: String;
    hostURL: String;

    pw: TunnelMate;
    time: number;

    recieve: number;
    transmit: number;
}
