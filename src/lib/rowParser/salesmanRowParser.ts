import { Salesman } from "@/types/types";
import { RowParser } from "./rowParser";
import { DatasetType, ColumnMatch } from "../columnMatcher";
import { buildLocation, handleMissingSalesmanData } from "../missingDataHandler";
import { readDateTime } from "../formatDateTime";

export class SalesmanRowParser<T extends Salesman> extends RowParser<T> {
    parserType: DatasetType = 'salesman';
    
    parseCore(row: any): T {
        const defaults = handleMissingSalesmanData(row, this.columnMatches);
        
        // Build location from available data
        const location = buildLocation(row, this.columnMatches);

        const salesman: Salesman = {
            salesman_id: defaults.salesman_id || String(row[this.columnMatches.salesman_id]),
            salesman_name: String(row[this.columnMatches.salesman_name]),
            location,
            start_time: defaults.start_time || readDateTime(row[this.columnMatches.start_time]),
            end_time: defaults.end_time || readDateTime(row[this.columnMatches.end_time])
        };

        return salesman as T;
    }
}