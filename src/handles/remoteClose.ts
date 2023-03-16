
import logger from "../logger";

import net from "net";
import tls from "tls";

export default function (local: net.Socket | tls.TLSSocket) {
    return () => {
      logger.debug("remote close");
      local.end();
    };
}