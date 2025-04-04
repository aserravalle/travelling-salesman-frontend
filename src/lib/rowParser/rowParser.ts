import { ColumnMatch, DatasetType, matchColumns } from "../columnMatcher";
import { Location } from '@/types/types';
import { resetIdCounters } from './missingDataHandler';

export abstract class RowParser<T> {

    constructor(columnMatches: ColumnMatch) {
        this.columnMatches = columnMatches;
        resetIdCounters();
    }

    abstract parserType: DatasetType;
    columnMatches: ColumnMatch;

    parse(row: any[]): T {
        let parsedRow = this.parseCore(row)
        this.validateRequiredFields(parsedRow);
        return parsedRow;
    }

    abstract parseCore(row: any): T;
    
    validateRequiredFields<T>(obj: T): void | Error {
        for (const [key, value] of Object.entries(obj)) {
            if (key === 'location') {
                const location = value as Location;
                if (!location.address && (!location.latitude || !location.longitude)) {
                throw new Error('Location must have either an address or valid coordinates');
            }
                continue;
            }
        }
    }
}


