"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Path or URL to the video file, e.g. "/videos/product-tour.mp4" */
  videoSrc: string;
  title?: string;
}

export default function VideoModal({
  isOpen,
  onClose,
  videoSrc,
  title = "Product Walkthrough",
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Close on Escape at any time, from anywhere — "cut the modal" per the
  // requirement that it can be dismissed whenever the user wants.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    // Prevent the page behind the modal from scrolling while it's open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  // Pause playback whenever the modal is closed, so it doesn't keep playing
  // silently in the background and always restarts fresh next time it opens.
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="neo-border bg-surface rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden"
        // Stop clicks inside the modal from bubbling up to the backdrop
        // (which would otherwise immediately close it).
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant">
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface font-mono">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="p-1.5 text-text-muted hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-black">
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            autoPlay
            className="w-full max-h-[70vh]"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}