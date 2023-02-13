import { StatsInfo } from "./interface";
import { version } from "../package.json";

import colors from "colors";

import Table from "cli-table";


export default (stats: StatsInfo) => {
    var table = new Table({
        chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
               , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
               , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
               , 'right': '' , 'right-mid': '' , 'middle': ' ' },
        style: { 'padding-left': 0, 'padding-right': 0 }
    });

    table.push(
        [`  [${'Identifier'.blue}]`.bold, stats.id.green.bold],
        [`  [${'PW version'.blue}]`.bold, version.magenta.bold],
        [`  [${'Conn. time'.blue}]`.bold, `${stats.time}ms`.green.bold],
        [`  [${'Forwarding'.blue}]`.bold, `${stats.hostURL.yellow.bold} ${'=>'.magenta.bold} ${stats.localURL.green.bold}`]
    );

    console.log("")
    console.log(table.toString())

}
