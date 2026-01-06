"use client";

import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
    audioUrl: string;
    title?: string;
}

export default function AudioPlayer({ audioUrl, title }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Generate static random heights for the waveform once
    const [bars] = useState(() => Array.from({ length: 50 }, () => Math.random() * 0.7 + 0.3));

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        const container = containerRef.current;
        if (!audio || !container) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.min(Math.max(x / rect.width, 0), 1);

        const newTime = percentage * (duration || 0);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercent = duration ? (currentTime / duration) : 0;

    return (
        <div className="glass" style={{
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '3rem',
            background: 'linear-gradient(135deg, hsla(20, 90%, 55%, 0.05), hsla(20, 90%, 55%, 0.02))',
            border: '1px solid var(--accent)'
        }}>
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button
                    onClick={togglePlay}
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: 'none',
                        color: 'white',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {title && (
                        <div style={{
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>🎧 Listen to article</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                    )}

                    {/* Waveform Visualization */}
                    <div
                        ref={containerRef}
                        onClick={handleSeek}
                        style={{
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        {bars.map((height, i) => {
                            const barProgress = i / bars.length;
                            const isPlayed = barProgress < progressPercent;

                            return (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: `${height * 100}%`,
                                        backgroundColor: isPlayed ? 'var(--accent)' : 'var(--text-muted)',
                                        opacity: isPlayed ? 1 : 0.3,
                                        borderRadius: '4px',
                                        transition: 'height 0.2s ease, background-color 0.1s ease',
                                        animation: isPlaying && isPlayed ? `equalizer 1s ease-in-out infinite alternate` : 'none',
                                        animationDelay: `${i * 0.05}s`
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes equalizer {
                    0% { transform: scaleY(1); }
                    100% { transform: scaleY(0.7); }
                }
            `}</style>
        </div>
    );
}
