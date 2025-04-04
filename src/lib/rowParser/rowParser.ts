import { ColumnMatch, DatasetType, matchColumns, MatchResult } from "../columnMatcher";
import { Location } from '@/types/types';

export abstract class RowParser<T> {
    abstract parserType: DatasetType;
    columnMatches: ColumnMatch;

    parse(row: any[]): T {
        const matchResult = matchColumns(Object.keys(row), this.parserType);
        this.columnMatches = matchResult.columnMatches;
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