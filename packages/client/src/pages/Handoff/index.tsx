import { Link, useParams } from "react-router";
import { useWebsocketContext } from "../../context/ws";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const HandoffPage = () => {
  const { id } = useParams();
  const ws = useWebsocketContext();

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
    dataChannel.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
    });
    dataChannel.addEventListener("open", (event) => {
      console.log("data channel is open, sending hello");
      dataChannel.send("hello");
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

  return (
    <div>
      Go to <Link to="/dashboard">Dashboard</Link>
    </div>
  );
};

export default HandoffPage;
