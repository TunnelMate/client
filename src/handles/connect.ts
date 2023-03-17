import logger from "../logger";
import { HeaderHostTransformer } from "../transformer";

import net from "net";
import tls from "tls";
import { StatsInfo } from "../interface";

export default function (
    response: any,
    remote: net.Socket,
    local: net.Socket | tls.TLSSocket,
    hostURL: string,
    url: string,
    localHost: number,
    cb: (s: StatsInfo) => void,
    startDate: Date
) {
    return () => {
        let stream: any = remote;

        logger.debug(`Connected to ${hostURL}`);
        remote.resume();

        if (localHost) {
            logger.debug(`transform Host header to ${localHost}`);
            stream = remote.pipe(
                new HeaderHostTransformer({ host: localHost })
            );
        }

        // stream.pipe(local).pipe(remote);
        local.once("close", (hadErro: boolean) => {
            logger.debug(`local connection closed [had error: ${hadErro}]`);
        });

        var endDate = new Date();
        var elapsedTime = endDate.getTime() - startDate.getTime();

        const kilobytesRead = remote.bytesRead / 1024;
        const speed = kilobytesRead / (elapsedTime / 1000) / 1024;

        const kilobytesWrite = remote.bytesWritten / 1024;
        const speedW = kilobytesWrite / (elapsedTime / 1000) / 1024;

        cb({
            id: response.id,
            hostURL: hostURL,
            localURL: url,
            pw: this,
            time: elapsedTime,
            recieve: speed,
            transmit: speedW,
        });
    };
}
