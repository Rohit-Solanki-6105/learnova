"use client";

import React from "react";
import { createPlayer } from "@videojs/react";
import { Video, VideoSkin, videoFeatures } from "@videojs/react/video";
import "@videojs/react/video/skin.css";

const Player = createPlayer({ features: videoFeatures });

interface LessonVideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
}

export function LessonVideoPlayer({ src, poster, className = "" }: LessonVideoPlayerProps) {
    return (
        <Player.Provider>
            <div className={`aspect-video w-full bg-[#111212] rounded-[2rem] overflow-hidden shadow-2xl ${className}`}>
                <VideoSkin>
                    <Video
                        src={src}
                        poster={poster}
                        crossOrigin="anonymous"
                        playsInline
                        className="w-full h-full object-contain"
                        style={{ aspectRatio: "16/9" }}
                    />
                </VideoSkin>
            </div>
        </Player.Provider>
    );
}
