import { OptionValues } from "commander";
import { EventEmitter } from "events";

export default class PassageWay extends EventEmitter {
    private options: OptionValues;
    constructor(p_options: OptionValues) {
        super();
        this.options = p_options;
    }


}
