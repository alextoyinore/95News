"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface BrowserAudioPlayerProps {
    content: any; // EditorJS content or string
    title: string;
}

export default function BrowserAudioPlayer({ content, title }: BrowserAudioPlayerProps) {
    const [isPaused, setIsPaused] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isSupported, setIsSupported] = useState(true);
    const synth = useRef<SpeechSynthesis | null>(null);
    const utterance = useRef<SpeechSynthesisUtterance | null>(null);
    const [fullText, setFullText] = useState("");

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            synth.current = window.speechSynthesis;

            // Extract text from content
            let text = title + ". ";
            try {
                const parsed = typeof content === 'string' ? JSON.parse(content) : content;
                const blocks = parsed.blocks || [];
                blocks.forEach((block: any) => {
                    if (block.data?.text) {
                        text += block.data.text + " ";
                    } else if (block.data?.items) {
                        block.data.items.forEach((item: string) => {
                            text += item + " ";
                        });
                    }
                });
            } catch (e) {
                text += content?.toString() || "";
            }

            // Clean HTML tags
            const cleanText = text.replace(/<[^>]*>?/gm, '');
            setFullText(cleanText);

            return () => {
                if (synth.current) {
                    synth.current.cancel();
                }
            };
        } else {
            setIsSupported(false);
        }
    }, [content, title]);

    const handlePlayPause = () => {
        if (!isSupported || !synth.current) return;

        if (isPaused) {
            if (synth.current.paused) {
                synth.current.resume();
            } else {
                // Cancel any previous speech
                synth.current.cancel();

                utterance.current = new SpeechSynthesisUtterance(fullText);
                utterance.current.rate = 1;
                utterance.current.pitch = 1;
                utterance.current.volume = isMuted ? 0 : 1;

                utterance.current.onend = () => {
                    setIsPaused(true);
                    setProgress(0);
                };

                utterance.current.onboundary = (event) => {
                    if (event.charIndex && fullText.length > 0) {
                        setProgress((event.charIndex / fullText.length) * 100);
                    }
                };

                synth.current.speak(utterance.current);
            }
            setIsPaused(false);
        } else {
            synth.current.pause();
            setIsPaused(true);
        }
    };

    const handleStop = () => {
        if (synth.current) {
            synth.current.cancel();
            setIsPaused(true);
            setProgress(0);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (synth.current && utterance.current) {
            // In simple Web Speech API, we might need to restart to change volume effectively 
            // or just let it continue. Some browsers allow changing while speaking.
            utterance.current.volume = !isMuted ? 0 : 1;
        }
    };

    if (!isSupported) return null;

    return (
        <div className="glass" style={{
            padding: "1.5rem",
            borderRadius: "var(--radius-lg)",
            marginBottom: "2rem",
            border: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white"
                    }}>
                        <Volume2 size={20} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: "1rem", fontWeight: "700", margin: 0 }}>Listen to this story</h4>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>AI generated voice</p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                        onClick={handlePlayPause}
                        className="btn btn-primary"
                        style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0
                        }}
                    >
                        {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                    </button>
                    <button
                        onClick={handleStop}
                        className="btn"
                        style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            border: "1px solid var(--border)"
                        }}
                    >
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={toggleMute}
                        className="btn"
                        style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            border: "1px solid var(--border)"
                        }}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>
            </div>

            <div style={{
                height: "6px",
                width: "100%",
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "3px",
                overflow: "hidden",
                position: "relative"
            }}>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${progress}%`,
                    backgroundColor: "var(--accent)",
                    transition: "width 0.2s linear"
                }} />
            </div>
        </div>
    );
}
