"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Clock } from "lucide-react";
import Image from "next/image";

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
    const currentPost = posts[currentIndex];

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

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
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
                {/* Main Player Section */}
                <div className="main-player glass">
                    <div className="album-art">
                        {currentPost.image ? (
                            <img src={currentPost.image} alt={currentPost.title} />
                        ) : (
                            <div className="placeholder-art">95News Audio</div>
                        )}
                    </div>

                    <div className="track-info">
                        <h2>{currentPost.title}</h2>
                        <p className="author">{currentPost.author}</p>
                    </div>

                    <div className="controls-area">
                        <div className="progress-bar-container">
                            <span className="time">{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="progress-slider"
                            />
                            <span className="time">{formatTime(duration)}</span>
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
                <div className="playlist glass">
                    <h3>Up Next</h3>
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
                    padding: 2rem 0;
                }
                .player-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 2rem;
                    height: calc(100vh - 140px);
                    max-height: 800px;
                }
                .main-player {
                    padding: 3rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    border-radius: var(--radius-lg);
                    height: 100%;
                    border: none !important;
                    box-shadow: none !important; /* Removing shadow too if "borders" implied clean flat look, or just borders? User said "borders". I'll stick to border: none. */
                }
                /* ... */

                .playlist {
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    height: 100%;
                    border: none !important;
                }
                .playlist h3 {
                    margin-bottom: 1rem;
                    padding-bottom: 1rem;
                    /* border-bottom: 1px solid var(--border); REMOVED */
                }
                .album-art {
                    width: 300px;
                    height: 300px;
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    /* box-shadow: var(--shadow-lg); REMOVED */
                    margin-bottom: 2rem;
                    background: var(--bg-tertiary);
                }
                .album-art img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
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
                .track-info h2 {
                    font-size: 1.8rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.3;
                }
                .track-info .author {
                    color: var(--accent);
                    font-weight: 600;
                    margin-bottom: 2rem;
                }
                .controls-area {
                    width: 100%;
                    max-width: 500px;
                    margin-top: auto;
                }
                .progress-bar-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    font-size: 0.85rem;
                    font-variant-numeric: tabular-nums;
                }
                .progress-slider {
                    flex: 1;
                    height: 4px;
                    border-radius: 2px;
                    background: var(--bg-tertiary);
                    cursor: pointer;
                    accent-color: var(--accent);
                }
                .transport-controls {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                }
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
                    width: 64px;
                    height: 64px;
                    background: var(--accent);
                    color: white;
                    box-shadow: var(--shadow-md);
                }
                .control-btn.primary:hover {
                    transform: scale(1.05);
                    background: var(--accent-hover);
                }
                .control-btn.secondary {
                    width: 48px;
                    height: 48px;
                }


                .playlist-tracks {
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    scroll-behavior: smooth;
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
                    background: hsla(20, 90%, 55%, 0.15);
                    /* border: 1px solid var(--accent); REMOVED border as per previous request */
                }
                .playlist-item.active h4 {
                    color: var(--accent);
                }
                .playlist-item.active p {
                    color: var(--text-primary); /* Ensure subheading is legible */
                    opacity: 0.8;
                }
                .track-thumb {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-sm);
                    overflow: hidden;
                    background: var(--bg-secondary);
                    position: relative;
                    flex-shrink: 0;
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
                
                /* Playing Animation */
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

                @media (max-width: 1024px) {
                    .player-grid {
                        grid-template-columns: 1fr;
                        height: auto;
                        max-height: none;
                    }
                    .playlist-tracks {
                        max-height: 400px;
                    }
                }
                @media (max-width: 640px) {
                    .main-player {
                        padding: 1rem;
                    }
                    .album-art {
                        width: 200px;
                        height: 200px;
                    }
                }
            `}</style>
        </div>
    );
}
