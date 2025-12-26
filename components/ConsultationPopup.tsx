import { useEffect, useState } from "react";
import { PopupModal, useCalendlyEventListener } from "react-calendly";

interface ConsultationPopUpProps {
  isScheduleModalOpen: boolean;
  setIsScheduleModalOpen: (isOpen: boolean) => void;
}
export default function ConsultationPopUp({
  isScheduleModalOpen,
  setIsScheduleModalOpen,
}: ConsultationPopUpProps) {
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    // Wait until the DOM is ready to safely access the root element
    const el = document.body;
    if (el) {
      setRootElement(el);
    }
  }, []);

  useCalendlyEventListener({
    onEventScheduled: () => {
      setIsScheduleModalOpen(false);
    },
  });

  if (!rootElement) return;

  return (
    <PopupModal
      data-testId="calendly-modal"
      url="https://calendly.com/ayandakay67/30-min"
      onModalClose={() => setIsScheduleModalOpen(false)}
      open={isScheduleModalOpen}
      rootElement={rootElement}
    />
  );
}

