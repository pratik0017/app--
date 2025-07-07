import React, { useEffect, useRef, useState, useCallback } from "react";
import Navigation from "@/components/Navigation";

// --- SVG Icons for UI Controls ---
const MicOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" x2="12" y1="19" y2="22"></line>
    </svg>
);

const MicOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="5"></line>
        <path d="M17 8A5 5 0 0 0 7 8"></path>
        <path d="M12 18v4"></path>
        <path d="M21 12h-2"></path>
        <path d="M7 12H5"></path>
        <path d="m4.2 4.2 1.4 1.4"></path>
        <path d="M18.4 18.4 17 17"></path>
        <path d="m4.2 19.8 1.4-1.4"></path>
        <path d="M18.4 5.6 17 7"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
);

const VideoOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 8-6 4 6 4V8Z"></path>
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
    </svg>
);

const VideoOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V12"></path>
        <path d="m22 8-6 4 6 4V8Z"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
);

const PhoneOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 4.1 1.11 2 2 0 0 1 1.44 2.16l-2.13 6.39a2 2 0 0 1-2.16 1.44 16 16 0 0 1-16-16 2 2 0 0 1 1.44-2.16l6.39-2.13a2 2 0 0 1 2.16 1.44 12.84 12.84 0 0 0 1.11 4.1 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
        <line x1="22" y1="2" x2="2" y2="22"></line>
    </svg>
);

const SIGNAL_SERVER_URL = "ws://15.206.72.248:8080";
const STUN_SERVER_URL = "stun:stun.l.google.com:19302";

export default function WebCall() {
    const [roomId, setRoomId] = useState("");
    const [isInRoom, setIsInRoom] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [peerConnected, setPeerConnected] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    // --- Signaling Logic ---
    const sendMessage = (message: object) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
        }
    };

    // --- WebRTC Setup ---
    const setupPeerConnection = useCallback(() => {
        if (pcRef.current) return;

        pcRef.current = new RTCPeerConnection({
            iceServers: [{ urls: STUN_SERVER_URL }]
        });

        pcRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                sendMessage({ type: "iceCandidate", candidate: event.candidate });
            }
        };

        pcRef.current.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setPeerConnected(true);
            }
        };

        pcRef.current.onconnectionstatechange = () => {
            if (pcRef.current?.connectionState === 'disconnected' || pcRef.current?.connectionState === 'failed') {
                setPeerConnected(false);
            }
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pcRef.current?.addTrack(track, localStreamRef.current!);
            });
        }
    }, []);

    // --- Media Handling ---
    const startLocalMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (error) {
            alert("Could not access camera and microphone. Please check permissions.");
            return null;
        }
    };

    // --- Call Lifecycle Handlers ---
    const handleOffer = async (sdp: string) => {
        if (!localStreamRef.current) {
            await startLocalMedia();
        }
        setupPeerConnection();
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }));
        const answer = await pcRef.current?.createAnswer();
        await pcRef.current?.setLocalDescription(answer);
        sendMessage({ type: "createAnswer", sdp: answer?.sdp });
    };

    const handleAnswer = async (sdp: string) => {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }));
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
        if (pcRef.current) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    // --- Main Actions ---
    const handleJoinRoom = async () => {
        if (!roomId.trim()) {
            alert("Please enter a Room ID.");
            return;
        }
        setIsConnecting(true);

        const stream = await startLocalMedia();
        if (!stream) {
            setIsConnecting(false);
            return;
        }

        socketRef.current = new WebSocket(SIGNAL_SERVER_URL);

        socketRef.current.onopen = () => {
            sendMessage({ type: "joinRoom", roomId });
            setIsInRoom(true);
            setIsConnecting(false);
        };

        socketRef.current.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            switch (msg.type) {
                case "createOffer":
                    await handleOffer(msg.sdp);
                    break;
                case "createAnswer":
                    await handleAnswer(msg.sdp);
                    break;
                case "iceCandidate":
                    await handleIceCandidate(msg.candidate);
                    break;
                case "error":
                    alert(`Error from server: ${msg.message}`);
                    break;
            }
        };

        socketRef.current.onclose = () => {
            handleLeaveRoom();
        };

        socketRef.current.onerror = () => {
            alert("Failed to connect to the signaling server.");
            setIsConnecting(false);
            setIsInRoom(false);
        };
    };

    const createOffer = async () => {
        setupPeerConnection();
        const offer = await pcRef.current?.createOffer();
        await pcRef.current?.setLocalDescription(offer);
        sendMessage({ type: "createOffer", sdp: offer?.sdp });
    };

    const handleLeaveRoom = () => {
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

        pcRef.current?.close();
        pcRef.current = null;

        socketRef.current?.close();
        socketRef.current = null;

        setIsInRoom(false);
        setPeerConnected(false);
        setRoomId("");
    };

    // --- UI Controls ---
    const toggleAudio = () => {
        const enabled = !audioEnabled;
        setAudioEnabled(enabled);
        localStreamRef.current?.getAudioTracks().forEach(track => track.enabled = enabled);
    };

    const toggleVideo = () => {
        const enabled = !videoEnabled;
        setVideoEnabled(enabled);
        localStreamRef.current?.getVideoTracks().forEach(track => track.enabled = enabled);
    };

    useEffect(() => {
    // When in room and localStreamRef is set, always assign stream to video element
    if (isInRoom && localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
    }
    }, [isInRoom, localStreamRef.current]);

    // --- Render Logic ---
    if (!isInRoom) {
                return (
            <div style={{ background: "#fff", minHeight: "100vh" }}>
                <Navigation />
                <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#f3f4f6", padding: 32, borderRadius: 16, boxShadow: "0 8px 32px #0002", minWidth: 320 }}>
                        <h2 style={{ color: "#222", fontWeight: 700, fontSize: 24, marginBottom: 16 }}>Join a Room</h2>
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            placeholder="Enter Room ID"
                            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #bbb", marginBottom: 16, background: "#fff", color: "#222" }}
                        />
                        <button
                            onClick={handleJoinRoom}
                            disabled={isConnecting || !roomId}
                            style={{
                                width: "100%",
                                padding: 12,
                                borderRadius: 8,
                                background: "#2563eb",
                                color: "#fff",
                                fontWeight: 600,
                                border: "none",
                                cursor: isConnecting || !roomId ? "not-allowed" : "pointer"
                            }}
                        >
                            {isConnecting ? "Connecting..." : "Join Room"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#fff", minHeight: "100vh" }}>
            <Navigation />
            <div style={{ paddingTop: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ position: "relative", width: 900, maxWidth: "95vw", height: 500, background: "#e5e7eb", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 32px #0002", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        style={{ width: "100%", height: "100%", objectFit: "cover", background: "#f3f4f6" }}
                    />
                    {!peerConnected && (
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "#fff9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                            <span style={{ fontSize: 32, marginBottom: 24, color: "#222" }}>Waiting for another person to join...</span>
                            <button onClick={createOffer} style={{ padding: "12px 32px", borderRadius: 8, background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 18, border: "none", cursor: "pointer" }}>
                                Start Call
                            </button>
                            <span style={{ marginTop: 12, color: "#666" }}>(Click this if you are the first person in the room)</span>
                        </div>
                    )}
                    <div style={{ position: "absolute", bottom: 24, right: 24, width: 200, height: 150, background: "#fff", borderRadius: 12, overflow: "hidden", border: "2px solid #bbb", zIndex: 3 }}>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: "100%", height: "100%", objectFit: "cover", background: "#f3f4f6" }}
                        />
                        {!videoEnabled && (
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "#fff9", display: "flex", alignItems: "center", justifyContent: "center", color: "#222", fontSize: 32 }}>
                                <VideoOffIcon />
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ marginTop: 32, display: "flex", gap: 24 }}>
                    <button onClick={toggleAudio} style={{ background: audioEnabled ? "#f3f4f6" : "#dc2626", border: "none", borderRadius: "50%", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: audioEnabled ? "#222" : "#fff", fontSize: 24, cursor: "pointer" }}>
                        {audioEnabled ? <MicOnIcon /> : <MicOffIcon />}
                    </button>
                    <button onClick={toggleVideo} style={{ background: videoEnabled ? "#f3f4f6" : "#dc2626", border: "none", borderRadius: "50%", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: videoEnabled ? "#222" : "#fff", fontSize: 24, cursor: "pointer" }}>
                        {videoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
                    </button>
                    <button onClick={handleLeaveRoom} style={{ background: "#dc2626", border: "none", borderRadius: "50%", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, cursor: "pointer" }}>
                        <PhoneOffIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}