import { describe, it, expect } from 'vitest';
import { JobRowParser } from '../jobRowParser';

describe('JobRowParser.parseTimesFromDescription', () => {
    it('should parse both entry and exit times from description', () => {
        const description = 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: 08:40     Entrada:  Fecha: 28-03-2025 14:00  Huéspedes:  2  Opciones:  -  Indicaciones:';
        const result = JobRowParser.parseTimesFromDescription(description);

        expect(result.entry_time).toBe('28-03-2025 08:40');
        expect(result.exit_time).toBe('28-03-2025 14:00');
    });

    it('should parse entry time when exit time is missing', () => {
        const description = 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: 08:30     Entrada:  Fecha: -  Huéspedes:  2  Opciones:  -  Indicaciones:';
        const result = JobRowParser.parseTimesFromDescription(description);

        const today = new Date().toISOString().split('T')[0];
        expect(result.entry_time).toBe(`${today} 08:30`);
        expect(result.exit_time).toBeUndefined();
    });

    it('should parse exit time when entry time is missing', () => {
        const description = 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: -     Entrada:  Fecha: 28-03-2025 14:00  Huéspedes:  2  Opciones:  -  Indicaciones:';
        const result = JobRowParser.parseTimesFromDescription(description);

        expect(result.entry_time).toBeUndefined();
        expect(result.exit_time).toBe('28-03-2025 14:00');
    });

    it('should return undefined for both times when description has no time information', () => {
        const description = 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: -     Entrada:  Fecha: -  Huéspedes:  2  Opciones:  -  Indicaciones:';
        const result = JobRowParser.parseTimesFromDescription(description);

        expect(result.entry_time).toBeUndefined();
        expect(result.exit_time).toBeUndefined();
    });

    it('should return undefined for both times when description is empty', () => {
        const result = JobRowParser.parseTimesFromDescription('');

        expect(result.entry_time).toBeUndefined();
        expect(result.exit_time).toBeUndefined();
    });

    it('should handle description with invalid time formats gracefully', () => {
        const description = 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: invalid     Entrada:  Fecha: invalid  Huéspedes:  2  Opciones:  -  Indicaciones:';
        const result = JobRowParser.parseTimesFromDescription(description);

        expect(result.entry_time).toBeUndefined();
        expect(result.exit_time).toBeUndefined();
    });
});



describe('parseTimesFromDescription', () => {
  it('should parse entry and exit times from description', () => {
    const description = 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: 08:40     Entrada:  Fecha: 28-03-2025 14:00  Huéspedes:  2  Opciones:  -  Indicaciones:';
    
    const result = JobRowParser.parseTimesFromDescription(description);
    
    expect(result.entry_time).toBe('28-03-2025 08:40');
    expect(result.exit_time).toBe('28-03-2025 14:00');
  });

  it('should parse entry and exit times from description with tomorrows exit time', () => {
    const description = 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: 08:30     Entrada:  Fecha: 28-03-2025 00:15  Huéspedes:  2  Opciones:  -  Indicaciones:';
    
    const result = JobRowParser.parseTimesFromDescription(description);
    
    expect(result.entry_time).toBe('28-03-2025 08:30');
    expect(result.exit_time).toBe('28-03-2025 00:15'); // TODO: JobRowParser.parseTimesFromDescription should set this to midnight
  });

  it('should handle description with only exit time', () => {
    const description = 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: 11:00     Entrada:  Fecha: -  Huéspedes:  -  Opciones:  -  Indicaciones:  LARGA ESTANCIA 25 NOCHES';
    
    const result = JobRowParser.parseTimesFromDescription(description);
    const today = new Date().toISOString().split('T')[0];
    
    expect(result.entry_time).toBe(`${today} 11:00`);
    expect(result.exit_time).toBeUndefined();
  });

  it('should handle description with only entry time', () => {
    const description = 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: -     Entrada:  Fecha: 28-03-2025 14:00  Huéspedes:  2  Opciones:  -  Indicaciones:';
    
    const result = JobRowParser.parseTimesFromDescription(description);
    
    expect(result.entry_time).toBeUndefined();
    expect(result.exit_time).toBe('28-03-2025 14:00');
  });

  it('should handle description with no time information', () => {
    const description = 'Enlace externo:  Enlace:  -      Salida:  Hora de salida: -     Entrada:  Fecha: -  Huéspedes:  2  Opciones:  -  Indicaciones:';
    
    const result = JobRowParser.parseTimesFromDescription(description);
    
    expect(result.entry_time).toBeUndefined();
    expect(result.exit_time).toBeUndefined();
  });

  it('should handle empty description', () => {
    const result = JobRowParser.parseTimesFromDescription('');
    
    expect(result.entry_time).toBeUndefined();
    expect(result.exit_time).toBeUndefined();
  });
});


describe('Duration Parsing', () => {
    it('should parse numeric duration correctly', () => {
      expect(JobRowParser.parseDuration(120)).toBe(120);
    });
  
    it('should parse string numeric duration correctly', () => {
      expect(JobRowParser.parseDuration('120')).toBe(120);
    });
  
    it('should parse hours and minutes format correctly', () => {
      expect(JobRowParser.parseDuration('2h:00m')).toBe(120);
    });
  
    it('should parse hours and minutes with non-zero minutes correctly', () => {
      expect(JobRowParser.parseDuration('1h:30m')).toBe(90);
    });
  
    it('should handle invalid duration format', () => {
      expect(() => JobRowParser.parseDuration('invalid')).toThrow('Invalid duration format');
    });
  
    it('should handle empty duration', () => {
      expect(() => JobRowParser.parseDuration('')).toThrow('Duration value is null or undefined');
    });
  
    it('should handle null duration', () => {
      expect(() => JobRowParser.parseDuration(null)).toThrow('Duration value is null or undefined');
    });
  
    it('should handle undefined duration', () => {
      expect(() => JobRowParser.parseDuration(undefined)).toThrow('Duration value is null or undefined');
    });
  });