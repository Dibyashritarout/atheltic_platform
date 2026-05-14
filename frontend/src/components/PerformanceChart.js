import React, { useEffect, useRef } from 'react';

/**
 * Canvas-based Performance Chart
 * Draws animated line charts for performance trends
 */
export default function PerformanceChart({ performances, metric = 'jumpHeight', label = 'Jump Height', unit = 'cm', color = '#1D9E75' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !performances || performances.length < 2) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };

    const sorted = [...performances]
      .filter(p => p[metric] != null && p[metric] >= 0)
      .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

    if (sorted.length < 2) return;

    const values = sorted.map(p => p[metric]);
    const dates = sorted.map(p => new Date(p.recordedAt));
    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values) * 1.1;

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const getX = (i) => padding.left + (i / (sorted.length - 1)) * chartW;
    const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    let progress = 0;
    const duration = 1200;
    const startTime = Date.now();

    function draw() {
      const elapsed = Date.now() - startTime;
      progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      ctx.clearRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Y-axis labels
        const val = maxVal - ((maxVal - minVal) / 4) * i;
        ctx.fillStyle = 'rgba(240,237,230,0.3)';
        ctx.font = '11px DM Sans';
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(1), padding.left - 8, y + 4);
      }

      // X-axis labels
      ctx.fillStyle = 'rgba(240,237,230,0.3)';
      ctx.font = '10px DM Sans';
      ctx.textAlign = 'center';
      const step = Math.max(1, Math.floor(sorted.length / 5));
      for (let i = 0; i < sorted.length; i += step) {
        const x = getX(i);
        const d = dates[i];
        ctx.fillText(`${d.getDate()}/${d.getMonth() + 1}`, x, height - 8);
      }

      // Draw area gradient
      const drawCount = Math.floor(sorted.length * ease);
      if (drawCount >= 2) {
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(values[0]));
        for (let i = 1; i < drawCount; i++) {
          const prevX = getX(i - 1);
          const prevY = getY(values[i - 1]);
          const currX = getX(i);
          const currY = getY(values[i]);
          const cpX = (prevX + currX) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, currY, currX, currY);
        }
        ctx.lineTo(getX(drawCount - 1), padding.top + chartH);
        ctx.lineTo(getX(0), padding.top + chartH);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        gradient.addColorStop(0, color + '20');
        gradient.addColorStop(1, color + '02');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(values[0]));
        for (let i = 1; i < drawCount; i++) {
          const prevX = getX(i - 1);
          const prevY = getY(values[i - 1]);
          const currX = getX(i);
          const currY = getY(values[i]);
          const cpX = (prevX + currX) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, currY, currX, currY);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw dots
        for (let i = 0; i < drawCount; i++) {
          const x = getX(i);
          const y = getY(values[i]);

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#0A0A08';
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Value label on last point
          if (i === drawCount - 1) {
            ctx.fillStyle = color;
            ctx.font = 'bold 12px DM Sans';
            ctx.textAlign = 'center';
            ctx.fillText(`${values[i]} ${unit}`, x, y - 12);
          }
        }
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(draw);
      }
    }

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [performances, metric, label, unit, color]);

  const sorted = performances?.filter(p => p[metric] && p[metric] > 0) || [];

  if (sorted.length < 2) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.85rem' }}>
        Need at least 2 data points for {label} chart
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)', marginBottom: '0.5rem', fontWeight: 600 }}>
        {label} ({unit})
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '200px', display: 'block' }}
      />
    </div>
  );
}

/**
 * Radar Chart — compares multiple metrics
 */
export function RadarChart({ scores, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.38;

    const metrics = Object.entries(scores).filter(([, v]) => v !== null && v !== undefined);
    if (metrics.length < 3) return;

    const angleStep = (Math.PI * 2) / metrics.length;

    // Draw rings
    for (let ring = 1; ring <= 4; ring++) {
      const r = (radius / 4) * ring;
      ctx.beginPath();
      for (let i = 0; i < metrics.length; i++) {
        const angle = angleStep * i - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.stroke();
    }

    // Draw axes
    for (let i = 0; i < metrics.length; i++) {
      const angle = angleStep * i - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.stroke();
    }

    // Draw data polygon
    ctx.beginPath();
    for (let i = 0; i < metrics.length; i++) {
      const [, value] = metrics[i];
      const angle = angleStep * i - Math.PI / 2;
      const r = (value / 100) * radius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(29,158,117,0.15)';
    ctx.fill();
    ctx.strokeStyle = '#1D9E75';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw dots and labels
    for (let i = 0; i < metrics.length; i++) {
      const [key, value] = metrics[i];
      const angle = angleStep * i - Math.PI / 2;
      const r = (value / 100) * radius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1D9E75';
      ctx.fill();

      // Label
      const labelR = radius + 18;
      const lx = cx + Math.cos(angle) * labelR;
      const ly = cy + Math.sin(angle) * labelR;
      ctx.fillStyle = 'rgba(240,237,230,0.5)';
      ctx.font = '10px DM Sans';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const labelName = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
      ctx.fillText(labelName, lx, ly);
    }

  }, [scores, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}
