import logger from "../logger";

import net from "net";
import tls from "tls";

export default function (
    remote: net.Socket,
    local: net.Socket | tls.TLSSocket,
    remoteClose: () => void,
    connLocal: () => void
) {
    return function (err: any) {
        logger.debug(`local error ${err.message}`);
        local.end();
        remote.removeListener("close", remoteClose);

        const isConnectionError =
            err.code === "ECONNREFUSED" || err.code === "ECONNRESET";
        if (isConnectionError) {
            setTimeout(connLocal, 1000);
        } else {
            remote.end();
        }
    };
}
