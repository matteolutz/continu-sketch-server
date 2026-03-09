export type WebRTCSignalingMessage =
  | {
      type: "offer";
      offer: RTCSessionDescriptionInit;
    }
  | {
      type: "answer";
      answer: RTCSessionDescriptionInit;
    }
  | {
      type: "candidate";
      candidate: RTCIceCandidateInit;
    };
