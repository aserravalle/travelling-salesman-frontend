import { MatchResult } from "../columnMatcher";
import { JobRowParser } from "./jobRowParser";
import { RowParser } from "./rowParser";
import { SalesmanRowParser } from "./salesmanRowParser";


export class RowParserFactory {
    static New(type: string, matchResult: MatchResult): RowParser<any> {
        switch (type) {
            case 'job':
                return new JobRowParser(matchResult.columnMatches);
            case 'salesman':
                return new SalesmanRowParser(matchResult.columnMatches);
            default:
                throw new Error('Invalid dataset type: ' + type);
        }
    }
}
