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
        [`  ${'Public URL:'.blue}`.bold, stats.hostURL.yellow.bold],
        [`  ${'Local URL:'.blue}`.bold, stats.localURL.green.bold],
        [""],
        [`  ${'Tunnel status: '.blue}`.bold, `Live`.green.bold],
        [`  ${'Bytes received:'.blue}`.bold, `${stats.recieve.toFixed(2)} KB/s`.green.bold],
        [`  ${'Bytes sent:'.blue}`.bold, `${stats.transmit.toFixed(2)} KB/s`.green.bold],
    );

    console.log("")
    console.log(table.toString())

}
