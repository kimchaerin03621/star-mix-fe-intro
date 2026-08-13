# 🌌 STARMix: AI Evaluation & Review Guide

이 문서는 **STARMix (Space & Sound DJ Controller)** 프로젝트를 다른 AI 모델(예: Claude, GPT-4, Gemini 등)에게 업로드하거나 붙여넣어 정밀한 코드 리뷰, 아키텍처 평가, 성능 진단을 받기 위해 작성된 **프롬프트 템플릿 및 프로젝트 요약서**입니다.

---

## 💡 사용 방법 (How to Use)

1. 아래의 **[AI Review Prompt Template]** 섹션 전체를 복사합니다.
2. 분석을 원하는 AI 인터페이스에 붙여넣습니다.
3. 필요할 경우 프로젝트 내 주요 파일인 `src/App.jsx`, `src/components/Experience.jsx`, `src/components/SpatialExperience.jsx`, `src/components/VRScene.jsx`, `src/hooks/useHandTracking.js` 파일의 코드를 복사해서 함께 제공하면 더욱 상세하고 구체적인 피드백을 얻을 수 있습니다.

---

## 📝 [AI Review Prompt Template]

```markdown
Hello! I would like you to evaluate my frontend interactive web application called **"STARMix"**. 
It is a WebXR/Webcam-based spatial audio DJ controller and interactive particle simulation.

Please act as a Principal Frontend Architect, Creative Technologist, and WebXR Audio Expert. Conduct a thorough review of the project's architecture, math/physics equations, performance optimization, and Web Audio/WebXR implementation.

Here is the comprehensive overview of the project structure, features, key algorithms, and files:

---

### 1. Project Overview & Concept
STARMix is a futuristic DJ controller interface that combines 2D/3D visual particle simulations, hand-gesture recognition, and spatial audio engine control. It supports three modes:
1. **2D Webcam Mode (Starfield2D)**: Real-time hand-tracking via MediaPipe. Interacting with 1,500 physics-enabled particles dynamically pans and shifts volumes of stereophonic tracks (vocals on left, drums on right) based on the particle centroid.
2. **2D Spatial Sound Mode (SpatialExperiment)**: Displays left and right glowing sound orbs in a simulated 3D space. Users control these orbs using hand-grabbing tethers or a keyboard layout (WASD + Arrows). The audio engine feeds these positions into Web Audio HRTF Panners.
3. **WebXR/3D VR Mode (VRScene)**: Renders a 3D Canvas with 3,000 stars utilizing `@react-three/xr` and `@react-three/fiber`. Stems are represented as 3D audio orbs that pulse and emit concentric 3D billboarded ripple waves based on real-time track amplitudes. Users can click-and-drag or use VR controllers, adjusting distance/depth via scroll wheels or VR joysticks.

---

### 2. Core Tech Stack
- **Framework**: React 19, Vite (configured with basic-ssl for secure Webcam/WebXR local testing over HTTPS)
- **3D / XR Rendering**: Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/xr`
- **AI Vision**: MediaPipe Hands (`@mediapipe/tasks-vision`)
- **Audio Logic**: Web Audio API (HRTF Panning, BiquadFilterNodes, DynamicsCompressor, AnalyserNode, preservesPitch pitch-locking)

---

### 3. Repository File Structure & Roles
- **`src/App.jsx`**: Main UI controller, managing song selection, global sliders, BPM pitch-lock controls, state toggling between 2D, Spatial, and VR interfaces, and the "StarEditor" custom Canvas sketch component.
- **`src/components/Experience.jsx`**: Implements `Starfield2D`. Contains the 2D HTML5 Canvas particle engine, hand attraction/repulsion/swirl mechanics, and the "Spectacle Stereo v3" audio engine which pans and controls volume relative to the particle centroid.
- **`src/components/SpatialExperiment.jsx`**: Wraps the spatial laboratory, introducing control mode switches (Hand vs Keyboard) and experiment preset states.
- **`src/components/SpatialExperience.jsx`**: Implements the 2D pseudo-3D representation of HRTF panning. Contains Z-sorting algorithms (Painter's algorithm) to render a central listener head icon, floating orbs, and stars. Features full, key-resilient visual keyboard guides.
- **`src/components/VRScene.jsx`**: Implements the WebGL/WebXR virtual reality scene. Features 3D shader-based star buffers, interactive 3D audio orbs mapped to multi-track stems (Bohemian Rhapsody, Hype Boy, Kerning City), concentric ripples responsive to real-time track amplitude, 90fps WebXR audio listener headset alignment, and robust garbage collection during track swaps to prevent memory leaks.
- **`src/hooks/useHandTracking.js`**: Hook wrapping MediaPipe. Performs asynchronous GPU-to-CPU fallback initialization, throttles landmarker detection to ~30FPS (off the main thread), and implements custom gesture algorithms (Fist clench, index/middle curl, Snap timing).

---

### 4. Key Algorithmic Implementations

#### A. Particle Physics Simulation (Experience.jsx & SpatialExperience.jsx)
1. **Interactive Forces**: Each of the 1,500 stars has a position, mass, and velocity. Hands/orbs apply three forces within a radius `hScaling`:
   - *Repulsion*: Pushes stars radially outward:
     $$F_{repel} = \frac{\vec{dx}}{dist} \times 0.08 \times \left(1 - \frac{dist}{hScaling}\right)^{1.5}$$
   - *Vortex (Swirl)*: Orbits stars around the interaction point:
     $$F_{swirl} = \left(-\frac{dy}{dist}, \frac{dx}{dist}\right) \times 0.12 \times \left(1 - \frac{dist}{hScaling}\right)^{1.5}$$
   - *Momentum Drag*: Transports hand velocity to the particles.
2. **Spring Restoring Force**: Hooke's law-like spring forces pull particles back to their original "birth" position $(ox, oy)$ to preserve the structure of the galaxy:
   $$F_{springX} = (ox - x) \times 0.0002 \times width$$
3. **Twinkling**: Random twinkling speed and sine-wave alpha modulations.

#### B. Spectacle Stereo v3 Panning (Experience.jsx)
Instead of panning directly relative to hand position, the audio pans relative to the **galaxy's center of gravity (centroid)**.
1. Particles are divided into Left (pink) and Right (white) domains.
2. The code calculates the average X coordinate of all pink particles (`avgXPink`) and white particles (`avgXWhite`).
3. Volume gains are mapped non-linearly to simulate acoustics:
   $$Gain_{left} = (1 - avgXPink)^{2.5} + ChaosBoost$$
   $$Gain_{right} = (avgXWhite)^{2.5} + ChaosBoost$$
   where $ChaosBoost$ scales with average particle displacement (disruption raises intensity).
4. Stereo panning matches these centroids:
   $$Pan_{left} = (avgXPink - 0.25) \times 5 \quad [clamped\ to\ -1..1]$$

#### C. Web Audio 3D HRTF & WebXR Listener Tracking (VRScene.jsx)
1. **HRTF Positioning**: Panners use `'HRTF'` panning models with `'inverse'` distance attenuation models for high fidelity:
   - `refDistance = 4.0`, `maxDistance = 10000`, `rolloffFactor = 0.7`.
2. **Headset Alignment**: In VR, the Web Audio Listener must rotate and move with the user's headset. The code dynamically synchronizes the audio listener's spatial coordinates and vectors with the Three.js XR camera in the `useFrame` loop:
   ```javascript
   const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
   const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
   listener.positionX.setTargetAtTime(camera.position.x, webAudioTime, 0.05);
   listener.forwardX.setTargetAtTime(forward.x, webAudioTime, 0.05);
   listener.upX.setTargetAtTime(up.x, webAudioTime, 0.05);
   ```
3. **Orb Depth Sliding**: Users can drag orbs in 3D. Using scroll wheel (PC) or thumbsticks (VR), the user adjusts the `dragDistance` along the raycaster. The coordinates are clamped inside a 10-meter spherical boundary:
   ```javascript
   const center = state.camera.position.clone();
   const dirToTarget = new THREE.Vector3().subVectors(targetPoint, center);
   const clampedDist = Math.max(0.5, Math.min(10.0, dirToTarget.length()));
   const nextPoint = center.add(dirToTarget.normalize().multiplyScalar(clampedDist));
   ```

#### D. Hand Tracking & Custom Gesture Formulas (useHandTracking.js)
1. **Shoelace Polygon Curl**: To detect hand clenching (Fist) regardless of distance, the code calculates the polygon area formed by the hand landmark tips and the wrist:
   $$Area = \frac{1}{2} \left| \sum_{i=0}^{n-1} (x_i y_{i+1} - x_{i+1} y_i) \right|$$
   This area is normalized by scale (distance between wrist and middle MCP) squared.
   $$CurlAmount = \frac{0.5 - Area}{0.48} \quad [clamped\ to\ 0..1]$$
2. **Zero-Latency Release**: If $\ge 2$ major fingers are extended, `CurlAmount` is instantly forced to 0, ensuring immediate release of grabbed items.
3. **Snap Gesture Detection**: Measures distance between thumb and index/middle finger. A snap is registered when a pinch is held for $30\text{ms} < \Delta t < 450\text{ms}$ and released, debounced by $500\text{ms}$.

---

### 5. Architectural Safeguards & Optimizations
- **NaN Guard**: Fallbacks in calculations protect against WebGL divide-by-zero crashes that result in black screens.
- **CPU Fallback**: If browser GPU delegate initialization for MediaPipe fails, the hook gracefully falls back to CPU WebAssembly.
- **Throttling**: Landmarker detection is throttled to 33ms (~30FPS) to prevent clogging the main UI thread, while animations and canvas rendering run at a full, smooth 60/90FPS.
- **Garbage Collection (Memory Leaks)**: Dynamic song switching frees the previous audio elements completely by setting `audio.src = ''` and triggering `.load()`, resolving browser streaming buffer accumulation leaks.

---

### Please evaluate my project on:
1. **Code Quality & Architecture**: Assess the modularity of the React code, Hook boundaries, and State management.
2. **Math & Physics Accuracy**: Review the particle forces, custom hand area/curl logic, and coordinate conversions.
3. **Web Audio & 3D Spatial Audio Implementation**: Analyze the audio node graphs, HRTF panning parameters, and WebXR audio listener alignment.
4. **Performance & Optimization**: Check for potential memory leaks, frame-rate drops (especially during 90fps WebXR rendering or MediaPipe landmarker loops), and suggest any improvements.
5. **Interactive UI/UX Design**: Evaluate the transition fallbacks (desktop OrbitControls vs headset WebXR), gesture usability, and the layout controls.
```

---

## 🔍 프로젝트 핵심 구현 사항 정리 (Project Details in Korean)

이 프로젝트는 웹의 한계를 시험하는 **인터랙티브 웹 오디오 및 AI 비전 기술의 결정체**입니다. 다음은 내부적으로 구현된 핵심 기술 요소들의 요약입니다.

### 1. 물리 시뮬레이션 엔진 (Particle Physics)
* **Experience.jsx 및 SpatialExperience.jsx**:
  * 1,500개의 별 입자가 각각 질량(Mass)과 관성, 마찰 계수를 지니고 실시간 프레임루프 내에서 시뮬레이션됩니다.
  * 손이나 사운드 오브가 접근하면 **척력(Repulsion)**과 **소용돌이력(Vortex Force)**이 계산되며, 마우스나 손의 속도를 입자에 전이시키는 **운동량 전달(Momentum Transfer)**이 적용됩니다.
  * 복원력(Spring Force)을 통해 입자가 흩어진 후 원래의 자리로 서서히 되돌아오는 안정적인 은하계 구조를 띱니다.

### 2. Spectacle Stereo v3 사운드 엔진
* **Experience.jsx**:
  * 단순한 위치 매핑이 아닌, 은하계 입자들의 **무게중심(Centroid)**을 실시간으로 계산하여 음원을 제어합니다.
  * 핑크색 별(보컬 트랙)과 흰색 별(드럼 트랙) 군집의 평균 X 위치를 2.5제곱의 비선형 볼륨 곡선 및 팬(Panning) 값으로 변환하여, 사용자가 물리적으로 우주를 흐트러뜨릴 때 음향이 좌우로 퍼지고 입체적으로 반응하게 설계되었습니다.
  * 입자가 흔들리는 속도의 평균값(Displacement)을 추출하여 음원에 역동적인 **카오스 부스트(Chaos Boost)** 음량 효과를 가미합니다.

### 3. Dolby Atmos 규격의 3D HRTF 공간 음향
* **SpatialExperience.jsx & VRScene.jsx**:
  * Web Audio API의 `HRTF` 패닝 모델과 `inverse` 거리 감쇄 공식을 채택하여 이어폰/헤드폰 착용 시 완벽한 360도 입체 음향을 선사합니다.
  * **VRScene.jsx (WebXR)**: 사용자가 가상 공간에서 머리를 회전하거나 이동할 때, Web Audio Listener의 3D 좌표 및 Forward/Up orientation 벡터를 Three.js XR 카메라와 동기화(90fps)하여 고개를 돌리는 방향에 맞춰 소리의 위치가 정확하게 변합니다.
  * **안전 구역 클램핑**: 3D 드래그 인터랙션 시 음원 오브가 무한대로 날아가거나 고막 근처로 클리핑되는 것을 방지하기 위해 사용자 머리 중심 반경 0.5m ~ 10m의 구형 바운더리 내에 강제 고정합니다.

### 4. 고성능 미디어파이프 핸드트래킹 제어
* **useHandTracking.js**:
  * **프레임 비동기 최적화**: 캔버스 렌더링은 60fps/90fps로 실행되는 반면, 미디어파이프 감지는 30fps(~33ms)로 스로틀링되어 CPU 메인 스레드 병목 현상을 방지합니다.
  * **Shoelace 공식 기반 Fist 판정**: 손의 겉보기 크기나 거리와 상관없이 일정하게 주먹을 감지할 수 있도록 손목과 5개 손가락 끝점(Tips)이 이루는 폴리곤 면적을 계산하고 정규화합니다.
  * **즉각적 릴리즈**: 2개 이상의 손가락이 펼쳐진 것이 감지되면 주먹 감지 상태를 즉시 무시하여 드래그 중인 오브를 잡고 놓는 딜레이를 0ms로 단축했습니다.
  * **Snap 감지**: 엄지와 중지의 꼬집기(Pinch)가 지속된 시간($30\text{ms} < \Delta t < 450\text{ms}$)을 모니터링하여 가볍게 손가락을 튕기는 제스처를 정확하게 감지하여 곡을 넘깁니다.

---

## 🛠️ 개발서버 실행 및 환경 구성 방법 (How to Run)

평가하는 AI가 로컬에서 구동해보도록 가이드라인을 제공할 수 있습니다.

### 1. 의존성 설치
```bash
npm install
```

### 2. HTTPS 개발 서버 실행
웹캠 권한 및 WebXR 시뮬레이터 구동을 위해 반드시 HTTPS 설정이 활성화된 상태로 실행해야 합니다. 본 프로젝트는 `vite.config.js`에 `@vitejs/plugin-basic-ssl`이 내장되어 있어 아래 명령어 실행 시 자동으로 HTTPS 도메인이 구성됩니다.
```bash
npm run dev
```

### 3. WebXR 시뮬레이션 테스트 방법
* Chrome/Edge 브라우저의 WebXR Device Emulator 확장 프로그램을 사용하거나 Meta Quest 등의 VR 기기로 접속하여 모바일 기기 테스트를 수행할 수 있습니다.
* VR 헤드셋 미연결 시 자동으로 데스크톱 3D 뷰어 모드(`OrbitControls` 마우스 드래그)로 폴백됩니다.
