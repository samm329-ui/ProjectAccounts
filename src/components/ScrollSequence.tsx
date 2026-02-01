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
const TOTAL_FRAMES = 150; // Reduced for faster loading
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
      start: 0,
      end: 0.25,
      position: "left",
      title: "Transparent Financial Records",
      subtitle: "Every transaction, logged with uncompromised honesty and clarity.",
    },
    {
      start: 0.3,
      end: 0.55,
      position: "left",
      title: "Swift & Secure Processing",
      subtitle: "Experience rapid transaction recording with bank-level security.",
    },
    {
      start: 0.6,
      end: 0.85,
      position: "right",
      title: "Your Complete Financial Picture",
      subtitle: "A unified view of all your accounts for real-time insights.",
    },
    {
      start: 0.9,
      end: 1.0,
      position: "center",
      title: "Your Financial Truth, Instantly.",
      subtitle: "Fast, honest, and comprehensive record-keeping at your fingertips.",
    },
  ];

const getFrameSrc = (index: number): string => {
  // We'll skip frames to make the animation work with fewer images
  const frameIndex = 1000 + Math.floor(index * (453 / TOTAL_FRAMES));
  return `https://olcukmvtctbvutjcrmph.supabase.co/storage/v1/object/public/assest/hero%20animation/accounts%20png/Sequence%2001_${frameIndex}.png`;
};

const lerp = (start: number, end: number, amt: number): number => {
  return (1 - amt) * start + amt * end;
};

const Loader = ({ progress }: { progress: number }) => (
    <div className="fixed bottom-0 left-0 w-full h-1 bg-white/20 z-30">
        <div className="h-1 bg-white transition-all duration-300" style={{width: `${progress}%`}}></div>
    </div>
  );

const TextOverlay = ({ beat, scrollYProgress }: { beat: TextOverlay, scrollYProgress: MotionValue<number> }) => {
  const opacity = useTransform(
    scrollYProgress,
    // The first item should be visible from the start
    beat.start === 0 ? [beat.start, beat.end, beat.end + 0.05] : [beat.start - 0.05, beat.start, beat.end, beat.end + 0.05],
    beat.start === 0 ? [1, 1, 0] : [0, 1, 1, 0]
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;
      
      ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
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
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {loading && <Loader progress={(framesLoaded / TOTAL_FRAMES) * 100} />}
        <canvas ref={canvasRef} className={cn("h-full w-full", loading && "opacity-0")} />
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        {!loading && NARRATIVE_BEATS.map((beat, index) => (
          <TextOverlay key={index} beat={beat} scrollYProgress={scrollYProgress} />
        ))}
      </div>
    </div>
  );
}
