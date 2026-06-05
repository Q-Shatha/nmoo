"use client";

import Image from "next/image";
import { MouseEvent, TouchEvent, useRef, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const selectedImage = images[selectedIndex] ?? images[0];
  const canSwipe = images.length > 1;

  function goToImage(index: number) {
    setSelectedIndex((index + images.length) % images.length);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (!canSwipe) {
      return;
    }

    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (!canSwipe || touchStartX.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX;

    if (typeof endX !== "number") {
      touchStartX.current = null;
      return;
    }

    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 44) {
      return;
    }

    if (delta > 0) {
      goToImage(selectedIndex + 1);
    } else {
      goToImage(selectedIndex - 1);
    }
  }

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (!canSwipe) {
      return;
    }

    mouseStartX.current = event.clientX;
  }

  function handleMouseUp(event: MouseEvent<HTMLDivElement>) {
    if (!canSwipe || mouseStartX.current === null) {
      return;
    }

    const delta = event.clientX - mouseStartX.current;
    mouseStartX.current = null;

    if (Math.abs(delta) < 44) {
      return;
    }

    if (delta > 0) {
      goToImage(selectedIndex + 1);
    } else {
      goToImage(selectedIndex - 1);
    }
  }

  function handleMouseLeave() {
    mouseStartX.current = null;
  }

  return (
    <div className="store-product-gallery order-1 lg:order-2">
      <div
        className={`store-product-main-image panel relative aspect-[3/4] touch-pan-y select-none overflow-hidden ${canSwipe ? "cursor-grab active:cursor-grabbing" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
      >
        <Image className="object-cover" alt={title} src={selectedImage} fill priority sizes="(min-width: 1024px) 46vw, 92vw" unoptimized />
        {canSwipe ? (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
            {images.slice(0, 8).map((_, index) => (
              <button
                key={index}
                aria-label={`انتقال إلى صورة ${index + 1}`}
                className={`h-2 rounded-full transition-all ${index === selectedIndex ? "w-6 bg-white" : "w-2 bg-white/60"}`}
                type="button"
                onClick={() => goToImage(index)}
              />
            ))}
          </div>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="store-product-thumbnails mt-4 grid grid-cols-4 gap-3">
          {images.slice(0, 8).map((src, index) => (
            <button
              key={`${src}-${index}`}
              aria-label={`عرض صورة ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                index === selectedIndex ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-outline-variant"
              }`}
              type="button"
              onClick={() => goToImage(index)}
            >
              <Image className="object-cover" alt={`${title} ${index + 1}`} src={src} fill sizes="25vw" unoptimized />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
