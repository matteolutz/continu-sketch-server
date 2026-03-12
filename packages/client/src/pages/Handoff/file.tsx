import type { FC, Ref } from "react";
import ExcalidrawFileComponent from "./types/excalidraw";

export type HandoffFileInit = {
  fileName: string;
  fileType: string;
  fileData: string;
};

export type HandoffFileType = "md" | "excalidraw" | "unknown";
export const getHandoffFileType = (file: HandoffFileInit): HandoffFileType => {
  if (file.fileType === "md") {
    if (file.fileName.endsWith(".excalidraw")) {
      // this is how files from the Excalidraw plugin are stored
      return "excalidraw";
    }

    return "md";
  }

  return "unknown";
};

export type HandoffFileChangeCallback = (diff: unknown) => void;

export type HandoffFileComponentRef = {
  getCurrentDiff: () => unknown | null;
};

export type HandoffFileComponent = FC<{
  fileInit: HandoffFileInit;
  onChange: HandoffFileChangeCallback;
  ref: Ref<HandoffFileComponentRef>;
}>;

export const HANDOFF_FILE_LUT: Record<HandoffFileType, HandoffFileComponent> = {
  excalidraw: ExcalidrawFileComponent,
  md: () => <div>TODO </div>,
  unknown: () => <div>Unknown</div>,
};
