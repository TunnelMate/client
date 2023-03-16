import { OptionValues } from "commander";
import { EventEmitter } from "events";
import net from "net";
import tls from "tls";
import axios from "axios";
import consts from "./consts";
import logger from "./logger";
import { APIResponse, StatsInfo } from "./interface";
import { HeaderHostTransformer } from "./transformer";

import handleLocalError from "./handles/localError";
import handleLocalConnect from "./handles/connect";
import handleRemoteClose from "./handles/remoteClose";
import getScheme from "./utils/getScheme";

export default class TunnelMate extends EventEmitter {
    private options: OptionValues;

    constructor(options: OptionValues) {
        super();
        this.options = options;
    }

    public async getNewClient(cb: (response: APIResponse) => void) {
        const { secure, host } = this.options;
        const scheme = secure ? "https" : "http";
        const url = `${scheme}://${host}:${consts.SERVER_PORT}?create`;

        try {
            const response = await axios.get(url);
            const res: APIResponse = {
                id: response.data.id,
                port: response.data.port,
                max_conn_count: response.data.max_conn_count,
            };
            cb(res);
        } catch (error) {
            console.error(error);
        }
    }

    public connect(response: APIResponse, cb: (stats: StatsInfo) => void) {
        var startDate = new Date();

        const remote = net.connect(response.port, this.options.host, () => {});
        const scheme = getScheme(this.options.secure);
        const allowInvalidCert = false; // TODO

        const url = `${scheme}://${this.options.host}:${this.options.port}`;
        const hostURL = `${scheme}://${response.id}.${this.options.host}:${this.options.port}/`;

        remote.setKeepAlive(true);
        remote.on("error", (err: any) => {
            logger.debug(`got remote connection error ${err.message}`);
            if (err.code === "ECONNREFUSED") {
                this.emit(
                    "error",
                    new Error(
                        `connection refused: ${this.options.host}:${response.port} (check your firewall settings)`
                    )
                );
            }

            remote.end();
        });

        const connLocal = () => {
            if (remote.destroyed) {
                logger.debug("remote destroyed");
                return;
            }

            logger.debug(`connecting locally to ${url}`);
            remote.pause();

            if (allowInvalidCert) {
                logger.debug("allowing invalid certificates");
            }

            // connection to local http server
            const local = this.options.localHttps
                ? tls.connect(this.options.port, this.options.localHost)
                : net.connect(this.options.port, this.options.localHost);

            const remoteClose = handleRemoteClose(local);

            remote.once("close", remoteClose);
            local.once("error", handleLocalError(remote, local, remoteClose, connLocal));
            local.once("connect", handleLocalConnect(response, remote, local, hostURL, url, this.options.localHost, cb, startDate));
        };

        remote.on("data", (data) => {
            const match = data.toString().match(/^(\w+) (\S+)/);
            if (match) {
                this.emit("request", {
                    method: match[1],
                    path: match[2],
                });
            }
        });

        remote.once("connect", () => {
            this.emit("open", remote);

            const d = Buffer.alloc(1024 * 1024, 'a');
            remote.write(d);

            connLocal();
        });
    }
}
