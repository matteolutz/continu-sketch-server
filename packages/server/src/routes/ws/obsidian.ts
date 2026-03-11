import { type Request } from "express";
import * as ws from "ws";
import { type WebRTCSignalingMessage } from "../../types/webrtc.js";
import { ClientWebsocketHandler } from "./client.js";
import { prisma } from "../../db.js";
import { HandoffState } from "@prisma/client";

type ObsidianWebsocketClientMessage =
  | {
      type: "ready";
      handoffId: number;
    }
  | {
      type: "close"; // request to close the handoff
      handoffId: number;
    }
  | {
      type: "webrtc";
      handoffId: number;
      message: WebRTCSignalingMessage;
    };

type ObsidianWebsocketServerMessage =
  | {
      type: "webrtc";
      handoffId: number;
      message: WebRTCSignalingMessage;
    }
  | {
      type: "closed"; // the handoff has been closed
      handoffId: number;
    };

export class ObsidianWebsocketHandler {
  private static _instance: ObsidianWebsocketHandler | null = null;

  private readonly handoffSockets: Map<number, ws.WebSocket>;

  private constructor() {
    this.handoffSockets = new Map<number, ws.WebSocket>();
  }

  connected(userId: number, ws: ws.WebSocket) {
    const handoffIds: number[] = [];

    console.log("obsidian ws connected for user id", userId);

    ws.on("message", async (data) => {
      const message = JSON.parse(
        data.toString(),
      ) as ObsidianWebsocketClientMessage;

      switch (message.type) {
        case "ready": {
          const handoffId = message.handoffId;

          const handoff = await prisma.handoff.update({
            where: { id: handoffId, userId },
            data: { state: HandoffState.CONNECTED },
          });

          handoffIds.push(handoffId);
          this.handoffSockets.set(handoffId, ws);

          ClientWebsocketHandler.instace.sendTo(userId, {
            type: "handoff-created",
            handoff,
          });

          // TODO: emit something to the frontend
          break;
        }
        case "close": {
          const handoffId = message.handoffId;

          const handoff = await prisma.handoff.update({
            where: { id: handoffId, userId },
            data: { state: HandoffState.DONE },
          });
          if (!handoff) {
            return;
          }

          this.sendToHandoff(handoffId, {
            type: "closed",
            handoffId: handoffId,
          });
          ClientWebsocketHandler.instace.sendTo(userId, {
            type: "closed",
            handoffId,
          });

          this.handoffSockets.delete(handoffId);

          break;
        }
        case "webrtc": {
          const handoff = await prisma.handoff.findUnique({
            where: { id: message.handoffId, userId },
          });
          if (!handoff) {
            return;
          }

          ClientWebsocketHandler.instace.sendTo(userId, {
            type: "webrtc",
            handoffId: handoff.id,
            message: message.message,
          });

          break;
        }
      }
    });

    ws.on("close", async () => {
      for (const id of handoffIds) {
        this.handoffSockets.delete(id);

        await prisma.handoff
          .update({
            where: { id },
            data: { state: HandoffState.DONE },
          })
          .catch(() => {});
      }
    });
  }

  sendToHandoff(handoffId: number, message: ObsidianWebsocketServerMessage) {
    const handoffSocket = this.handoffSockets.get(handoffId);
    if (!handoffSocket) return;

    handoffSocket.send(JSON.stringify(message));
  }

  public static get instance() {
    if (this._instance === null) {
      this._instance = new ObsidianWebsocketHandler();
    }
    return this._instance;
  }
}

export const obsidianWs = async (ws: ws.WebSocket, req: Request) => {
  const userId = req.user!.id;

  ObsidianWebsocketHandler.instance.connected(userId, ws);
};
