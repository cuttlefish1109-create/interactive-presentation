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

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let autoTween: gsap.core.Tween | null = null;
    let userActive = false;

    // Logo 尺寸
    const logoBoxSize = 180;

    // -------------------------
    // 平滑跟隨滑鼠
    // -------------------------
    const moveX = gsap.quickTo(mover, "x", {
      duration: 0.45,
      ease: "power3.out",
    });

    const moveY = gsap.quickTo(mover, "y", {
      duration: 0.45,
      ease: "power3.out",
    });

    // -------------------------
    // 自動漂移
    // -------------------------
    const autoMove = () => {
      if (userActive) return;

      const rect = area.getBoundingClientRect();

      const margin = 30;

      const maxX = Math.max(
        margin,
        rect.width - logoBoxSize - margin
      );

      const maxY = Math.max(
        margin,
        rect.height - logoBoxSize - margin
      );

      autoTween = gsap.to(mover, {
        x: gsap.utils.random(margin, maxX),
        y: gsap.utils.random(margin, maxY),

        duration: gsap.utils.random(3.5, 6),

        ease: "sine.inOut",

        onComplete: autoMove,
      });
    };

    // -------------------------
    // 滑鼠移動
    // -------------------------
    const handlePointerMove = (event: PointerEvent) => {
      userActive = true;

      // 停止自動漂移
      if (autoTween) {
        autoTween.kill();
        autoTween = null;
      }

      const rect = area.getBoundingClientRect();

      // 讓 Logo 中心跟著滑鼠
      let targetX =
        event.clientX -
        rect.left -
        logoBoxSize / 2;

      let targetY =
        event.clientY -
        rect.top -
        logoBoxSize / 2;

      // 防止 Logo 超出畫面
      targetX = gsap.utils.clamp(
        0,
        rect.width - logoBoxSize,
        targetX
      );

      targetY = gsap.utils.clamp(
        0,
        rect.height - logoBoxSize,
        targetY
      );

      // 真正讓 Logo 跟著滑鼠
      moveX(targetX);
      moveY(targetY);

      // 滑鼠移動時發光
      gsap.to(glow, {
        opacity: 1,
        duration: 0.2,
        overwrite: true,
      });

      // 每次移動重新計時
      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      idleTimer = setTimeout(() => {
        userActive = false;

        // 光慢慢消失
        gsap.to(glow, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        });

        // 再回到自動漂移
        autoMove();
      }, 1200);
    };

    // -------------------------
    // 初始化位置
    // -------------------------
    gsap.set(mover, {
      x: 80,
      y: 80,
    });

    gsap.set(glow, {
      opacity: 0,
    });

    // 用 window 抓滑鼠，最穩
    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    autoMove();

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
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
        height: "100vh",
        position: "relative",
        overflow: "hidden",

        backgroundColor: "#10271f",

        // 滑鼠正常顯示
        cursor: "default",
      }}
    >
      <div
        ref={moverRef}
        style={{
          position: "absolute",

          left: 0,
          top: 0,

          width: "180px",
          height: "180px",

          pointerEvents: "none",

          willChange: "transform",
        }}
      >
        {/* 發光 */}
        <div
          ref={glowRef}
          style={{
            position: "absolute",

            left: "50%",
            top: "50%",

            width: "420px",
            height: "420px",

            transform: "translate(-50%, -50%)",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(255,216,74,0.95) 0%, rgba(255,216,74,0.45) 30%, rgba(255,216,74,0.12) 55%, rgba(255,216,74,0) 75%)",

            filter: "blur(24px)",

            opacity: 0,

            pointerEvents: "none",

            zIndex: 1,
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

            width: "160px",
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