import logger from "../logger";
import { HeaderHostTransformer } from "../transformer";

import net from "net";
import tls from "tls";
import { StatsInfo } from "../interface";

export default function (scheme: string, response: any, remote: net.Socket, local: net.Socket | tls.TLSSocket, hostURL: string, url: string, localHost: number, cb: (StatsInfo) => void, startDate: Date) {
    return () => {
        let stream: any = remote;

        logger.debug(`Connected to ${hostURL}`);
        remote.resume();

        if (localHost) {
            logger.debug(`transform Host header to ${localHost}`);
            stream = remote.pipe(new HeaderHostTransformer({ host: localHost }));
        }

        stream.pipe(local).pipe(remote);

        local.once("close", (hadErro: any) => {
            logger.debug(`local connection closed [${hadErro}]`);
        });

        var endDate = new Date();
        var seconds = endDate.getTime() - startDate.getTime();
    
        cb({ id: response.id, hostURL: hostURL, localURL: url, pw: this, time: seconds });
    };
}