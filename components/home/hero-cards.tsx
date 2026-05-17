"use client"

import Image from "next/image"

const CARDS = [
  {
    src: "https://images.pokemontcg.io/swsh12/44_hires.png",
    alt: "Pikachu VMAX",
    position: "left",
  },
  {
    src: "https://images.pokemontcg.io/swsh4/20_hires.png",
    alt: "Charizard VMAX",
    position: "center",
  },
  {
    src: "https://images.pokemontcg.io/swsh9/79_hires.png",
    alt: "Mewtwo V",
    position: "right",
  },
]

export function HeroCards() {
  return (
    <>
      <style jsx global>{`
        @keyframes hero-float-left {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-18px) rotate(-12deg); }
        }
        @keyframes hero-float-center {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50% { transform: translateX(-50%) translateY(-18px); }
        }
        @keyframes hero-float-right {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-18px) rotate(12deg); }
        }

        .hero-card-wrapper {
          transition: filter 0.35s ease;
        }
        .hero-card-inner {
          transition: transform 0.35s ease;
          cursor: pointer;
        }

        /* Left card */
        .hero-pos-left {
          left: 10%;
          top: 12%;
          width: clamp(140px, 18vw, 200px);
          animation: hero-float-left 6s ease-in-out infinite;
          filter: drop-shadow(0 0 40px rgba(124,58,237,0.5));
          z-index: 10;
        }
        .hero-pos-left:hover {
          filter: drop-shadow(0 0 60px rgba(124,58,237,0.7));
        }
        .hero-pos-left:hover .hero-card-inner {
          transform: translateY(-6px) scale(1.01);
        }

        /* Center card */
        .hero-pos-center {
          left: 50%;
          top: 0%;
          width: clamp(180px, 22vw, 280px);
          animation: hero-float-center 5s ease-in-out infinite;
          filter: drop-shadow(0 0 50px rgba(245,158,11,0.6));
          z-index: 30;
        }
        .hero-pos-center:hover {
          filter: drop-shadow(0 0 65px rgba(245,158,11,0.75));
        }
        .hero-pos-center:hover .hero-card-inner {
          transform: translateY(-6px) scale(1.01);
        }

        /* Right card */
        .hero-pos-right {
          right: 10%;
          top: 12%;
          width: clamp(140px, 18vw, 200px);
          animation: hero-float-right 6s ease-in-out infinite;
          filter: drop-shadow(0 0 40px rgba(124,58,237,0.5));
          z-index: 10;
        }
        .hero-pos-right:hover {
          filter: drop-shadow(0 0 60px rgba(124,58,237,0.7));
        }
        .hero-pos-right:hover .hero-card-inner {
          transform: translateY(-6px) scale(1.01);
        }
      `}</style>

      <div className="relative w-full h-[340px] md:h-[440px] overflow-hidden">
        {/* ── Ambient glow layer ── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Purple glow — left */}
          <div
            className="absolute rounded-full opacity-40"
            style={{
              width: 320,
              height: 320,
              left: "8%",
              top: "15%",
              background: "radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)",
              filter: "blur(100px)",
            }}
          />
          {/* Gold glow — center-right */}
          <div
            className="absolute rounded-full opacity-30"
            style={{
              width: 380,
              height: 380,
              left: "45%",
              top: "10%",
              background: "radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)",
              filter: "blur(120px)",
            }}
          />
          {/* Soft purple glow — right */}
          <div
            className="absolute rounded-full opacity-25"
            style={{
              width: 260,
              height: 260,
              right: "5%",
              top: "20%",
              background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
        </div>

        {/* ── Cards ── */}
        {CARDS.map((card) => (
          <div
            key={card.alt}
            className={`hero-card-wrapper hero-pos-${card.position} absolute`}
          >
            <div className="hero-card-inner">
              <Image
                src={card.src}
                alt={card.alt}
                width={300}
                height={420}
                className="rounded-3xl w-full h-auto"
                priority={card.position === "center"}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
