import { Command, Option } from "commander";
import PassageWay from "./pw";
import consts from "./consts";
import { APIResponse } from "./interface";
import { CAN_DEBUG } from "./logger";

const program = new Command();
program
    .version(consts.VERSION)
    .requiredOption('-p, --port <port>', 'Internal HTTP server port')
    .addOption(new Option('-h, --host <host>', 'Upstream server providing forwarding').default(consts.DEFAULT_HOST).env("PW_HOST"))
    .addOption(new Option('-s, --secure', 'Wether to use a secure conection or not').default(consts.SECURE_CONN))
    .addOption(new Option('-d, --debbug', 'Add verbosity for debugging purposes').default(false))
    .addOption(new Option('--local-host', 'Local host to listen').default(consts.LOCAL_HOST))
    .addOption(new Option('--local-https', 'Use https for the local server').default(consts.LOCAL_HTTPS))

const main = (): void => {
    program.parse(process.argv);
    const options = program.opts();

    // @ts-ignore
    CAN_DEBUG = options.debbug;

    const pw = new PassageWay(options);
    pw.getNewClient((response: APIResponse) => {
        pw.connect(response);
    })
}

main()
