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

    // 初始光的位置
    glow.style.setProperty("--glow-x", "50%");
    glow.style.setProperty("--glow-y", "50%");

    // =========================
    // Logo 自己漂
    // =========================
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

    // =========================
    // 滑鼠 / 手指控制
    // =========================
    const followPointer = (event: PointerEvent) => {
      userActive = true;
      stopAutoMove();

      const areaRect = area.getBoundingClientRect();
      const moverRect = mover.getBoundingClientRect();

      // 桌機讓 Logo 稍微離開游標
      const offsetX =
        event.pointerType === "mouse" ? 35 : 0;

      // 手機讓 Logo 在手指上方
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

      // 計算 Logo 中心位置
      const glowX =
        targetX + moverRect.width / 2;

      const glowY =
        targetY + moverRect.height / 2;

      // 整張背景上的光跟著 Logo
      gsap.to(glow, {
        "--glow-x": `${glowX}px`,
        "--glow-y": `${glowY}px`,
        opacity: 1,
        duration: 0.4,
        ease: "power3.out",
        overwrite: true,
      });
    };

    // =========================
    // 結束互動
    // =========================
    const endInteraction = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      gsap.to(glow, {
        opacity: 0,
        duration: 1,
        ease: "power2.out",
      });

      idleTimer = setTimeout(() => {
        userActive = false;
        autoMove();
      }, 700);
    };

    // =========================
    // Touch 開始
    // =========================
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        touchActive = true;
        followPointer(event);
      }
    };

    // =========================
    // Pointer 移動
    // =========================
    const handlePointerMove = (event: PointerEvent) => {
      // 電腦滑鼠
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

      // 手機必須正在碰螢幕
      if (touchActive) {
        followPointer(event);
      }
    };

    // =========================
    // Touch 放開
    // =========================
    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        touchActive = false;
        endInteraction();
      }
    };

    // =========================
    // 初始狀態
    // =========================
    gsap.set(mover, {
      x: 40,
      y: 40,
    });

    gsap.set(glow, {
      opacity: 0,
    });

    window.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp
    );

    window.addEventListener(
      "pointercancel",
      handlePointerUp
    );

    autoMove();

    return () => {
      window.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp
      );

      window.removeEventListener(
        "pointercancel",
        handlePointerUp
      );

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
      {/* ========================
          全螢幕發光背景
      ======================== */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",

          inset: 0,

          background:
            "radial-gradient(" +
            "circle 240px at var(--glow-x, 50%) var(--glow-y, 50%), " +
            "rgba(255,216,74,0.90) 0%, " +
            "rgba(255,216,74,0.62) 12%, " +
            "rgba(255,216,74,0.34) 28%, " +
            "rgba(255,216,74,0.15) 48%, " +
            "rgba(255,216,74,0.055) 66%, " +
            "rgba(255,216,74,0.015) 80%, " +
            "rgba(255,216,74,0) 100%" +
            ")",

          opacity: 0,

          pointerEvents: "none",

          zIndex: 1,

          willChange: "opacity, background",
        }}
      />

      {/* ========================
          Logo 移動物件
      ======================== */}
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

          zIndex: 2,
        }}
      >
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
          }}
        />
      </div>
    </div>
  );
}