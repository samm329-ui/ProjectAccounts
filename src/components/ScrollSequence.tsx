"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

// --- Configuration ---
const TOTAL_FRAMES = 140;
const SCROLL_HEIGHT = `${TOTAL_FRAMES * 2}vh`;

type TextOverlay = {
  start: number;
  end: number;
  position: "left" | "center" | "right";
  title: string;
  subtitle?: string;
};

const NARRATIVE_BEATS: TextOverlay[] = [
  {
    start: 0.0,
    end: 0.25,
    position: "center",
    title: "CanvasScrollHero",
    subtitle: "Awwwards-level scrollytelling.",
  },
  {
    start: 0.3,
    end: 0.55,
    position: "left",
    title: "Fluid Motion",
    subtitle: "Powered by Framer Motion, smoothed with LERP for a cinematic feel.",
  },
  {
    start: 0.6,
    end: 0.85,
    position: "right",
    title: "High Performance",
    subtitle: "Optimized with HTML5 Canvas and image preloading.",
  },
  {
    start: 0.9,
    end: 1.0,
    position: "center",
    title: "Ready for Anything",
    subtitle: "A reusable component for any brand.",
  },
];

const getFrameSrc = (index: number): string => {
  const frameIndex = 1000 + index;
  return `https://olcukmvtctbvutjcrmph.supabase.co/storage/v1/object/public/assest/hero%20animation/accounts%20png/Sequence%2001_${frameIndex}.png`;
};

const lerp = (start: number, end: number, amt: number): number => {
  return (1 - amt) * start + amt * end;
};

const Loader = ({ progress }: { progress: number }) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505] text-white/80">
    <div
      className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"
      role="status"
      aria-label="Loading"
    ></div>
    <p className="mt-4 font-mono text-sm tracking-wider">
      {Math.round(progress)}%
    </p>
  </div>
);

const TextOverlay = ({ beat, scrollYProgress }: { beat: TextOverlay, scrollYProgress: MotionValue<number> }) => {
  const opacity = useTransform(
    scrollYProgress,
    [beat.start - 0.05, beat.start, beat.end, beat.end + 0.05],
    [0, 1, 1, 0]
  );

  const positionClasses = {
    left: "items-center md:items-start justify-center md:justify-start text-center md:text-left",
    center: "items-center justify-center text-center",
    right: "items-center md:items-end justify-center md:justify-end text-center md:text-right",
  };

  return (
    <motion.div
      style={{ opacity }}
      className={cn(
        "absolute inset-0 flex flex-col p-8 md:p-24 pointer-events-none",
        positionClasses[beat.position]
      )}
    >
      <div className="max-w-md">
        <h2 className="text-4xl md:text-6xl font-bold text-white/90 drop-shadow-md">
          {beat.title}
        </h2>
        {beat.subtitle && (
          <p className="mt-4 text-lg md:text-xl text-white/60 drop-shadow">
            {beat.subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default function ScrollSequence() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [framesLoaded, setFramesLoaded] = useState(0);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const frameAnimation = useRef({ current: 0, target: 0 });

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises: Promise<HTMLImageElement>[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        const promise = new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => {
            setFramesLoaded((prev) => prev + 1);
            resolve(img);
          };
          img.onerror = reject;
        });
        img.src = getFrameSrc(i);
        imagePromises.push(promise);
      }
      try {
        const loadedImages = await Promise.all(imagePromises);
        setImages(loadedImages);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load images for sequence", error);
      }
    };
    loadImages();
  }, []);

  const drawImage = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if(!rect) return;
      
      canvas.width = rect.width;
      canvas.height = rect.height;

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = canvas.width / canvas.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let x = 0;
      let y = 0;

      if (imgRatio > canvasRatio) {
        drawHeight = canvas.width / imgRatio;
        y = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        x = (canvas.width - drawWidth) / 2;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    },
    []
  );

  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId: number;

    const render = () => {
        frameAnimation.current.current = lerp(
            frameAnimation.current.current,
            frameAnimation.current.target,
            0.1
        );
        
        const currentIndex = Math.round(frameAnimation.current.current);
        if (images[currentIndex]) {
            drawImage(canvas, ctx, images[currentIndex]);
        }
        animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
        const currentIndex = Math.round(frameAnimation.current.current);
        if (images[currentIndex]) {
            drawImage(canvas, ctx, images[currentIndex]);
        }
    };

    window.addEventListener("resize", handleResize);
    render();

    return () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationFrameId);
    };
  }, [loading, images, drawImage]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    frameAnimation.current.target = latest * (TOTAL_FRAMES - 1);
  });
  
  return (
    <div ref={scrollRef} style={{ height: SCROLL_HEIGHT }} className="relative">
      {loading && <Loader progress={(framesLoaded / TOTAL_FRAMES) * 100} />}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full" />
        {!loading && NARRATIVE_BEATS.map((beat, index) => (
          <TextOverlay key={index} beat={beat} scrollYProgress={scrollYProgress} />
        ))}
      </div>
    </div>
  );
}
