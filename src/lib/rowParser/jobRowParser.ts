import { Job } from "@/types/types";
import { DatasetType } from "../columnMatcher";
import { RowParser } from "./rowParser";
import { buildLocation, handleMissingJobData } from "../missingDataHandler";
import { readDateTime } from "../formatDateTime";

export class JobRowParser<T extends Job> extends RowParser<T> {
    parserType: DatasetType = 'job';
    
    parseCore(row: any): T {
        const defaults = handleMissingJobData(row, this.columnMatches);
        const location = buildLocation(row, this.columnMatches);
        let date = defaults.date || readDateTime(row[this.columnMatches.date]);

        let { entry_time, exit_time } = this.getEntryAndExitTime(
            date,
            defaults.entry_time || readDateTime(row[this.columnMatches.entry_time]),
            defaults.exit_time || readDateTime(row[this.columnMatches.exit_time]),
            row[this.columnMatches.description],
        );
    
        const durationValue = row[this.columnMatches.duration_mins];
    
        const job: Job = {
          job_id: defaults.job_id || String(row[this.columnMatches.job_id]),
          client_name: String(row[this.columnMatches.client_name]),
          date,
          location,
          duration_mins: defaults.duration_mins || JobRowParser.parseDuration(durationValue),
          entry_time,
          exit_time
        };
    
        return job as T;
    }
    
    getEntryAndExitTime(date: string, entry_time: string, exit_time: string, description: string): { entry_time: string; exit_time: string } {
        if (description) {
          const timesFromDesc = JobRowParser.parseTimesFromDescription(description);
          if (timesFromDesc.entry_time) entry_time = readDateTime(timesFromDesc.entry_time);
          if (timesFromDesc.exit_time) exit_time = readDateTime(timesFromDesc.exit_time);
        }
    
        // Ensure entry_time uses the same date as the job
        const newDate = date.split(' ')[0];
        if (entry_time) {
          const time = entry_time.split(' ')[1];
          entry_time = `${newDate} ${time}`;
        }
        if (exit_time) {
          const time = exit_time.split(' ')[1];
          exit_time = `${newDate} ${time}`;
    
          // If exit is before entry, set exit to end of day
          if (entry_time && exit_time < entry_time) {
            exit_time = `${newDate} 23:00:00`; // TODO set to default
          }
        }
        return { entry_time, exit_time };
    }
    
    static parseTimesFromDescription(description: string): { entry_time?: string; exit_time?: string } {
        const result: { entry_time?: string; exit_time?: string } = {};
        
        const exitMatch = description.match(/Entrada:\s*Fecha:\s*(\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2})/);
        if (exitMatch) {
          result.exit_time = exitMatch[1];
        }
      
        const entryMatch = description.match(/Salida:\s*Hora de salida:\s*(\d{2}:\d{2})/);
        if (entryMatch) {
          const date = exitMatch ? exitMatch[1].split(' ')[0] : new Date().toISOString().split('T')[0];
          result.entry_time = `${date} ${entryMatch[1]}`;
        }
        
        return result;
    }

    static parseDuration(durationValue): number {
        if (!durationValue) {
            throw new Error(`Duration value is null or undefined`);
        }
        
        // If it's already a number, return it
        if (typeof durationValue === 'number') {
            return durationValue;
        }
        
        // If it's a string that's just a number, parse it
        if (/^\d+$/.test(durationValue)) {
            return parseInt(durationValue);
        }
        
        // Handle time format (e.g., "2h:00m" or "1h:30m")
        const timeMatch = durationValue.match(/(\d+)h:(\d+)m/);
        if (timeMatch) {
            const hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            return (hours * 60) + minutes;
        }
        
        // If we can't parse it, throw an error
        throw new Error(`Invalid duration format: ${durationValue}`);
    }
}