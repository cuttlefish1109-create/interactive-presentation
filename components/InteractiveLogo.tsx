"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function InteractiveLogo() {
  const areaRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const area = areaRef.current;
    const mover = moverRef.current;
    const glow = glowRef.current;

    if (!area || !mover || !glow) return;

    let userActive = false;
    let touchActive = false;

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let autoTween: gsap.core.Tween | null = null;

    const moveX = gsap.quickTo(mover, "x", {
      duration: 0.4,
      ease: "power3.out",
    });

    const moveY = gsap.quickTo(mover, "y", {
      duration: 0.4,
      ease: "power3.out",
    });

    const autoMove = () => {
      if (userActive) return;

      const areaRect = area.getBoundingClientRect();
      const moverRect = mover.getBoundingClientRect();

      const margin = window.innerWidth < 768 ? 16 : 30;

      const maxX = Math.max(
        margin,
        areaRect.width - moverRect.width - margin
      );

      const maxY = Math.max(
        margin,
        areaRect.height - moverRect.height - margin
      );

      autoTween = gsap.to(mover, {
        x: gsap.utils.random(margin, maxX),
        y: gsap.utils.random(margin, maxY),
        duration: gsap.utils.random(3.5, 6),
        ease: "sine.inOut",
        onComplete: autoMove,
      });
    };

    const stopAutoMove = () => {
      if (autoTween) {
        autoTween.kill();
        autoTween = null;
      }
    };

    const followPointer = (event: PointerEvent) => {
      userActive = true;
      stopAutoMove();

      const areaRect = area.getBoundingClientRect();
      const moverRect = mover.getBoundingClientRect();

      const offsetX =
        event.pointerType === "mouse" ? 35 : 0;

      const offsetY =
        event.pointerType === "mouse" ? 20 : -70;

      let targetX =
        event.clientX -
        areaRect.left -
        moverRect.width / 2 +
        offsetX;

      let targetY =
        event.clientY -
        areaRect.top -
        moverRect.height / 2 +
        offsetY;

      targetX = gsap.utils.clamp(
        0,
        areaRect.width - moverRect.width,
        targetX
      );

      targetY = gsap.utils.clamp(
        0,
        areaRect.height - moverRect.height,
        targetY
      );

      moveX(targetX);
      moveY(targetY);

      gsap.to(glow, {
        opacity: 1,
        duration: 0.2,
        ease: "power2.out",
        overwrite: true,
      });
    };

    const endInteraction = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      gsap.to(glow, {
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
      });

      idleTimer = setTimeout(() => {
        userActive = false;
        autoMove();
      }, 700);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        touchActive = true;
        followPointer(event);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        followPointer(event);

        if (idleTimer) {
          clearTimeout(idleTimer);
        }

        idleTimer = setTimeout(() => {
          endInteraction();
        }, 1000);

        return;
      }

      if (touchActive) {
        followPointer(event);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        touchActive = false;
        endInteraction();
      }
    };

    gsap.set(mover, {
      x: 40,
      y: 40,
    });

    gsap.set(glow, {
      opacity: 0,
    });

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    autoMove();

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      if (autoTween) {
        autoTween.kill();
      }

      gsap.killTweensOf(mover);
      gsap.killTweensOf(glow);
    };
  }, []);

  return (
    <div
      ref={areaRef}
      style={{
        width: "100%",
        height: "100dvh",

        position: "relative",
        overflow: "hidden",

        backgroundColor: "#10271f",

        touchAction: "none",

        cursor: "default",
      }}
    >
      <div
        ref={moverRef}
        style={{
          position: "absolute",

          left: 0,
          top: 0,

          width: "clamp(120px, 30vw, 180px)",
          height: "clamp(120px, 30vw, 180px)",

          pointerEvents: "none",

          willChange: "transform",
        }}
      >
        {/* 柔和發光區 */}
        <div
          ref={glowRef}
          style={{
            position: "absolute",

            left: "50%",
            top: "50%",

            width: "clamp(360px, 105vw, 620px)",
            height: "clamp(360px, 105vw, 620px)",

            transform: "translate(-50%, -50%)",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, " +
              "rgba(255,216,74,0.82) 0%, " +
              "rgba(255,216,74,0.50) 18%, " +
              "rgba(255,216,74,0.28) 34%, " +
              "rgba(255,216,74,0.12) 50%, " +
              "rgba(255,216,74,0.05) 66%, " +
              "rgba(255,216,74,0.015) 78%, " +
              "rgba(255,216,74,0) 90%)",

            filter: "none",

            opacity: 0,

            pointerEvents: "none",

            zIndex: 1,

            willChange: "opacity",
          }}
        />

        {/* Logo */}
        <img
          src="/logo.png"
          alt="Logo"
          draggable={false}
          style={{
            position: "absolute",

            left: "50%",
            top: "50%",

            width: "88%",
            height: "auto",

            transform: "translate(-50%, -50%)",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 2,
          }}
        />
      </div>
    </div>
  );
}