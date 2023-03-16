import colors from "colors";

export var CAN_DEBUG = false;

export default class {
    private static readonly prefix = class {
        public static info: String = colors.cyan.bold("info");
        public static debug: String = colors.red.bold("debug");
    };

    public static info(msg: String) {
        console.log(`[${this.prefix.info}]: ${msg}`);
    }
    public static debug(msg: String) {
        if (CAN_DEBUG) console.log(`[${this.prefix.debug}]: ${msg}`);
    }
}
