import React, { useState, useEffect, useRef } from 'react';

export function OrbitalMainMenu({ onSelectMode, onOpenEditor, onOpenController }) {
  const [angle, setAngle] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const requestRef = useRef();

  useEffect(() => {
    let lastTime = performance.now();
    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      // Continuous smooth orbit rotation (slow down slightly on hover for easy clicking)
      const speed = hoveredIdx !== null ? 0.08 : 0.28; // rad per sec
      setAngle((prev) => (prev + speed * delta) % (Math.PI * 2));
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [hoveredIdx]);

  const menuItems = [
    { id: 'dj', label: 'Sound Mixer', action: () => onSelectMode('dj') },
    { id: 'vr1', label: 'Star Mixer', action: () => onSelectMode('vr1') },
    { id: 'vr2', label: 'Spatial Stems', action: () => onSelectMode('vr2') },
    { id: 'voicecloud', label: 'Voice Cloud', action: () => onSelectMode('voicecloud') },
  ];

  // Ellipse parameters matching screenshot
  const rx = 380; // horizontal radius in px
  const ry = 120; // vertical radius in px
  const tilt = -12; // tilt angle in deg

  return (
    <div className="orbital-menu-overlay">
      {/* Top Left Pixel/Modern Spaced Logo */}
      <div className="channel-logo">
        c h a n n e l
      </div>

      {/* Top Right Action Buttons (Star Edit & Control Room) */}
      <div className="top-right-actions">
        <button className="pill-btn" onClick={onOpenEditor}>
          Star Edit
        </button>
        <button className="pill-btn" onClick={onOpenController}>
          Control Room
        </button>
      </div>

      {/* Central Orbital Menu Container */}
      <div className="orbit-stage">
        {/* Tilted Ellipse Track Line */}
        <svg className="orbit-svg" viewBox="-500 -250 1000 500">
          <ellipse
            cx="0"
            cy="0"
            rx={rx}
            ry={ry}
            fill="none"
            stroke="rgba(255, 255, 255, 0.65)"
            strokeWidth="1.5"
            transform={`rotate(${tilt})`}
          />
        </svg>

        {/* 4 Orbital Menu Nodes */}
        {menuItems.map((item, index) => {
          const itemAngle = angle + (index * Math.PI) / 2;
          
          const unrotatedX = rx * Math.cos(itemAngle);
          const unrotatedY = ry * Math.sin(itemAngle);
          
          const tiltRad = (tilt * Math.PI) / 180;
          const x = unrotatedX * Math.cos(tiltRad) - unrotatedY * Math.sin(tiltRad);
          const y = unrotatedX * Math.sin(tiltRad) + unrotatedY * Math.cos(tiltRad);
          
          // 3D Depth scaling based on Y position along orbit
          const depthFactor = Math.sin(itemAngle);
          const scale = 0.8 + (depthFactor + 1) * 0.25;
          const opacity = 0.65 + (depthFactor + 1) * 0.175;
          const zIndex = Math.round((depthFactor + 1) * 50) + 10;
          const isHovered = hoveredIdx === index;

          return (
            <div
              key={item.id}
              className={`orbit-node-wrapper ${isHovered ? 'hovered' : ''}`}
              style={{
                transform: `translate(${x}px, ${y}px) scale(${isHovered ? scale * 1.25 : scale})`,
                opacity: isHovered ? 1.0 : opacity,
                zIndex: isHovered ? 250 : zIndex,
              }}
              onMouseEnter={() => setHoveredIdx(index)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={item.action}
            >
              {/* Soft White Glowing Orb */}
              <div className="orbit-orb" />
              {/* Crisp Label Underneath */}
              <div className="orbit-label">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
