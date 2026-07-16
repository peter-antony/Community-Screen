import React, { useEffect, useRef } from 'react';

export const NetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic grid parameters
    const gridSize = 100;

    // Define relative positions for global map hubs
    const hubs = [
      { name: 'New York', rx: 0.26, ry: 0.38, color: 'rgba(6, 182, 212,' },
      { name: 'London', rx: 0.48, ry: 0.30, color: 'rgba(168, 85, 247,' },
      { name: 'Tokyo', rx: 0.82, ry: 0.37, color: 'rgba(6, 182, 212,' },
      { name: 'Sydney', rx: 0.88, ry: 0.78, color: 'rgba(168, 85, 247,' },
      { name: 'Cape Town', rx: 0.54, ry: 0.74, color: 'rgba(6, 182, 212,' },
      { name: 'São Paulo', rx: 0.34, ry: 0.70, color: 'rgba(168, 85, 247,' },
      { name: 'Mumbai', rx: 0.70, ry: 0.48, color: 'rgba(6, 182, 212,' },
    ];

    // Define active connection arcs
    const connections = [
      { from: 0, to: 1 }, // NYC -> London
      { from: 1, to: 6 }, // London -> Mumbai
      { from: 6, to: 2 }, // Mumbai -> Tokyo
      { from: 2, to: 3 }, // Tokyo -> Sydney
      { from: 1, to: 4 }, // London -> Cape Town
      { from: 0, to: 5 }, // NYC -> São Paulo
      { from: 5, to: 4 }, // São Paulo -> Cape Town
      { from: 2, to: 0 }, // Tokyo -> NYC
    ];

    // Array of active data packets
    interface Packet {
      fromIdx: number;
      toIdx: number;
      progress: number;
      speed: number;
      size: number;
      color: string;
      delay: number;
    }

    const mouse = { x: -1000, y: -1000, active: false };

    const packets: Packet[] = [];
    connections.forEach((conn) => {
      // Spawn 3 data packet bubbles per connection for a rich stream
      for (let k = 0; k < 3; k++) {
        packets.push({
          fromIdx: conn.from,
          toIdx: conn.to,
          progress: Math.random(),
          speed: Math.random() * 0.003 + 0.0015,
          size: Math.random() * 2.5 + 1.2,
          color: hubs[conn.from].color,
          delay: Math.random() * 150,
        });
      }
    });

    // Floating background particles
    class AmbientNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.radius = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw(isLight: boolean) {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? `rgba(75, 85, 99, ${this.alpha})`
          : `rgba(6, 182, 212, ${this.alpha})`;
        ctx.fill();
      }
    }

    const ambients: AmbientNode[] = [];
    for (let i = 0; i < 75; i++) {
      ambients.push(new AmbientNode());
    }

    let pulseTime = 0;

    // Bezier calculations
    const getBezierPoint = (
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number },
      t: number
    ) => {
      const cx = 3 * (p1.x - p0.x);
      const bx = 3 * (p2.x - p1.x) - cx;
      const ax = p3.x - p0.x - cx - bx;

      const cy = 3 * (p1.y - p0.y);
      const by = 3 * (p2.y - p1.y) - cy;
      const ay = p3.y - p0.y - cy - by;

      const x = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
      const y = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;

      return { x, y };
    };

    const getBezierControlPoints = (
      p0: { x: number; y: number },
      p3: { x: number; y: number }
    ) => {
      const dx = p3.x - p0.x;
      const dy = p3.y - p0.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Find midpoint
      const mx = (p0.x + p3.x) / 2;
      const my = (p0.y + p3.y) / 2;

      // Perpendicular vector
      const nx = -dy / dist;
      const ny = dx / dist;

      // Arc height factor (higher for longer distances)
      const arcHeight = dist * 0.22;

      // Control points
      const p1 = {
        x: mx + nx * arcHeight - dx * 0.1,
        y: my + ny * arcHeight - dy * 0.1,
      };
      const p2 = {
        x: mx + nx * arcHeight + dx * 0.1,
        y: my + ny * arcHeight + dy * 0.1,
      };

      return { p1, p2 };
    };

    const drawMapOverlays = (isLight: boolean) => {
      if (!ctx) return;

      // Convert percentage hubs to actual pixels
      const absHubs = hubs.map((h) => ({
        x: h.rx * width,
        y: h.ry * height,
        color: h.color,
      }));

      // 1. Draw connection lines
      connections.forEach((conn) => {
        const start = absHubs[conn.from];
        const end = absHubs[conn.to];
        const { p1, p2 } = getBezierControlPoints(start, end);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, end.x, end.y);
        ctx.strokeStyle = isLight ? 'rgba(100, 116, 139, 0.16)' : 'rgba(6, 182, 212, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 2. Draw active glowing data packets traveling along curves
      packets.forEach((p) => {
        if (p.delay > 0) {
          p.delay -= 1;
          return;
        }

        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.delay = Math.random() * 120;
          p.speed = Math.random() * 0.003 + 0.0015;
        }

        const start = absHubs[p.fromIdx];
        const end = absHubs[p.toIdx];
        const { p1, p2 } = getBezierControlPoints(start, end);
        const pt = getBezierPoint(start, p1, p2, end, p.progress);

        // Render glowing packet
        const alpha = isLight ? '0.75' : '0.8';
        const particleColor = `${p.color} ${alpha})`;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        if (isLight) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        } else {
          ctx.shadowBlur = 8;
          ctx.shadowColor = particleColor;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Draw pulsing city node hubs
      pulseTime += 0.015;
      absHubs.forEach((h) => {
        // Core hub dot
        ctx.beginPath();
        ctx.arc(h.x, h.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? 'rgba(71, 85, 105, 0.9)' : 'rgba(6, 182, 212, 0.8)';
        ctx.fill();

        // Pulsing Ring 1
        const r1 = (pulseTime * 20) % 25;
        const a1 = (1 - r1 / 25) * 0.35;
        ctx.beginPath();
        ctx.arc(h.x, h.y, r1, 0, Math.PI * 2);
        ctx.strokeStyle = isLight
          ? `${h.color} ${(a1 * 0.7).toFixed(3)})`
          : `rgba(6, 182, 212, ${a1.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pulsing Ring 2
        const r2 = ((pulseTime * 20) + 12) % 25;
        const a2 = (1 - r2 / 25) * 0.35;
        ctx.beginPath();
        ctx.arc(h.x, h.y, r2, 0, Math.PI * 2);
        ctx.strokeStyle = isLight
          ? `rgba(168, 85, 247, ${(a2 * 0.7).toFixed(3)})`
          : `rgba(168, 85, 247, ${a2.toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const isLightTheme = document.documentElement.classList.contains('light-theme');

      // 1. Draw subtle cyber grid
      ctx.strokeStyle = isLightTheme ? 'rgba(0, 0, 0, 0.012)' : 'rgba(255, 255, 255, 0.008)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw ambient drifting digital nodes
      ambients.forEach((a) => {
        a.update();
        a.draw(isLightTheme);
      });

      // 3. Draw map data overlay
      drawMapOverlays(isLightTheme);

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};
