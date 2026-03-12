import { ExcalidrawFormatStrategy } from "continu-sketch-diff";
import type { HandoffFileComponent } from "../file";
import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const strat = new ExcalidrawFormatStrategy();

const ExcalidrawFileComponent: HandoffFileComponent = ({
  fileInit,
  onChange,
  ref,
}) => {
  const initialData = useMemo(
    () => strat.decode(fileInit.fileData),
    [fileInit.fileData],
  );

  const prevFileRef = useRef(initialData);
  const fileRef = useRef(initialData);

  const didChangeRef = useRef(false);

  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI>(null);

  const getDiff = () => {
    const diff = strat.differ.diff(prevFileRef.current, fileRef.current);
    return diff;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!didChangeRef.current) return;
      if (!excalidrawApiRef.current) return;

      const diff = getDiff();
      if (diff.type !== "equal") onChange(diff.patch);

      didChangeRef.current = false;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useImperativeHandle(ref, () => ({
    getCurrentDiff: () => {
      const diff = getDiff();

      if (diff.type === "equal") return null;
      return diff.patch;
    },
  }));

  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      <Excalidraw
        onPointerUpdate={() => (didChangeRef.current = true)}
        excalidrawAPI={(api) => (excalidrawApiRef.current = api)}
        onChange={(elements, _, files) => {
          fileRef.current.excalidraw = {
            ...fileRef.current.excalidraw,
            elements,
            files,
          };
        }}
        initialData={initialData.excalidraw}
      />
    </div>
  );
};

export default ExcalidrawFileComponent;
