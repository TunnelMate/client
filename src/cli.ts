import { Command, Option } from "commander";

import TunnelMate from "./mate";
import consts from "./consts";
import { APIResponse, StatsInfo } from "./interface";
import { CAN_DEBUG } from "./logger";
import showStats from "./stats";
import cliSpinners from "cli-spinners";
import logUpdate from "log-update";

const program = new Command();
program
    .version(consts.VERSION)
    .requiredOption("-p, --port <port>", "Internal HTTP server port")
    .addOption(
        new Option("-h, --host <host>", "Upstream server providing forwarding")
            .default(consts.DEFAULT_HOST)
            .env("PW_HOST")
    )
    .addOption(
        new Option(
            "-s, --secure",
            "Wether to use a secure conection or not"
        ).default(consts.SECURE_CONN)
    )
    .addOption(
        new Option(
            "-d, --debbug",
            "Add verbosity for debugging purposes"
        ).default(false)
    )
    .addOption(
        new Option("--local-host", "Local host to listen").default(
            consts.LOCAL_HOST
        )
    )
    .addOption(
        new Option("--local-https", "Use https for the local server").default(
            consts.LOCAL_HTTPS
        )
    );

const main = (): void => {
    program.parse(process.argv);
    const options = program.opts();

    // @ts-ignore
    CAN_DEBUG = options.debbug;

    let i = 0;
    let spinnerInterval = setInterval(() => {
        const { frames } = cliSpinners.bouncingBar;
        console.log(
            frames[(i = ++i % frames.length)] + " Connecting to server"
        );
    }, cliSpinners.bouncingBar.interval);

    const pw = new TunnelMate(options);
    pw.getNewClient((response: APIResponse) => {
        pw.connect(response, (stats: StatsInfo) => {
            clearInterval(spinnerInterval);
            showStats(stats);
        });
    });
};

main();
