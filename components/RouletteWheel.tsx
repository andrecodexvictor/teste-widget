import React, { useEffect, useState, useRef } from 'react';
import { ThemeMode } from '../types';
import { Trophy, X } from 'lucide-react';

interface RouletteWheelProps {
    theme: ThemeMode;
    events: string[];
    onComplete: () => void;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({ theme, events, onComplete }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState<string | null>(null);

    // Determine colors based on theme
    const getColors = () => {
        switch (theme) {
            case ThemeMode.MARIO: return ['#E52521', '#43B047', '#049CD8', '#FBD000'];
            case ThemeMode.NEON: return ['#ff00ff', '#00ffff', '#ffff00', '#9d00ff'];
            default: return ['#FFB7C5', '#B5EAD7', '#E2F0CB', '#FFDAC1', '#E0BBE4']; // Pastels
        }
    };

    const colors = getColors();

    useEffect(() => {
        // Start spin automatically on mount
        const spin = () => {
            setIsSpinning(true);

            // Calculate random winning index
            const segmentAngle = 360 / events.length;
            const randomSegment = Math.floor(Math.random() * events.length);

            // Ensure at least 5 full spins (1800 degrees) + specific angle to land on segment
            // We add random offset within the segment to make it look realistic
            const extraSpins = 360 * 8;
            const targetAngle = extraSpins + (randomSegment * segmentAngle) + (segmentAngle / 2);

            // Simplified: Just visually spin to a random degree.
            const randomRotation = 2000 + Math.random() * 2000;

            setRotation(randomRotation);

            // Determine winner based on final rotation
            setTimeout(() => {
                // For visual simplicity in this demo, we just pick a random winner from the list to display text
                const winningEvent = events[Math.floor(Math.random() * events.length)];

                setWinner(winningEvent);
                setIsSpinning(false);
            }, 4000); // Duration matches CSS transition
        };
        // Winner Display
        <div className="text-center animate-bounce p-4 bg-white rounded-xl border-4 border-yellow-400 shadow-2xl transform scale-110 relative w-64">
        </button>
        </div >
            ) : (
    // The Wheel
    <div className="relative w-64 h-64">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-red-500 drop-shadow-md"></div>

        {/* Wheel Container */}
        <div
            className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden relative transition-transform duration-[4000ms] cubic-bezier(0.25, 0.1, 0.25, 1)"
            style={{
                transform: `rotate(-${rotation}deg)`,
                background: `conic-gradient(${events.map((_, i) => {
                    const start = (i / events.length) * 100;
                    const end = ((i + 1) / events.length) * 100;
                    return `${colors[i % colors.length]} ${start}% ${end}%`;
                }).join(', ')
                    })`
            }}
        >
            {/* Labels */}
            {events.map((event, i) => {
                const angle = (360 / events.length) * i + (360 / events.length) / 2;
                return (
                    <div
                        key={i}
                        className="absolute w-full text-center top-1/2 left-1/2 text-[10px] font-bold text-black/70"
                        style={{
                            transform: `translate(-50%, -50%) rotate(${angle + 90}deg) translate(0, -80px)`,
                            width: '100px' // Limit width
                        }}
                    >
                        <span className="bg-white/30 px-1 rounded backdrop-blur-sm whitespace-nowrap overflow-hidden text-ellipsis block max-w-full">
                            {event}
                        </span>
                    </div>
                );
            })}
        </div>

        {/* Center Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-inner z-10 flex items-center justify-center border-2 border-gray-200">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
    </div>
)
}
        </div >
    );
};