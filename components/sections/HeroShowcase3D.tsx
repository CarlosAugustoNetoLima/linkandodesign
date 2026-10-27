"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";

// Showcase premium: a pedra é o pedestal fixo — um render já pronto, recortado
// em alpha e exibido como billboard. Sobre ela flutua um card de vidro
// (glassmorphism visionOS) que exibe os vídeos dos projetos via VideoTexture.
// Só o card gira: a cada volta completa ele troca de vídeo com crossfade.

// vídeos dos projetos (VideoTexture, não imagens)
const VIDEOS = [
  "/projects/yanns.mp4",
  "/projects/festivalcrato.mp4",
  "/projects/wauw.mp4",
  "/projects/jsynq.mp4",
];

const HOLD = 8; // tempo mostrando cada projeto
const VIDEO_PREROLL = 1.5; // segundos de antecedência para acordar o próximo vídeo
const SPIN = 2.4; // giro suave estilo Apple
const SEG = HOLD + SPIN; // um segmento por vídeo
const CYCLE = SEG * VIDEOS.length; // ciclo completo, depois reinicia

// card de vidro (mesmas proporções 16:10 do vídeo). O card é o protagonista:
// cresceu ~16% enquanto a pedra encolheu ~19%, invertendo o peso visual entre
// pedestal e conteúdo. Raio e moldura acompanham a escala para o desenho da
// borda continuar lendo igual no tamanho exibido.
const CARD_W = 3.7;
const CARD_H = CARD_W / 1.6;
const CARD_R = 0.13; // ~16px de raio no tamanho exibido
const CARD_TH = 0.09; // espessura discreta
const BORDER = 0.064; // moldura de vidro ao redor do vídeo
const CARD_POS: [number, number, number] = [0, 0.28, 0.15]; // flutua acima da pedra

// O plano do vídeo tira a altura da PROPORÇÃO REAL da gravação, não da altura
// do card. As gravações são 960x600 (16:10) e o UV do plano é 0..1, então
// derivar a altura do card esticava a imagem — a folga interna do card não é
// exatamente 16:10. Assim a moldura de vidro fica um pouco mais fina em cima e
// embaixo (0.04) do que nas laterais (BORDER), e o site aparece sem distorção.
const VIDEO_ASPECT = 960 / 600;
const VIDEO_W = CARD_W - BORDER * 2;
const VIDEO_H = VIDEO_W / VIDEO_ASPECT;

// flutuação lenta do card (sobe/desce). Período longo e amplitude pequena:
// tem que ler como "pairando", não como animação. Frequência propositalmente
// diferente da do sway de rotação para os dois nunca entrarem em fase.
const CARD_BOB = 0.09;
const CARD_BOB_SPEED = 1.0; // ~6.3s por ciclo (era ~9s)

function smootherstep(p: number) {
  return p * p * p * (p * (p * 6 - 15) + 10);
}
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// ——— pedra: render 3D já pronto, recortado em alpha (billboard).
// Como ela não gira, um plano com a textura lê como o objeto sólido. ———
const ROCK_ASPECT = 1319 / 357; // proporção do recorte de /pedra.webp
// Ainda maior que o quadro (a base continua saindo cortada pelo rodapé —
// verificado projetando a borda inferior: fica em ~-1.4 NDC, bem fora), mas
// menor que antes: o card é o protagonista, a pedra é só o pedestal.
const ROCK_W = 7.8;
const ROCK_H = ROCK_W / ROCK_ASPECT;
const ROCK_X = 0.9;
const ROCK_Z = -0.55; // atrás da órbita do card

// Elevação da câmera sobre o plano do platô. Medida no próprio asset,
// detectando a quebra entre o topo e as facetas frontais: a elipse do platô
// tem eixo menor 92px e maior 1288px, logo b/a = 0.071 → asin ≈ 4.1°.
// Casando essa elevação, um disco horizontal projeta exatamente a elipse
// pintada — é o que permite sombra de verdade em vez de mancha falsa.
//
// Duas armadilhas aqui, ambas já custaram uma iteração:
//  · medir pela sagita da silhueta dá ~10.7° e está errado — ali se mede o
//    alargamento do corpo da pedra, não a elipse do topo;
//  · a abertura da elipse NÃO depende do pitch da câmera, e sim da altura
//    dela sobre o plano do platô dividida pela distância. Por isso a altura
//    é derivada de ELEV a cada frame, e o pitch (TILT) só enquadra.
const ELEV = 0.0715;
// pitch: puramente composição. Menor = câmera aponta mais para cima = conteúdo
// desce no quadro, dando ar acima do card e cortando mais a base da pedra.
// Medido projetando a borda OPACA da pedra (não a cauda semitransparente do
// halo de sombra assado no asset, que se estende além da parte sólida) — a
// opaca é o que o olho lê como "rocha".
//
// TILT é o ÚNICO jeito de baixar a pedra no quadro. Translação não resolve:
// a câmera recalcula a própria altura a partir do platô a cada frame (ELEV
// acima), então mover a cena em Y move a câmera junto e a projeção fica
// idêntica — ver o aviso em PLATEAU_WORLD_Y. Só a rotação real da câmera
// reenquadra.
//
// Valor resolvido numericamente (bisseção sobre a projeção real) para deixar
// a pedra cortada exatamente ao meio: a linha de centro dela cai sobre a borda
// inferior do quadro (NDC y = -1), então só a metade de cima aparece. O alvo é
// a média dos dois extremos do dolly no aspect de referência — ao longo do
// scroll o corte oscila entre ~54% e ~46% da altura, imperceptível.
const TILT = -0.112;

// A cena é composta a partir do PLATÔ, não da imagem: essa é a altura de
// trabalho, e a posição da pedra é derivada dela. Assim crescer a pedra faz a
// base descer e sair cortada pelo rodapé sem arrastar card e câmera junto.
//
// Este valor NÃO controla o enquadramento na tela: a câmera recalcula sua
// própria altura a partir dele a cada frame (useFrame abaixo), então mover
// PLATEAU_WORLD_Y translada câmera + cena juntas e a projeção fica idêntica
// — já tentei usar isso pra empurrar a pedra pra baixo e não teve efeito
// nenhum (confirmado projetando a cena real no Chrome). Quem enquadra é o
// TILT (rotação real da câmera, não translação).
const PLATEAU_WORLD_Y = -0.64;

// platô no recorte: centro 36.6% da altura acima do centro da imagem, raio
// 48.8% da largura.
const PLATEAU_Y = ROCK_H * 0.3655;
const PLATEAU_R = ROCK_W * 0.46; // pouco menor que a medida: a pedra é irregular
                                 // e o disco não pode escapar da silhueta
const PLATEAU_WORLD_Z = ROCK_Z - PLATEAU_Y * Math.sin(TILT);
const ROCK_POS: [number, number, number] = [
  ROCK_X,
  PLATEAU_WORLD_Y - PLATEAU_Y * Math.cos(TILT),
  ROCK_Z,
];

// folga entre a base do card e a superfície: o card flutua, não pousa. Subiu
// junto com a redução da pedra para afastar card e pedestal — mesmo no ponto
// mais baixo da flutuação (CARD_BOB) a folga nunca chega perto de zero.
const CARD_FLOAT = 0.5;
const CARD_GROUP_Y = PLATEAU_WORLD_Y + CARD_FLOAT + CARD_H / 2 - CARD_POS[1];

// dolly: plano aberto no topo do hero → close conforme o scroll desce.
// CAM_Z_NEAR não pode passar de ~5.9: abaixo disso o topo do card de vidro
// (spinRef) projeta além da borda superior do frame, pois o card fica acima
// do platô por uma altura FIXA em world space — perto da câmera, essa altura
// fixa subtende um ângulo maior e o topo estoura o quadro, mesmo com a
// elevação da câmera calibrada para manter o platô fixo na tela (ELEV acima).
// Confirmado projetando os cantos do card com Three.js real (PerspectiveCamera
// + .project()), não só olhando no navegador — ver simulação nos comentários
// de ELEV/TILT logo acima, mesma armadilha de medição.
const CAM_Z_FAR = 7.4;
const CAM_Z_NEAR = 6.0;

// Enquadramento por aspect. O fov é VERTICAL, então quando o container fica
// estreito o campo horizontal encolhe junto e o card (que vive deslocado à
// direita, em ROCK_X) sai cortado pela lateral. O container varia bastante:
// medido no DOM, aspect 1.05 em viewport 1024 (onde lg:w-[60%] entra), 1.25 em
// 1280 e 1.90 em 1920 — e no estado anterior a borda direita do card já saía
// do quadro em 1024 e 1280 (NDC x 1.27 e 1.06).
//
// Correção em duas partes, proporcionais a quão estreito está: um leve recuo
// da câmera e um pan em X na direção do card, que recentra a composição. O pan
// é o que faz o trabalho pesado (recuo sozinho exigiria encolher tudo ~1.7x);
// e ele até melhora o billboard da pedra, porque reduz o ângulo com que ela é
// vista fora de eixo. A altura continua derivada de Z, então ELEV — e com ele
// a elipse do platô — não muda.
const REF_ASPECT = 1.6; // daqui para cima sobra lateral: sem correção
const PULL_MAX = 1.12; // recuo máximo de Z no aspect mais estreito
const PAN_K = 1.0; // fração de ROCK_X compensada no pan

// retângulo arredondado (cantos perfeitos), UV normalizado p/ mapear o vídeo
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
  const dolly = useRef(0); // valor amortecido que persegue scroll.current
  const matA = useRef<THREE.MeshBasicMaterial>(null);
  const matB = useRef<THREE.MeshBasicMaterial>(null);

  // textura da pedra carregada à parte (sem Suspense): o resto da cena aparece
  // de imediato e a pedra entra quando decodifica, em vez de segurar tudo.
  const [rockTex, setRockTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    // ImageBitmapLoader: decodifica fora da thread principal e não fica preso
    // ao decode diferido que o <img> sofre quando a aba está em segundo plano.
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

  // VideoTextures criadas uma vez e reutilizadas (elementos <video> ocultos no DOM)
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
    // dolly ligado ao scroll: plano aberto no topo, close conforme desce.
    // Amortecimento exponencial independente de FPS — sem isso o movimento
    // muda de velocidade conforme a taxa de quadros.
    const target = reduced ? 0 : scroll.current;
    dolly.current += (target - dolly.current) * (1 - Math.exp(-6 * delta));
    const k = smootherstep(clamp01(dolly.current));

    // quão estreito está o container (0 = folgado, 1 = no limite)
    const narrow = clamp01((REF_ASPECT - size.width / size.height) / (REF_ASPECT - 1));
    camera.position.z =
      (CAM_Z_FAR + (CAM_Z_NEAR - CAM_Z_FAR) * k) * (1 + (PULL_MAX - 1) * narrow);
    camera.position.x = ROCK_X * PAN_K * narrow;
    // altura derivada da distância para manter ELEV constante: sem isso a
    // elipse do disco abriria durante o dolly e a sombra sairia do platô
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
        angle = smootherstep(p) * Math.PI * 2; // uma volta
      }
    }
    const next = (seg + 1) % VIDEOS.length;
    // crossfade no miolo do giro (premium, sem tela preta/branca)
    const blend = reduced ? 0 : smootherstep(clamp01((p - 0.2) / 0.6));

    if (spinRef.current) {
      const t = clock.getElapsedTime();
      const sway = reduced ? 0 : Math.sin(t * 0.5) * 0.03;
      spinRef.current.rotation.y = angle + sway;
      // flutuação lenta: o card sobe e desce pairando sobre a pedra
      const bob = reduced ? 0 : Math.sin(t * CARD_BOB_SPEED) * CARD_BOB;
      spinRef.current.position.y = CARD_GROUP_Y + bob;
      const squash = 1 - 0.02 * Math.sin(p * Math.PI);
      spinRef.current.scale.setScalar(squash);
    }

    // camadas de vídeo: A = atual (base), B = próximo (fade por cima).
    // Só reatribui o map quando o vídeo REALMENTE muda — trocar todo frame
    // custaria caro e sem o primeiro needsUpdate a textura nem aparece.
    //
    // needsUpdate SÓ na primeira atribuição (map era null). Trocar uma textura
    // por outra já compilada não muda a chave do programa, mas marcar
    // needsUpdate força o three a refazer a resolução de programa no meio do
    // giro — era um engasgo a cada troca de projeto. Sair de null, sim, muda
    // os defines do shader e continua exigindo o flag.
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

    // Reprodução: decodificar vídeo é o item mais caro por frame, então o
    // próximo só acorda pouco antes do giro em vez de rodar o HOLD inteiro à
    // toa — durante a maior parte do ciclo só UM vídeo decodifica, não dois.
    // O preroll dá tempo de encher o buffer para a troca não engasgar.
    const preroll = !reduced && local >= HOLD - VIDEO_PREROLL;
    media.forEach((m, i) => {
      const involved = i === seg || (i === next && preroll);
      if (involved && m.v.paused) m.v.play().catch(() => {});
      else if (!involved && !m.v.paused) m.v.pause();
    });
  });

  return (
    <>
      {/* HDRI de estúdio (rig de softboxes) — reflexos p/ o vidro e a pedra */}
      <Environment resolution={512} frames={1}>
        <Lightformer form="rect" intensity={3.4} position={[3.6, 4, 4]} scale={[8, 10, 1]} rotation-y={-Math.PI / 5} color="#ffffff" />
        <Lightformer form="rect" intensity={2} position={[-5, 3, -3]} scale={[6, 8, 1]} rotation-y={Math.PI / 2.2} color="#eaf0ff" />
        <Lightformer form="rect" intensity={1} position={[0, -3, 3]} scale={[10, 3, 1]} rotation-x={Math.PI / 2} color="#f0ece2" />
        <Lightformer form="ring" intensity={0.7} position={[-2, 5, 3]} scale={5} color="#ffffff" />
      </Environment>

      {/* key + fill + rim */}
      <ambientLight intensity={0.15} />
      {/* key: só ilumina, não projeta sombra. Ângulo calibrado para casar com o
          contraluz assado no asset da pedra — por isso ele NÃO se mexe. */}
      <directionalLight position={[3.6, 5.4, -2.4]} intensity={1.5} />

      {/* Luz dedicada só à sombra, no mesmo azimute (atrás e à direita) porém
          bem mais alta. Existe separada porque as duas exigências brigavam: a
          altura que enquadra a sombra estraga o ângulo do key, e o ângulo do
          key joga a sombra para fora da pedra.
          A key rasante (y=5.4) esticava a projeção até 4.19 no platô — 117% do
          disco receptor e 110% da elipse pintada no asset, ou seja, a sombra
          escapava da silhueta da rocha (medido projetando os cantos do card no
          plano do platô ao longo de todo o giro, do sway e da flutuação).
          Com y=12 o alcance cai para 2.91: 81% do disco e 76% da elipse — longe
          da borda nos dois casos, e ainda com 0.60 de deslocamento para a
          frente, então continua lendo como sombra de contato e não como mancha
          chapada embaixo do card.
          intensity={0} não desliga a sombra: o three.js decide o shadow map só
          por castShadow, e a opacidade vem do shadowMaterial (verificado no
          fonte da versão em node_modules). */}
      <directionalLight
        position={[3.6, 12, -2.4]}
        intensity={0}
        castShadow
        // 1024 (era 2048): essa sombra se redesenha TODO frame — o card gira
        // sem parar, nunca pode congelar. Ainda dá ~155 texels/unidade no
        // frustum de 6.6 (ver abaixo), sobrando pra uma sombra de contato
        // suave (shadowMaterial opacity 0.4 já borra o resultado). 1/4 da
        // memória e do custo de rasterização do passe de profundidade.
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      >
        {/* frustum colado no caster: fora disso a sombra sai serrilhada. O card
            é o único que projeta e ocupa só ±2.77 no espaço da luz, a 9.7–14.0
            de distância — daí dar para fechar mais que antes e ganhar
            resolução (2048 sobre 6.6 unidades em vez de 7.6). */}
        <orthographicCamera attach="shadow-camera" args={[-3.3, 3.3, 3.3, -3.3, 7, 17]} />
      </directionalLight>
      <directionalLight position={[-4, 2, 3]} intensity={0.5} color="#eef2ff" />
      <directionalLight position={[0, 3, -5]} intensity={0.9} color="#ffffff" />

      {/* pedra — fixa, fora do grupo que gira: só o card roda. rotation-x
          acompanha a inclinação da câmera para o billboard seguir de frente. */}
      {rockTex && (
        <mesh position={ROCK_POS} rotation-x={-TILT} renderOrder={1}>
          <planeGeometry args={[ROCK_W, ROCK_H]} />
          <meshBasicMaterial map={rockTex} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      )}

      {/* receptor da sombra: disco horizontal sobreposto ao platô pintado.
          shadowMaterial só desenha onde a sombra cai — o resto é invisível.
          Disco (não plano infinito) para a sombra não vazar da borda da pedra
          e ficar boiando no ar. */}
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
        {/* card de vidro flutuante com os vídeos. O corpo de vidro fica ATRÁS
            (recuado): aparece como moldura/borda e aresta; o vídeo, opaco e à
            frente, permanece perfeitamente nítido. */}
        <group position={CARD_POS}>
          {/* corpo de vidro (glassmorphism visionOS): reflexo do ambiente,
              fresnel nas bordas, refração muito sutil */}
          <mesh geometry={glassGeo} position={[0, 0, -0.02]} castShadow>
            {/* SEM transmission de propósito. transmission > 0 liga o passe de
                transmissão do three: a cena inteira é redesenhada num render
                target ADICIONAL a cada frame só para o vidro poder refratar o
                que está atrás. Aqui era quase todo desperdício — o vídeo é
                opaco e fica na frente, então só as arestas do bevel refratavam
                de fato. thickness saiu junto, que aí sim só vale com
                transmission ligada.
                (ior NÃO era desse grupo: no shader do three ele define o F0,
                `specularColor = pow2((ior-1)/(ior+1)) * specularIntensity`,
                valendo com ou sem transmission. Voltou por isso.)

                O CUSTO da troca foi o brilho, e o motivo é o blend: com
                `transparent` + opacity, o alpha multiplica o fragmento INTEIRO,
                especular incluso — com opacity 0.16 os reflexos saíam 84%
                apagados e a moldura ficava fosca. Materiais com transmission
                usam outro caminho e preservam o especular; é por isso que
                aquele vidro parecia brilhante mesmo sendo transparente.

                Recuperado sem o passe extra, empurrando o reflexo em vez do
                corpo. Passou do ponto na primeira tentativa: envMapIntensity
                3.4 + clearcoatRoughness quase espelhado (0.04) contra os 4
                Lightformers do Environment estourava o realce em branco
                sólido cobrindo boa parte da superfície — e o Bloom (que reage
                a luminância, não sabe "é vidro") ainda inchava esse branco.
                Ajustado para menos intensidade e um reflexo mais espalhado
                (roughness maior = highlight mais difuso, não concentrado):
                  · opacity 0.28 → 0.20
                  · envMapIntensity 3.4 → 1.9
                  · clearcoatRoughness 0.04 → 0.11
                  · specularIntensity 1.6 → 1.15, ior 1.6 → 1.5
                Pra calibrar: envMapIntensity é o que mais pesa em "quão
                branco" — mexer nele primeiro. */}
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
          {/* vídeo atual (base, nítido) — no meio da espessura do vidro e
              DoubleSide: fica visível pelos dois lados (o conteúdo lê como se
              vivesse dentro do vidro), então o giro nunca mostra um verso em
              branco, só o vídeo visto de trás (espelhado, efeito intencional) */}
          <mesh geometry={videoGeo} position={[0, 0, 0.001]}>
            <meshBasicMaterial ref={matA} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          {/* vídeo seguinte (crossfade por cima) */}
          <mesh geometry={videoGeo} position={[0, 0, 0.003]}>
            <meshBasicMaterial ref={matB} toneMapped={false} transparent opacity={0} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* pós: bloom levíssimo + SMAA.
          O N8AO saiu. Ele custava dois extras por frame — o passe de normais
          (enableNormalPass, que redesenha a cena inteira) mais o próprio SSAO —
          e nesta cena não tinha o que ocluir: a pedra é um billboard CHATO com
          a oclusão já pintada no asset, o receptor de sombra é invisível, e o
          card flutua solto no ar, longe de qualquer superfície. Estava pagando
          preço de AO para escurecer quase nada. A sombra de contato real (a
          projetada no platô) é quem faz esse trabalho aqui. */}
      <EffectComposer multisampling={0}>
        {/* levels=5 (padrão da lib é 8): mipmapBlur gera um passe de blur POR
            nível — cada nível a menos é um passe de GPU inteiro a menos por
            frame. Um brilho tão sutil quanto este não precisa de 8 níveis de
            espalhamento; 5 já cobre e custa ~40% menos. */}
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

  // progresso do scroll sobre o próprio canvas, em ref (não state): a cena é
  // lida no useFrame, e um setState a cada scroll re-renderizaria a árvore R3F
  // inteira a 60fps.
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
      // inclinação fixa: rotação direta em vez de lookAt, para o ângulo bater
      // exatamente com o do render da pedra e não depender de um alvo
      onCreated={({ camera }) => {
        camera.rotation.x = -TILT;
      }}
      className="!absolute !inset-0"
    >
      <Scene reduced={reduced} scroll={scroll} />
    </Canvas>
  );
}
