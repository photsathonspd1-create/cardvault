"use client"

import Image from "next/image"

export function HeroCards() {
  return (
    <>
      <style jsx global>{`
        @keyframes hero-float-left {
          0%, 100% {
            transform: translateY(0px) rotate(-12deg) scale(0.92);
          }
          50% {
            transform: translateY(-18px) rotate(-10deg) scale(0.935);
          }
        }
        @keyframes hero-float-center {
          0%, 100% {
            transform: translateX(-50%) translateY(0px) scale(1);
          }
          50% {
            transform: translateX(-50%) translateY(-14px) scale(1.015);
          }
        }
        @keyframes hero-float-right {
          0%, 100% {
            transform: translateY(0px) rotate(12deg) scale(0.92);
          }
          50% {
            transform: translateY(-18px) rotate(10deg) scale(0.935);
          }
        }

        .hero-card {
          transition: transform 0.4s ease, filter 0.4s ease;
          will-change: transform, filter;
        }

        .hero-card-left {
          left: 50%;
          top: 28px;
          margin-left: -310px;
          width: 230px;
          opacity: 0.92;
          z-index: 10;
          animation: hero-float-left 6s ease-in-out infinite;
          filter: drop-shadow(0 0 60px rgba(124,58,237,0.35))
                  drop-shadow(0 8px 32px rgba(0,0,0,0.5));
        }
        .hero-card-left:hover {
          transform: translateY(-8px) rotate(-12deg) scale(0.94);
          filter: drop-shadow(0 0 80px rgba(124,58,237,0.5))
                  drop-shadow(0 12px 40px rgba(0,0,0,0.6));
        }

        .hero-card-center {
          left: 50%;
          top: 0;
          width: 360px;
          opacity: 1;
          z-index: 30;
          animation: hero-float-center 5s ease-in-out infinite;
          filter: drop-shadow(0 0 70px rgba(245,158,11,0.3))
                  drop-shadow(0 12px 48px rgba(0,0,0,0.6));
        }
        .hero-card-center:hover {
          transform: translateX(-50%) translateY(-8px) scale(1.01);
          filter: drop-shadow(0 0 90px rgba(245,158,11,0.45))
                  drop-shadow(0 16px 56px rgba(0,0,0,0.7));
        }

        .hero-card-right {
          left: 50%;
          top: 28px;
          margin-left: 80px;
          width: 230px;
          opacity: 0.92;
          z-index: 10;
          animation: hero-float-right 6s ease-in-out infinite;
          filter: drop-shadow(0 0 60px rgba(124,58,237,0.35))
                  drop-shadow(0 8px 32px rgba(0,0,0,0.5));
        }
        .hero-card-right:hover {
          transform: translateY(-8px) rotate(12deg) scale(0.94);
          filter: drop-shadow(0 0 80px rgba(124,58,237,0.5))
                  drop-shadow(0 12px 40px rgba(0,0,0,0.6));
        }

        @media (max-width: 768px) {
          .hero-card-left {
            width: 140px;
            margin-left: -190px;
            top: 40px;
          }
          .hero-card-center {
            width: 220px;
          }
          .hero-card-right {
            width: 140px;
            margin-left: 50px;
            top: 40px;
          }
        }
      `}</style>

      <div className="relative w-full h-[380px] md:h-[460px]">
        {/* ── Ambient glow — soft, atmospheric ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Purple — left side */}
          <div
            className="absolute"
            style={{
              width: 400,
              height: 400,
              left: "15%",
              top: "10%",
              background: "radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
          {/* Amber — center */}
          <div
            className="absolute"
            style={{
              width: 500,
              height: 500,
              left: "50%",
              top: "5%",
              transform: "translateX(-50%)",
              background: "radial-gradient(ellipse, rgba(245,158,11,0.2) 0%, transparent 70%)",
              filter: "blur(120px)",
            }}
          />
          {/* Purple — right side */}
          <div
            className="absolute"
            style={{
              width: 350,
              height: 350,
              right: "10%",
              top: "15%",
              background: "radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
        </div>

        {/* ── Cards ── */}
        <div className="absolute inset-0">
          {/* LEFT — behind, tilted left */}
          <div className="hero-card hero-card-left absolute">
            <Image
              src="https://images.pokemontcg.io/swsh12/44_hires.png"
              alt="Pikachu VMAX"
              width={460}
              height={640}
              className="rounded-3xl w-full h-auto"
            />
          </div>

          {/* CENTER — dominant, front */}
          <div className="hero-card hero-card-center absolute">
            <Image
              src="https://images.pokemontcg.io/swsh4/20_hires.png"
              alt="Charizard VMAX"
              width={720}
              height={1008}
              className="rounded-3xl w-full h-auto"
              priority
            />
          </div>

          {/* RIGHT — behind, tilted right */}
          <div className="hero-card hero-card-right absolute">
            <Image
              src="https://images.pokemontcg.io/swsh9/79_hires.png"
              alt="Mewtwo V"
              width={460}
              height={640}
              className="rounded-3xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </>
  )
}
