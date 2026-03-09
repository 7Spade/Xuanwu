/**
 * Module: media-carousel
 * Purpose: Provide a stable media carousel with enforced aspect ratio to prevent layout shifts.
 * Responsibilities: compose carousel and aspect-ratio primitives for image galleries.
 * Constraints: deterministic logic, respect module boundaries
 */
import Image from "next/image"

import { AspectRatio } from "@/shadcn-ui/aspect-ratio"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shadcn-ui/carousel"

interface MediaSlide {
  id: string
  src: string
  alt: string
}

interface MediaCarouselProps {
  slides: MediaSlide[]
  ratio?: number
}

export function MediaCarousel({ slides, ratio = 16 / 9 }: MediaCarouselProps) {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <AspectRatio ratio={ratio} className="overflow-hidden rounded-2xl">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </AspectRatio>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
