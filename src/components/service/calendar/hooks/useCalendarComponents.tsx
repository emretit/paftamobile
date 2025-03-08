
import React from "react";
import { CalendarToolbar } from "../components/CalendarToolbar";
import { CalendarEventComponent } from "../components/CalendarEventComponent";
import { TimeSlotWrapper } from "../components/TimeSlotWrapper";

export const useCalendarComponents = () => {
  const components = {
    event: (props: any) => <CalendarEventComponent event={props.event} />,
    timeSlotWrapper: ({ children }: any) => <TimeSlotWrapper>{children}</TimeSlotWrapper>,
    toolbar: (props: any) => {
      const { onNavigate, label } = props;
      return <CalendarToolbar onNavigate={onNavigate} label={label} />;
    },
  };

  return components;
};
