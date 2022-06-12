import { Command, Option } from "commander";
import consts from "./consts";

const program = new Command();
program
    .version(consts.VERSION)
    .requiredOption('-p, --port <port>', 'Internal HTTP server port')
    .addOption(new Option('-h, --host <host>', 'Upstream server providing forwarding').default(consts.DEFAULT_HOST).env("PORT"))

const main = (): void => {
    program.parse(process.argv);
    const options = program.opts();

    

}

main()
