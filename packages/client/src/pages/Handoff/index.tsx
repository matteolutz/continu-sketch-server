import { Link, useParams } from "react-router";
import { useWebsocketContext } from "../../context/ws";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  getHandoffFileType,
  HANDOFF_FILE_LUT,
  type HandoffFileComponentRef,
  type HandoffFileInit,
} from "./file";

type DataChannelClientMessage = {
  type: "diff";
  diff: unknown;
};

type DataChannelObsidianMessage = {
  type: "file";
} & HandoffFileInit;

const HandoffPage = () => {
  const { id } = useParams();
  const ws = useWebsocketContext();

  const [file, setFile] = useState<HandoffFileInit | null>(null);
  const fileComponentRef = useRef<HandoffFileComponentRef>(null);

  const dcRef = useRef<RTCDataChannel>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const unlisten = ws.onHandoff(
      Number(id),
      (message) => {
        switch (message.type) {
          case "answer": {
            pc.setRemoteDescription(new RTCSessionDescription(message.answer));
            break;
          }
          case "candidate": {
            pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            break;
          }
        }
      },
      () => {
        console.log("closing pc");
        pc.close();
        navigate("/dashboard");
      },
    );

    pc.onicecandidate = (event) => {
      const candidate = event.candidate;
      if (!candidate) return;

      ws.send({
        type: "webrtc",
        handoffId: Number(id),
        message: {
          type: "candidate",
          candidate: candidate,
        },
      });
    };

    const dataChannel = pc.createDataChannel("handoff");

    dataChannel.addEventListener("open", (event) => {
      dcRef.current = dataChannel;

      dataChannel.addEventListener("message", (event) => {
        const message = JSON.parse(event.data) as DataChannelObsidianMessage;
        console.log("got message", message);

        switch (message.type) {
          case "file":
            setFile(message);
            break;
        }
      });

      console.log("data channel is open");
    });

    (async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      ws.send({
        type: "webrtc",
        handoffId: Number(id),
        message: {
          type: "offer",
          offer: offer,
        },
      });
    })();

    return () => {
      unlisten();

      pc.close(); // we have to manually call this, because unlisten will also remove the onClose listener
      ws.send({
        type: "close",
        handoffId: Number(id),
      });
    };
  }, [id]);

  const Component = file ? HANDOFF_FILE_LUT[getHandoffFileType(file)] : null;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {Component && (
        <Component
          ref={fileComponentRef}
          fileInit={file!}
          onChange={(diff) => {
            console.log("sending diff", diff);

            dcRef.current?.send(
              JSON.stringify({
                type: "diff",
                diff,
              } satisfies DataChannelClientMessage),
            );
          }}
        />
      )}
      Go to <Link to="/dashboard">Dashboard</Link>
    </div>
  );
};

export default HandoffPage;
