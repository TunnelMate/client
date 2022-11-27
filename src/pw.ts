import { OptionValues } from "commander";
import { EventEmitter } from "events";

import net from "net";
import tls from "tls";
import axios from "axios";

import consts from "./consts";
import logger from "./logger";

import { APIResponse, StatsInfo } from "./interface";
import { HeaderHostTransformer } from "./transformer";

export default class PassageWay extends EventEmitter {
    private options: OptionValues;

    constructor(p_options: OptionValues) {
        super();
        this.options = p_options;
    }

    public getNewClient(cb: (APIResponse) => void) {
        const scheme = this.options.secure ? "https" : "http";

        // TODO: dynamic port
        const url =
            `${scheme}://` +
            this.options.host +
            `:${consts.SERVER_PORT}?create`;

        axios
            .get(url)
            .then(function (response) {
                const res: APIResponse = {
                    id: response.data.id,
                    port: response.data.port,
                    max_conn_count: response.data.max_conn_count,
                };

                cb(res);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            });
    }

    public connect(response: APIResponse, cb: (stats: StatsInfo) => void) {
        const remote = net.connect(response.port, this.options.host, () => {});
        const scheme = this.options.secure ? "https" : "http";
        const allowInvalidCert = false; // TODO

        const url = `${scheme}://${this.options.host}:${consts.SERVER_PORT}`;

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
                ? tls.connect(
                    this.options.port,
                    this.options.localHost,
                  )
                : net.connect(this.options.port, this.options.localHost);

            const remoteClose = () => {
                logger.debug("remote close");
                local.end();
            };

            remote.once("close", remoteClose);

            local.once("error", (err: any) => {
                logger.debug(`local error ${err.message}`);
                local.end();

                remote.removeListener("close", remoteClose);

                if (err.code !== "ECONNREFUSED" && err.code !== "ECONNRESET") {
                    return remote.end();
                }

                setTimeout(connLocal, 1000);
            });

            local.once("connect", () => {
                const hostURL = `${scheme}://${response.id}.${this.options.host}:${this.options.port}/`;
                logger.debug(`Connected to ${hostURL}`)
                remote.resume();

                let stream: any = remote;

                if (this.options.localHost) {
                    logger.debug(`transform Host header to ${this.options.localHost}`);
                    stream = remote.pipe(
                        new HeaderHostTransformer({ host: this.options.localHost })
                    );
                }

                stream.pipe(local).pipe(remote);

                local.once("close", (hadErro: any) => {
                    logger.debug(`local connection closed [${hadErro}]`);
                });

                cb({ id: response.id, hostURL: hostURL, localURL: url, pw: this });

            });
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
            connLocal();
        });
    }
}
