"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";


const VIDEOS = [
  "/projects/yanns.mp4",
  "/projects/festivalcrato.mp4",
  "/projects/wauw.mp4",
  "/projects/jsynq.mp4",
];

const HOLD = 8;
const VIDEO_PREROLL = 1.5;
const SPIN = 2.4;
const SEG = HOLD + SPIN;
const CYCLE = SEG * VIDEOS.length;

const CARD_W = 3.7;
const CARD_H = CARD_W / 1.6;
const CARD_R = 0.13;
const CARD_TH = 0.09;
const BORDER = 0.064;
const CARD_POS: [number, number, number] = [0, 0.28, 0.15];

const VIDEO_ASPECT = 960 / 600;
const VIDEO_W = CARD_W - BORDER * 2;
const VIDEO_H = VIDEO_W / VIDEO_ASPECT;

const CARD_BOB = 0.09;
const CARD_BOB_SPEED = 1.0;

function smootherstep(p: number) {
  return p * p * p * (p * (p * 6 - 15) + 10);
}
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const ROCK_ASPECT = 1319 / 357;
const ROCK_W = 7.8;
const ROCK_H = ROCK_W / ROCK_ASPECT;
const ROCK_X = 0.9;
const ROCK_Z = -0.55;

const ELEV = 0.0715;
const TILT = -0.112;

const PLATEAU_WORLD_Y = -0.64;

const PLATEAU_Y = ROCK_H * 0.3655;
const PLATEAU_R = ROCK_W * 0.46;
const PLATEAU_WORLD_Z = ROCK_Z - PLATEAU_Y * Math.sin(TILT);
const ROCK_POS: [number, number, number] = [
  ROCK_X,
  PLATEAU_WORLD_Y - PLATEAU_Y * Math.cos(TILT),
  ROCK_Z,
];

const CARD_FLOAT = 0.5;
const CARD_GROUP_Y = PLATEAU_WORLD_Y + CARD_FLOAT + CARD_H / 2 - CARD_POS[1];

const CAM_Z_FAR = 7.4;
const CAM_Z_NEAR = 6.0;

const REF_ASPECT = 1.6;
const PULL_MAX = 1.12;
const PAN_K = 1.0;

function roundedRect(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2,
    y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}
function roundedPlaneGeometry(w: number, h: number, r: number) {
  const geo = new THREE.ShapeGeometry(roundedRect(w, h, r), 16);
  const pos = geo.attributes.position;
  const uv: number[] = [];
  for (let i = 0; i < pos.count; i++) uv.push((pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return geo;
}
function roundedSlabGeometry(w: number, h: number, r: number, depth: number) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, h, r), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 3,
    curveSegments: 16,
  });
  geo.center();
  return geo;
}

function Scene({
  reduced,
  scroll,
}: {
  reduced: boolean;
  scroll: { current: number };
}) {
  const spinRef = useRef<THREE.Group>(null);
  const dolly = useRef(0);
  const matA = useRef<THREE.MeshBasicMaterial>(null);
  const matB = useRef<THREE.MeshBasicMaterial>(null);

  const [rockTex, setRockTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    const loader = new THREE.ImageBitmapLoader();
    loader.setOptions({ imageOrientation: "flipY" });
    loader.load("/pedra.webp", (bitmap) => {
      if (!alive) {
        bitmap.close();
        return;
      }
      const t = new THREE.CanvasTexture(bitmap);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
      setRockTex(t);
    });
    return () => {
      alive = false;
    };
  }, []);

  const glassGeo = useMemo(() => roundedSlabGeometry(CARD_W, CARD_H, CARD_R, CARD_TH), []);
  const videoGeo = useMemo(
    () => roundedPlaneGeometry(VIDEO_W, VIDEO_H, CARD_R - BORDER),
    []
  );

  const media = useMemo(() => {
    return VIDEOS.map((src) => {
      const v = document.createElement("video");
      v.src = src;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = "auto";
      v.crossOrigin = "anonymous";
      Object.assign(v.style, {
        position: "fixed",
        left: "0",
        bottom: "0",
        width: "2px",
        height: "2px",
        opacity: "0.01",
        pointerEvents: "none",
        zIndex: "-1",
      });
      document.body.appendChild(v);
      const tex = new THREE.VideoTexture(v);
      tex.colorSpace = THREE.SRGBColorSpace;
      return { v, tex };
    });
  }, []);
  useEffect(
    () => () => {
      media.forEach((m) => {
        m.v.pause();
        m.v.removeAttribute("src");
        m.v.load();
        m.v.remove();
        m.tex.dispose();
      });
    },
    [media]
  );

  const debugSpin = useMemo(() => {
    const q = new URLSearchParams(window.location.search).get("macspin");
    return q !== null ? parseFloat(q) : null;
  }, []);

  useFrame(({ clock, camera, size }, delta) => {
    const target = reduced ? 0 : scroll.current;
    dolly.current += (target - dolly.current) * (1 - Math.exp(-6 * delta));
    const k = smootherstep(clamp01(dolly.current));

    const narrow = clamp01((REF_ASPECT - size.width / size.height) / (REF_ASPECT - 1));
    camera.position.z =
      (CAM_Z_FAR + (CAM_Z_NEAR - CAM_Z_FAR) * k) * (1 + (PULL_MAX - 1) * narrow);
    camera.position.x = ROCK_X * PAN_K * narrow;
    camera.position.y =
      PLATEAU_WORLD_Y + Math.tan(ELEV) * (camera.position.z - PLATEAU_WORLD_Z);

    const e = (debugSpin != null ? debugSpin : clock.getElapsedTime()) % CYCLE;

    let seg = 0;
    let angle = 0;
    let p = 0;
    let local = 0;
    if (!reduced) {
      seg = Math.floor(e / SEG) % VIDEOS.length;
      local = e % SEG;
      if (local >= HOLD) {
        p = (local - HOLD) / SPIN;
        angle = smootherstep(p) * Math.PI * 2;
      }
    }
    const next = (seg + 1) % VIDEOS.length;
    const blend = reduced ? 0 : smootherstep(clamp01((p - 0.2) / 0.6));

    if (spinRef.current) {
      const t = clock.getElapsedTime();
      const sway = reduced ? 0 : Math.sin(t * 0.5) * 0.03;
      spinRef.current.rotation.y = angle + sway;
      const bob = reduced ? 0 : Math.sin(t * CARD_BOB_SPEED) * CARD_BOB;
      spinRef.current.position.y = CARD_GROUP_Y + bob;
      const squash = 1 - 0.02 * Math.sin(p * Math.PI);
      spinRef.current.scale.setScalar(squash);
    }

    if (matA.current && matA.current.map !== media[seg].tex) {
      const first = matA.current.map === null;
      matA.current.map = media[seg].tex;
      if (first) matA.current.needsUpdate = true;
    }
    if (matB.current) {
      if (matB.current.map !== media[next].tex) {
        const first = matB.current.map === null;
        matB.current.map = media[next].tex;
        if (first) matB.current.needsUpdate = true;
      }
      matB.current.opacity = blend;
    }

    const preroll = !reduced && local >= HOLD - VIDEO_PREROLL;
    media.forEach((m, i) => {
      const involved = i === seg || (i === next && preroll);
      if (involved && m.v.paused) m.v.play().catch(() => {});
      else if (!involved && !m.v.paused) m.v.pause();
    });
  });

  return (
    <>
      
      <Environment resolution={512} frames={1}>
        <Lightformer form="rect" intensity={3.4} position={[3.6, 4, 4]} scale={[8, 10, 1]} rotation-y={-Math.PI / 5} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-5, 3, -3]} scale={[6, 8, 1]} rotation-y={Math.PI / 2.2} color="#eaf0ff" />
        <Lightformer form="rect" intensity={1} position={[0, -3, 3]} scale={[10, 3, 1]} rotation-x={Math.PI / 2} color="#f0ece2" />
        <Lightformer form="ring" intensity={0.7} position={[-2, 5, 3]} scale={5} color="#ffffff" />
      </Environment>

      
      <ambientLight intensity={0.15} />
      
      <directionalLight position={[3.6, 5.4, -2.4]} intensity={1.5} />

      
      <directionalLight
        position={[3.6, 12, -2.4]}
        intensity={0}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      >
        
        <orthographicCamera attach="shadow-camera" args={[-3.3, 3.3, 3.3, -3.3, 7, 17]} />
      </directionalLight>
      <directionalLight position={[-4, 2, 3]} intensity={0.5} color="#eef2ff" />
      <directionalLight position={[0, 3, -5]} intensity={0.9} color="#ffffff" />

      
      {rockTex && (
        <mesh position={ROCK_POS} rotation-x={-TILT} renderOrder={1}>
          <planeGeometry args={[ROCK_W, ROCK_H]} />
          <meshBasicMaterial map={rockTex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      )}

      
      <mesh
        position={[ROCK_POS[0], PLATEAU_WORLD_Y, PLATEAU_WORLD_Z]}
        rotation-x={-Math.PI / 2}
        receiveShadow
        renderOrder={2}
      >
        <circleGeometry args={[PLATEAU_R, 64]} />
        <shadowMaterial transparent opacity={0.4} depthWrite={false} />
      </mesh>

      <group ref={spinRef} position={[ROCK_POS[0], CARD_GROUP_Y, PLATEAU_WORLD_Z]} renderOrder={3}>
        
        <group position={CARD_POS}>
          
          <mesh geometry={glassGeo} position={[0, 0, -0.02]} castShadow>
            
            <meshPhysicalMaterial
              roughness={0.06}
              metalness={0}
              ior={1.5}
              specularIntensity={1.15}
              clearcoat={1}
              clearcoatRoughness={0.11}
              envMapIntensity={1.9}
              transparent
              opacity={0.2}
              color="#eef3f8"
              iridescence={0.12}
              iridescenceIOR={1.3}
            />
          </mesh>
          
          <mesh geometry={videoGeo} position={[0, 0, 0.001]}>
            <meshBasicMaterial ref={matA} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          
          <mesh geometry={videoGeo} position={[0, 0, 0.003]}>
            <meshBasicMaterial ref={matB} toneMapped={false} transparent opacity={0} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      
      <EffectComposer multisampling={0}>
        
        <Bloom mipmapBlur levels={5} luminanceThreshold={0.9} luminanceSmoothing={0.15} intensity={0.22} radius={0.5} />
        <SMAA />
      </EffectComposer>
    </>
  );
}

export default function HeroShowcase3D() {
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (ev: MediaQueryListEvent) => setReduced(ev.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const scroll = useRef(0);
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const read = () => {
      const r = el.getBoundingClientRect();
      scroll.current = clamp01(-r.top / Math.max(1, r.height));
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  return (
    <Canvas
      ref={canvasRef}
      shadows
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false }}
      camera={{ position: [0, PLATEAU_WORLD_Y + Math.tan(ELEV) * (CAM_Z_FAR - PLATEAU_WORLD_Z), CAM_Z_FAR], fov: 33 }}
      onCreated={({ camera }) => {
        camera.rotation.x = -TILT;
      }}
      className="!absolute !inset-0"
    >
      <Scene reduced={reduced} scroll={scroll} />
    </Canvas>
  );
}
