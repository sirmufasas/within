'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface WithinLoaderProps {
  message?: string;
}

const BAR_HEIGHTS = [6, 14, 8, 18, 10, 15, 7, 13];

export default function WithinLoader({
  message = 'Loading your workspace...',
}: WithinLoaderProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);

    return () => clearInterval(dotsInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a1a] overflow-hidden">

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(79,70,229,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,70,229,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Animated Scan Line */}
      <div
        className="absolute left-0 right-0 h-px opacity-30 pointer-events-none scan-line"
        style={{
          background:
            'linear-gradient(90deg, transparent, #818CF8, #4F46E5, #818CF8, transparent)',
          boxShadow: '0 0 20px 2px rgba(79,70,229,0.6)',
        }}
      />

      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(79,70,229,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Corners */}
      {[
        'top-4 left-4 border-t-2 border-l-2',
        'top-4 right-4 border-t-2 border-r-2',
        'bottom-4 left-4 border-b-2 border-l-2',
        'bottom-4 right-4 border-b-2 border-r-2',
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-8 h-8 border-indigo-500/50 ${cls}`}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="relative">

          <div
            className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping"
            style={{ animationDuration: '2s' }}
          />

          <div
            className="absolute inset-[-8px] rounded-full border border-indigo-400/20"
            style={{
              animation: 'spin 8s linear infinite',
            }}
          />

          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, #312E81 0%, #4F46E5 50%, #6366F1 100%)',
              boxShadow:
                '0 0 40px rgba(79,70,229,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <Image
              src="/assets/images/download-1784730896538.png"
              alt="WITH-IN Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1
            className="text-4xl font-bold tracking-[0.3em] text-white mb-1"
            style={{
              textShadow:
                '0 0 30px rgba(129,140,248,0.8), 0 0 60px rgba(79,70,229,0.4)',
            }}
          >
            WITH-IN
          </h1>

          <p className="text-indigo-400 text-xs tracking-[0.2em] uppercase">
            Business Management Platform
          </p>
        </div>

        {/* Progress */}
        <div className="w-64 relative">
          <div className="h-px bg-indigo-900/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #4F46E5, #818CF8)',
                boxShadow:
                  '0 0 8px rgba(129,140,248,0.8)',
                animation:
                  'loaderProgress 2s ease-in-out infinite',
              }}
            />
          </div>

          <div
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400"
            style={{
              boxShadow: '0 0 6px rgba(129,140,248,1)',
              animation: 'loaderDot 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Message */}
        <p className="text-indigo-300/70 text-sm font-mono tracking-wider">
          {message}
          {dots}
        </p>

        {/* Data Bars */}
        <div className="flex gap-1 opacity-40">
          {BAR_HEIGHTS.map((height, i) => (
            <div
              key={i}
              className="w-0.5 bg-indigo-500 rounded-full"
              style={{
                height: `${height}px`,
                animation: `dataBar 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </div>

      </div>

      <style jsx>{`
        @keyframes loaderProgress {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 60%;
            margin-left: 20%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }

        @keyframes loaderDot {
          0% {
            left: 0%;
          }
          50% {
            left: 80%;
          }
          100% {
            left: 100%;
          }
        }

        @keyframes dataBar {
          from {
            transform: scaleY(0.3);
            opacity: 0.3;
          }
          to {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes scan {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }

        .scan-line {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}