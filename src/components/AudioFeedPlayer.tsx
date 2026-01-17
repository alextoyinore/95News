"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Clock, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";


interface AudioPost {
    id: string;
    title: string;
    excerpt: string;
    audioUrl: string;
    image?: string;
    author: string;
    date: string;
}

export default function AudioFeedPlayer({ posts }: { posts: AudioPost[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const currentPost = posts[currentIndex];


    // Generate static random heights for the waveform once
    const [bars] = useState(() => Array.from({ length: 40 }, () => Math.random() * 0.7 + 0.3));

    // Reset state when track changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Play error:", e));
            }
        }
    }, [currentIndex]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const playTrack = (index: number) => {
        setCurrentIndex(index);
        setIsPlaying(true);
    };

    const nextTrack = () => {
        setCurrentIndex((prev) => (prev + 1) % posts.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
        setIsPlaying(true);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
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

    const handleDismiss = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsPlaying(false);
        router.push("/");
    };


    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!posts || posts.length === 0) {
        return <div className="text-center py-20">No audio stories available at the moment.</div>;
    }

    return (
        <div className="audio-player-container">
            <div className="player-grid">

                {/* Left: Album Art Section */}
                <div className="">
                    <div className="album-art">
                        {currentPost.image ? (
                            <img src={currentPost.image} alt={currentPost.title} />
                        ) : (
                            <div className="placeholder-art">95News Audio</div>
                        )}
                    </div>
                </div>

                {/* Center: Controls & Info Section */}
                <div className="main-player-panel">
                    <div className="track-info">
                        <h2>{currentPost.title}</h2>
                        <p className="author">{currentPost.author}</p>
                    </div>

                    <div className="controls-area">
                        {/* Waveform Visualization */}
                        <div
                            ref={containerRef}
                            onClick={handleSeek}
                            className="waveform-container"
                        >
                            {bars.map((height, i) => {
                                const barProgress = i / bars.length;
                                const isPlayed = barProgress < (duration ? currentTime / duration : 0);

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

                        <div className="time-display">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>

                        <div className="transport-controls">
                            <button onClick={prevTrack} className="control-btn secondary"><SkipBack size={24} /></button>
                            <button onClick={togglePlay} className="control-btn primary">
                                {isPlaying ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
                            </button>
                            <button onClick={nextTrack} className="control-btn secondary"><SkipForward size={24} /></button>
                        </div>
                    </div>

                    <audio
                        ref={audioRef}
                        src={currentPost.audioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={nextTrack}
                    />
                </div>

                {/* Playlist Section */}
                <div className="playlist">
                    <h3 style={{ marginBottom: '1rem' }}>Up Next</h3>
                    <div className="playlist-tracks">
                        {posts.map((post, idx) => (
                            <div
                                key={post.id}
                                className={`playlist-item ${idx === currentIndex ? 'active' : ''}`}
                                onClick={() => playTrack(idx)}
                            >
                                <div className="track-thumb">
                                    {post.image && <img src={post.image} alt="" />}
                                    {idx === currentIndex && isPlaying && (
                                        <div className="playing-indicator">
                                            <div className="bar"></div>
                                            <div className="bar"></div>
                                            <div className="bar"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="track-details">
                                    <h4 className="truncate">{post.title}</h4>
                                    <span className="meta">{post.author} • {post.date}</span>
                                </div>
                                <div className="track-action">
                                    {idx === currentIndex && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .audio-player-container {
                    padding: 1rem 0;
                    position: relative;
                }
                .player-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr 1fr;
                    gap: 2rem;
                    min-height: 600px;
                }
                .album-art-panel {
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-lg);
                    background: var(--bg-secondary);
                }
                .main-player-panel {
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    // justify-content: center;
                    border-radius: var(--radius-lg);
                    // background: var(--bg-secondary);
                    text-align: center;
                }
                .playlist {
                    // padding: 1.5rem;
                    // border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    // background: var(--bg-secondary);
                }
                .album-art {
                    width: 100%;
                    aspect-ratio: 1/1;
                    max-width: 350px;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    background: var(--bg-tertiary);
                }
                .album-art img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .track-info h2 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.2;
                }
                .track-info .author {
                    color: var(--accent);
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin-bottom: 3rem;
                }
                .controls-area {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .waveform-container {
                    height: 80px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    margin-bottom: 1rem;
                    padding: 0 1rem;
                }
                .time-display {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    font-variant-numeric: tabular-nums;
                    margin-bottom: 2rem;
                }
                @keyframes equalizer {
                    0% { transform: scaleY(1); }
                    100% { transform: scaleY(0.6); }
                }
                .transport-controls {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                }
                /* ...rest of existing styles for buttons and playlist items... */
                .control-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-primary);
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }
                .control-btn:hover {
                    color: var(--accent);
                    background: var(--bg-tertiary);
                }
                .control-btn.primary {
                    width: 72px;
                    height: 72px;
                    background: var(--accent);
                    color: white;
                    box-shadow: 0 8px 16px rgba(234, 88, 12, 0.3);
                }
                .control-btn.primary:hover {
                    transform: scale(1.05);
                    box-shadow: 0 12px 20px rgba(234, 88, 12, 0.4);
                }
                .control-btn.secondary {
                    width: 56px;
                    height: 56px;
                }
                .playlist-tracks {
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    flex: 1;
                }
                .playlist-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.8rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .playlist-item:hover {
                    background: var(--bg-tertiary);
                }
                .playlist-item.active {
                    background: hsla(20, 90%, 55%, 0.1);
                }
                .track-thumb {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-sm);
                    overflow: hidden;
                    flex-shrink: 0;
                    position: relative;
                }
                .track-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .track-details {
                    flex: 1;
                    min-width: 0;
                }
                .track-details h4 {
                    font-size: 0.95rem;
                    margin-bottom: 0.2rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .track-details .meta {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .placeholder-art {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text-muted);
                }
                /* Playing Animation for Playlist */
                .playing-indicator {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 3px;
                }
                .bar {
                    width: 3px;
                    background: white;
                    animation: bounce 1s infinite;
                }
                .bar:nth-child(2) { animation-delay: 0.2s; }
                .bar:nth-child(3) { animation-delay: 0.4s; }

                @keyframes bounce {
                    0%, 100% { height: 10px; }
                    50% { height: 20px; }
                }

                @media (max-width: 1200px) {
                    .player-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    .album-art-panel {
                        display: none;
                    }
                }
                @media (max-width: 768px) {
                    .player-grid {
                        grid-template-columns: 1fr;
                        height: auto;
                    }
                    .main-player-panel {
                        // padding: 2rem 1.5rem;
                    }
                    .track-info h2 {
                        font-size: 1.5rem;
                    }
                    .playlist {
                        max-height: 500px;
                    }
                }
            `}</style>
        </div>
    );
}
