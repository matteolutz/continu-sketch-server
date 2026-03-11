import type { Handoff, User } from "@prisma/client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";
import useWebSocket from "react-use-websocket";
import { getWsUrl } from "../utils/api";
import { useNavigate } from "react-router";
import type { WebRTCSignalingMessage } from "../types/webrtc";

type ClientWebsocketClientMessage =
  | {
      type: "webrtc";
      handoffId: number;
      message: WebRTCSignalingMessage;
    }
  | {
      type: "close";
      handoffId: number;
    };

type ClientWebsocketServerMessage =
  | {
      type: "handoff-created";
      handoff: Handoff;
    }
  | {
      type: "webrtc";
      handoffId: number;
      message: WebRTCSignalingMessage;
    }
  | {
      type: "closed";
      handoffId: number;
    };

export type WebSocketContextType = {
  send: (message: ClientWebsocketClientMessage) => void;

  onHandoff: (
    handoffId: number,
    cb: (message: WebRTCSignalingMessage) => void,
    onClose: () => void,
  ) => () => void;
};

export const WebSocketContext = createContext<WebSocketContextType | null>(
  null,
);

export const WebSocketProvider: FC<PropsWithChildren & { user: User }> = ({
  children,
}) => {
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(getWsUrl("ws"));

  const [webRtcListeners, setWebRtcListeners] = useState<
    Record<
      number,
      { cb: (message: WebRTCSignalingMessage) => void; onClose: () => void }
    >
  >({});

  const navigate = useNavigate();

  useEffect(() => {
    if (!lastJsonMessage) return;
    const message = lastJsonMessage as ClientWebsocketServerMessage;

    switch (message.type) {
      case "handoff-created":
        navigate(`/handoff/${message.handoff.id}`);
        break;
      case "webrtc":
        const handoffId = message.handoffId;
        const cb = webRtcListeners[handoffId];
        if (cb) cb.cb(message.message);
        break;
      case "closed":
        const handoffIdClosed = message.handoffId;
        const onClose = webRtcListeners[handoffIdClosed]?.onClose;
        if (onClose) onClose();
        break;
    }
  }, [lastJsonMessage, webRtcListeners]);

  const context: WebSocketContextType = {
    send: sendJsonMessage,
    onHandoff: (handoffId, cb, onClose) => {
      setWebRtcListeners((prev) => ({
        ...prev,
        [handoffId]: { cb, onClose },
      }));

      return () => {
        setWebRtcListeners((prev) => {
          const newListeners = { ...prev };
          delete newListeners[handoffId];
          return newListeners;
        });
      };
    },
  };

  return (
    <WebSocketContext.Provider value={context}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebsocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebsocketContext must be used within a WebSocketProvider",
    );
  }

  return context;
};
