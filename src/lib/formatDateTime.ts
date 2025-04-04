import { parse as parseDate, parseISO, isValid, format } from 'date-fns';


export function readDateTime(value: any): string {
  console.debug('[FileParser] Formatting date/time value:', value);

  if (!value) {
    console.error('[FileParser] Missing date/time value');
    throw new Error('Date/time value is missing');
  }

  try {
    // Handle different date formats
    let parsedDate: Date;

    // If value is already a Date object
    if (value instanceof Date) {
      parsedDate = value;
    }

    // If value is a number (timestamp)
    else if (typeof value === 'number') {
      parsedDate = new Date(value);
    }

    // If value is a string
    else {
      const dateStr = String(value).trim()

      // Try parsing ISO 8601 format
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(dateStr)) {
        parsedDate = parseISO(dateStr);
      } 
      else {
        const normalisedDate = dateStr.replace(/[-./]/g, ' ');
  
        // Try ISO format first
        if (/^\d{4} \d{2} \d{2}/.test(normalisedDate)) {
          parsedDate = new Date(normalisedDate);
        }
  
        else {
          parsedDate = parseDate(normalisedDate, 'dd MM yyyy HH:mm', new Date());
        }
      }
    }

    // Validate the parsed date
    if (!isValid(parsedDate)) {
      console.error('[FileParser] Invalid date:', {
        input: value,
        parsed: parsedDate
      });
      throw new Error('Invalid date');
    }

    const formatted = format(parsedDate, 'yyyy-MM-dd HH:mm:ss');
    console.debug('[FileParser] Date formatted successfully:', {
      input: value,
      parsed: parsedDate,
      formatted
    });

    return formatted;
  } catch (error) {
    console.error('[FileParser] Error formatting date/time:', {
      value,
      error
    });
    throw new Error('Invalid date/time format');
  }
}

// Format date for display
export const formatDisplayDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    dateString = readDateTime(dateString)
    const date = parseDate(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
    if (!isValid(date)) return '';
    return format(date, 'dd MMMM yyyy');
  } catch (error) {
    console.error('[FileParser] Error formatting display date:', {
      dateString,
      error
    });
    return '';
  }
};

// Format time for display
export const formatDisplayTime = (dateString: string): string => {
  if (!dateString) return '';
  try {
    dateString = readDateTime(dateString)
    const date = parseDate(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
    if (!isValid(date)) return '';
    return format(date, 'HH:mm');
  } catch (error) {
    console.error('[FileParser] Error formatting display time:', {
      dateString,
      error
    });
    return '';
  }
};
