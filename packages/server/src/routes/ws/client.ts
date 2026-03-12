import { HandoffState, type Handoff } from "@prisma/client";
import { type Request } from "express";
import * as ws from "ws";
import type { WebRTCSignalingMessage } from "../../types/webrtc.js";
import { prisma } from "../../db.js";
import { ObsidianWebsocketHandler } from "./obsidian.js";

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

export class ClientWebsocketHandler {
  private static _instance: ClientWebsocketHandler | undefined;

  private readonly userSockets: Map<number, ws.WebSocket>;

  private constructor() {
    this.userSockets = new Map<number, ws.WebSocket>();
  }

  connected(userId: number, ws: ws.WebSocket) {
    if (this.userSockets.has(userId)) {
      // only one connection allowed
      ws.close();
      return;
    }

    this.userSockets.set(userId, ws);

    ws.on("message", async (data) => {
      const message = JSON.parse(
        data.toString(),
      ) as ClientWebsocketClientMessage;

      switch (message.type) {
        case "close": {
          const handoff = await prisma.handoff.update({
            where: { id: message.handoffId, userId },
            data: { state: HandoffState.DONE },
          });

          this.sendTo(userId, {
            type: "closed",
            handoffId: handoff.id,
          });
          ObsidianWebsocketHandler.instance.sendToHandoff(handoff.id, {
            type: "closed",
            handoffId: handoff.id,
          });

          break;
        }
        case "webrtc": {
          const handoff = await prisma.handoff.findUnique({
            where: { id: message.handoffId, userId },
          });
          if (!handoff) {
            return;
          }

          ObsidianWebsocketHandler.instance.sendToHandoff(handoff.id, {
            type: "webrtc",
            handoffId: handoff.id,
            message: message.message,
          });

          break;
        }
      }
    });

    ws.on("close", () => {
      this.userSockets.delete(userId);
    });
  }

  sendTo(userId: number, message: ClientWebsocketServerMessage) {
    const userSocket = this.userSockets.get(userId);
    if (!userSocket) return;

    userSocket.send(JSON.stringify(message));
  }

  static get instace(): ClientWebsocketHandler {
    if (!this._instance) {
      this._instance = new ClientWebsocketHandler();
    }

    return this._instance;
  }
}

export const clientWs = async (ws: ws.WebSocket, req: Request) => {
  if (typeof req.session.userId === "undefined") {
    ws.close(3000, "Unauthorized"); // 3000 = HTTP 401
    return;
  }

  ClientWebsocketHandler.instace.connected(req.session.userId, ws);
};
