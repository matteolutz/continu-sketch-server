import { Request } from "express";
import * as ws from "ws";
import { WebRTCSignalingMessage } from "../../types/webrtc.js";

type WebSocketClientMessage =
  | {
      type: "ready";
      handoffId: number;
    }
  | {
      type: "webrtc";
      handoffId: number;
      message: WebRTCSignalingMessage;
    };

type WebSocketServerMessage = {
  type: "webrtc";
  handoffId: number;
  message: WebRTCSignalingMessage;
};

export class ObsidianWebsocketHandler {
  private static _instance: ObsidianWebsocketHandler | null = null;

  private readonly handoffSockets: Map<number, ws.WebSocket>;

  private constructor() {
    this.handoffSockets = new Map<number, ws.WebSocket>();
  }

  connected(ws: ws.WebSocket) {
    const handoffIds: number[] = [];

    ws.on("close", () => {
      for (const id of handoffIds) {
        this.handoffSockets.delete(id);
      }
    });

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString()) as WebSocketClientMessage;

      switch (message.type) {
        case "ready": {
          const handoffId = message.handoffId;

          handoffIds.push(handoffId);
          this.handoffSockets.set(handoffId, ws);

          // TODO: emit something to the frontend
          break;
        }
        case "webrtc": {
          // TODO: relay to client
          break;
        }
      }
    });
  }

  public static get instance() {
    if (this._instance === null) {
      this._instance = new ObsidianWebsocketHandler();
    }
    return this._instance;
  }
}

export const obsidianWs = async (ws: ws.WebSocket, req: Request) => {
  ObsidianWebsocketHandler.instance.connected(ws);
};
