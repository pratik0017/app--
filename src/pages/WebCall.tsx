import React, { useRef, useState } from "react";
import Navigation from "@/components/Navigation";

const SIGNAL_SERVER_URL = "ws://15.206.72.248:8080";

const WebCall = () => {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isCaller, setIsCaller] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // For layout: which video is large
  const [largeVideo, setLargeVideo] = useState<"local" | "remote">("remote");

  // Join room and setup WebSocket
  const joinRoom = async () => {
    if (!roomId) return alert("Enter a room ID");
    const wsConn = new window.WebSocket(SIGNAL_SERVER_URL);
    setWs(wsConn);

    wsConn.onopen = () => {
      wsConn.send(JSON.stringify({ type: "joinRoom", roomId }));
      setJoined(true);
    };

    wsConn.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "createOffer") {
        await handleReceiveOffer(msg.sdp);
      } else if (msg.type === "createAnswer") {
        await handleReceiveAnswer(msg.sdp);
      } else if (msg.type === "iceCandidate") {
        await handleReceiveCandidate(msg.candidate);
      }
    };

    wsConn.onclose = () => {
      setJoined(false);
      cleanup();
    };
  };

  // Start local video and create peer connection
  const startCall = async () => {
    setIsCaller(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = createPeerConnection();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws?.send(JSON.stringify({ type: "createOffer", sdp: offer.sdp }));
  };

  // Create peer connection and set up handlers
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws?.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  // Handle receiving offer
  const handleReceiveOffer = async (sdp: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = createPeerConnection();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    ws?.send(JSON.stringify({ type: "createAnswer", sdp: answer.sdp }));
  };

  // Handle receiving answer
  const handleReceiveAnswer = async (sdp: string) => {
    await pcRef.current?.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
  };

  // Handle receiving ICE candidate
  const handleReceiveCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      // ignore
    }
  };

  // Cleanup on leave
  const cleanup = () => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setIsCaller(false);
  };

  // Leave room
  const leaveRoom = () => {
    ws?.close();
    setJoined(false);
    cleanup();
  };

  // Exchange videos
  const handleExchange = () => {
    setLargeVideo((prev) => (prev === "local" ? "remote" : "local"));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">WebRTC Demo</h2>
          {!joined ? (
            <div className="mb-6">
              <input
                className="border px-2 py-1 rounded mr-2"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={joinRoom}
              >
                Join Room
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                onClick={leaveRoom}
              >
                Leave Room
              </button>
              {!isCaller && (
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={startCall}
                >
                  Start Call
                </button>
              )}
            </div>
          )}

          {/* Video Layout */}
          <div className="relative flex justify-center items-center" style={{ minHeight: 400 }}>
            {/* Large Video */}
            <div className="relative w-full flex justify-center items-center">
              {largeVideo === "local" ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-[400px] bg-black rounded-lg object-contain"
                  style={{ zIndex: 10 }}
                />
              ) : (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-[400px] bg-black rounded-lg object-contain"
                  style={{ zIndex: 10 }}
                />
              )}
              {/* Exchange button */}
              <button
                onClick={handleExchange}
                className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded shadow"
                title="Swap Videos"
                style={{ zIndex: 20 }}
              >
                ⇄
              </button>
            </div>
            {/* Small (pip) Video */}
            <div
              className="absolute bottom-8 left-8 shadow-lg border-2 border-white rounded-lg bg-black"
              style={{ width: 160, height: 120, zIndex: 30 }}
            >
              {largeVideo === "local" ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebCall;