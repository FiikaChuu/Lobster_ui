import React, { useEffect, useRef } from 'react';

/**
 * PondWaterOverlay - Realistic 3D Aquaculture Simulation
 *
 * Simulates:
 * 1. 12 rotating paddlewheel blades on the 4 aerators in isometric 3D projection.
 * 2. High-speed churning white foam and splashing water spray beneath each aerator.
 * 3. Hydrodynamic circular water circulation current around the central buoy.
 * 4. Concentric elliptical isometric ripples propagating across the pond water.
 * 5. Multi-octave fluid caustic ribbons and specular sunlight glints.
 * 6. Native prefers-reduced-motion fallback and zero-CPU waste.
 */
export const PondWaterOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isReducedMotion = false;
    let width = 0;
    let height = 0;
    let time = 0;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    // Resize handler with high DPI support
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(canvas);
    updateSize();

    // The 4 aerator assemblies in pond_3d.jpg (normalized coordinates 0..1 in 1024x1024)
    const aerators = [
      {
        id: 'north',
        name: 'Aerator Utara',
        wheels: [
          { u: 0.455, v: 0.340 },
          { u: 0.485, v: 0.358 },
          { u: 0.515, v: 0.376 }
        ],
        speed: 4.8,
        phaseOffset: 0.0,
        sprayDir: { dx: -0.85, dy: -0.52 }, // Shoots backward-upward
        foamCenter: { u: 0.485, v: 0.360 }
      },
      {
        id: 'east',
        name: 'Aerator Timur',
        wheels: [
          { u: 0.678, v: 0.463 },
          { u: 0.705, v: 0.480 },
          { u: 0.732, v: 0.497 }
        ],
        speed: 5.1,
        phaseOffset: 1.4,
        sprayDir: { dx: -0.72, dy: 0.68 }, // Shoots downwards-left towards center
        foamCenter: { u: 0.705, v: 0.482 }
      },
      {
        id: 'south',
        name: 'Aerator Selatan',
        wheels: [
          { u: 0.450, v: 0.620 },
          { u: 0.478, v: 0.638 },
          { u: 0.506, v: 0.656 }
        ],
        speed: 4.7,
        phaseOffset: 2.6,
        sprayDir: { dx: -0.65, dy: 0.76 }, // Shoots downwards-left
        foamCenter: { u: 0.478, v: 0.640 }
      },
      {
        id: 'west',
        name: 'Aerator Barat',
        wheels: [
          { u: 0.226, v: 0.478 },
          { u: 0.252, v: 0.496 },
          { u: 0.278, v: 0.514 }
        ],
        speed: 5.0,
        phaseOffset: 3.8,
        sprayDir: { dx: 0.78, dy: -0.62 }, // Shoots upwards-right towards center
        foamCenter: { u: 0.252, v: 0.498 }
      }
    ];

    // Ripple state for all 4 aerators
    const aeratorRipples = aerators.flatMap((a) => [
      { aeratorId: a.id, age: 0.1, speed: 0.007, maxRadius: 75 },
      { aeratorId: a.id, age: 0.4, speed: 0.007, maxRadius: 75 },
      { aeratorId: a.id, age: 0.7, speed: 0.007, maxRadius: 75 },
      { aeratorId: a.id, age: 0.95, speed: 0.007, maxRadius: 75 }
    ]);

    // Spray particles pool for active splashing
    const sprayParticles = Array.from({ length: 48 }).map((_, i) => ({
      aeratorIdx: i % 4,
      wheelIdx: Math.floor(i / 4) % 3,
      age: (i * 0.08) % 1,
      speed: 0.03 + (i % 5) * 0.008,
      spread: ((i % 7) - 3) * 0.18,
      size: 1.2 + (i % 3) * 0.8
    }));

    // Sunlight glint points on water surface
    const glints = Array.from({ length: 16 }).map((_, i) => ({
      u: 0.30 + (i % 5) * 0.095 + (i * 0.012),
      v: 0.38 + Math.floor(i / 5) * 0.09 + ((i % 3) * 0.02),
      phase: i * 0.8,
      speed: 1.3 + (i % 4) * 0.35,
      size: 1.8 + (i % 3) * 0.9
    }));

    // Main animation loop
    const render = () => {
      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Coordinate mapping from 1:1 image (object-fit: cover, object-position: center 38%)
      const containerRatio = width / height;
      const imgRatio = 1.0;

      let imgW: number;
      let imgH: number;
      let imgX: number;
      let imgY: number;

      if (containerRatio > imgRatio) {
        imgW = width;
        imgH = width / imgRatio;
        imgX = 0;
        imgY = (height - imgH) * 0.38;
      } else {
        imgH = height;
        imgW = height * imgRatio;
        imgX = (width - imgW) * 0.5;
        imgY = (height - imgH) * 0.38;
      }

      const toScreen = (u: number, v: number) => ({
        x: imgX + u * imgW,
        y: imgY + v * imgH
      });

      // Tank inner water basin boundary polygon
      const pTop = toScreen(0.490, 0.312);
      const pRight = toScreen(0.825, 0.485);
      const pBottom = toScreen(0.495, 0.718);
      const pLeft = toScreen(0.165, 0.515);

      ctx.save();

      // Clip strictly to the water surface basin
      ctx.beginPath();
      ctx.moveTo(pTop.x, pTop.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.lineTo(pBottom.x, pBottom.y);
      ctx.lineTo(pLeft.x, pLeft.y);
      ctx.closePath();
      ctx.clip();

      if (!isReducedMotion) {
        time += 0.025;
      }

      // 1. Fluid Ambient Water Shimmer & Circulation Lighting
      const lightShiftX = imgX + imgW * (0.50 + Math.sin(time * 0.22) * 0.05);
      const lightShiftY = imgY + imgH * (0.50 + Math.cos(time * 0.18) * 0.04);
      const ambientGrad = ctx.createRadialGradient(
        lightShiftX, lightShiftY, imgW * 0.04,
        lightShiftX, lightShiftY, imgW * 0.42
      );
      ambientGrad.addColorStop(0, 'rgba(186, 230, 253, 0.18)');
      ambientGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.07)');
      ambientGrad.addColorStop(1, 'rgba(2, 132, 199, 0.00)');

      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Animated Fluid Caustic Ribbons (Hydrodynamic circular wave pattern)
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1.6;

      const numLines = 8;
      const angle = -0.48; // -27.5 deg isometric slant
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      for (let i = 0; i < numLines; i++) {
        const offset = (i / numLines) * imgH * 0.42 + imgH * 0.30;
        ctx.beginPath();

        let started = false;
        const steps = 36;
        for (let s = 0; s <= steps; s++) {
          const u = (s / steps) * imgW * 0.65 - imgW * 0.08;
          const wave =
            Math.sin(u * 0.022 + time * 1.5 + i * 0.75) * 4.2 +
            Math.cos(u * 0.014 - time * 1.0 + i * 1.1) * 2.8;

          const px = imgX + imgW * 0.49 + u * cosA - (offset + wave) * sinA;
          const py = imgY + imgH * 0.50 + u * sinA + (offset + wave) * cosA;

          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }
      ctx.restore();

      // 3. Expanding Concentric Ripples from all 4 Aerators
      aeratorRipples.forEach((r) => {
        if (!isReducedMotion) {
          r.age += r.speed;
          if (r.age >= 1) r.age = 0;
        }

        const aerator = aerators.find((a) => a.id === r.aeratorId);
        if (!aerator) return;

        const center = toScreen(aerator.foamCenter.u, aerator.foamCenter.v);
        const currentR = r.age * r.maxRadius * (imgW / 650);
        const alpha = Math.sin(r.age * Math.PI) * 0.32;

        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.35;
        ctx.beginPath();
        // Isometric 30-degree ellipse
        ctx.ellipse(center.x, center.y, currentR * 1.45, currentR * 0.78, -0.45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 4. ROTATING PADDLEWHEEL BLADES & AERATOR TURBINES
      const wheelRadius = imgW * 0.016; // Exact proportional radius (~16px)
      const numBlades = 8;
      const cosIso = Math.cos(-0.55); // Isometric depth projection
      const sinIso = Math.sin(-0.55);

      aerators.forEach((aerator) => {
        const wheelAngle = isReducedMotion ? 0 : time * aerator.speed + aerator.phaseOffset;

        // Render each of the 3 paddlewheels along this aerator shaft
        aerator.wheels.forEach((wheelNorm, wIdx) => {
          const wPos = toScreen(wheelNorm.u, wheelNorm.v);

          // Churning Froth / Foam underneath this paddlewheel
          const foamPulse = Math.sin(time * 16 + aerator.phaseOffset + wIdx * 1.2) * 2.5;
          const foamR = (wheelRadius * 1.55) + foamPulse;

          const foamGrad = ctx.createRadialGradient(
            wPos.x, wPos.y, 1,
            wPos.x, wPos.y, foamR
          );
          foamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
          foamGrad.addColorStop(0.45, 'rgba(224, 242, 254, 0.55)');
          foamGrad.addColorStop(0.8, 'rgba(186, 230, 253, 0.25)');
          foamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.00)');

          ctx.fillStyle = foamGrad;
          ctx.beginPath();
          ctx.ellipse(wPos.x, wPos.y, foamR * 1.35, foamR * 0.72, -0.45, 0, Math.PI * 2);
          ctx.fill();

          // Draw the 8 rotating paddle blades in isometric perspective
          for (let b = 0; b < numBlades; b++) {
            const bladePhi = wheelAngle + (b * Math.PI * 2) / numBlades;
            const cosPhi = Math.cos(bladePhi);
            const sinPhi = Math.sin(bladePhi);

            // Hub base point
            const hubR = wheelRadius * 0.28;
            const bx0 = wPos.x + hubR * (cosPhi * cosIso);
            const by0 = wPos.y + hubR * (cosPhi * sinIso - sinPhi * 1.15);

            // Blade tip point
            const bx1 = wPos.x + wheelRadius * (cosPhi * cosIso);
            const by1 = wPos.y + wheelRadius * (cosPhi * sinIso - sinPhi * 1.15);

            // Paddle scoop perpendicular vector for realistic paddle width
            const scoopW = wheelRadius * 0.26;
            const px0 = bx1 - scoopW * sinPhi * 0.45;
            const py0 = by1 + scoopW * cosPhi * 0.35;
            const px1 = bx1 + scoopW * sinPhi * 0.45;
            const py1 = by1 - scoopW * cosPhi * 0.35;

            // Blade entering water has opacity refraction; blade in air has crisp high-contrast
            const inAir = sinPhi > 0;
            ctx.save();
            ctx.strokeStyle = inAir ? '#1e293b' : 'rgba(30, 41, 59, 0.65)';
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';

            // Spoke
            ctx.beginPath();
            ctx.moveTo(bx0, by0);
            ctx.lineTo(bx1, by1);
            ctx.stroke();

            // Paddle scoop paddlehead
            ctx.strokeStyle = inAir ? '#334155' : 'rgba(51, 65, 85, 0.65)';
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(px0, py0);
            ctx.lineTo(px1, py1);
            ctx.stroke();

            // Highlight on blade edge facing light
            if (inAir && cosPhi > 0.2) {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.lineWidth = 1.0;
              ctx.beginPath();
              ctx.moveTo(bx0, by0);
              ctx.lineTo(bx1, by1);
              ctx.stroke();
            }

            ctx.restore();
          }

          // Central metallic hub disc
          ctx.save();
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(wPos.x, wPos.y, wheelRadius * 0.28, wheelRadius * 0.22, -0.45, 0, Math.PI * 2);
          ctx.fill();

          // Hub center bolt
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(wPos.x, wPos.y, wheelRadius * 0.12, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      });

      // 5. Active Water Droplet Splashes Ejected from Aerators
      if (!isReducedMotion) {
        ctx.save();
        ctx.fillStyle = '#ffffff';

        sprayParticles.forEach((sp) => {
          sp.age += sp.speed;
          if (sp.age >= 1) sp.age = 0;

          const aerator = aerators[sp.aeratorIdx];
          const wheel = aerator.wheels[sp.wheelIdx];
          const basePos = toScreen(wheel.u, wheel.v);

          // Droplet trajectory along spray direction with splash spread
          const travelDist = sp.age * (wheelRadius * 3.8);
          const px = basePos.x + (aerator.sprayDir.dx * travelDist) + (sp.spread * travelDist * 0.4);
          const py = basePos.y + (aerator.sprayDir.dy * travelDist) + (sp.spread * travelDist * 0.3) - (Math.sin(sp.age * Math.PI) * 5);

          const alpha = (1 - sp.age) * 0.85;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(px, py, sp.size * (1 - sp.age * 0.3), 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }

      // 6. Sunlight Caustic Shimmer Glints
      ctx.save();
      ctx.fillStyle = '#ffffff';
      glints.forEach((g) => {
        const intensity = Math.max(0, Math.sin(time * g.speed + g.phase));
        if (intensity > 0.05) {
          const gx = imgX + imgW * g.u + Math.sin(time * 0.7 + g.phase) * 3;
          const gy = imgY + imgH * g.v + Math.cos(time * 0.6 + g.phase) * 2;
          const r = g.size * intensity;

          ctx.globalAlpha = intensity * 0.60;
          ctx.beginPath();
          ctx.arc(gx, gy, r, 0, Math.PI * 2);
          ctx.fill();

          // Glint cross flare
          ctx.fillRect(gx - r * 2.2, gy - 0.5, r * 4.4, 1);
          ctx.fillRect(gx - 0.5, gy - r * 2.2, 1, r * 4.4);
        }
      });
      ctx.restore();

      ctx.restore(); // Restore water basin clip

      if (!isReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pond-water-canvas"
      aria-hidden="true"
    />
  );
};

