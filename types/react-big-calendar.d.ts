declare module "react-big-calendar" {
  import { ComponentType } from "react";

  export interface Event {
    id?: string | number;
    title?: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
  }

  export interface CalendarProps {
    localizer: any;
    events: Event[];
    startAccessor?: string | ((event: Event) => Date);
    endAccessor?: string | ((event: Event) => Date);
    titleAccessor?: string | ((event: Event) => string);
    views?: any;
    defaultView?: any;
    popup?: boolean;
    style?: any;
    onSelectEvent?: (event: Event) => void;
  }

  export const Calendar: ComponentType<CalendarProps>;

  export const Views: {
    MONTH: string;
    WEEK: string;
    WORK_WEEK: string;
    DAY: string;
    AGENDA: string;
  };

  export function dateFnsLocalizer(config: {
    format: (date: Date, formatStr: string, options?: any) => string;
    parse: (value: string, formatStr: string, baseDate: Date, options?: any) => Date;
    startOfWeek: (date: Date) => Date;
    getDay: (date: Date) => number;
    locales: Record<string, any>;
  }): any;
}
