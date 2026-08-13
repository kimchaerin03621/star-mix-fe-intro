# 🚀 STARMix: MIDI 게임기 컨트롤러 & 3D VR 네비게이션 매핑 정리 (최종)

이 문서는 MIDI 컨트롤러를 활용하여 3D/VR 공간을 마우스 없이 완벽하게 조종할 수 있도록 개편한 **[그룹 2: VR NAVIGATION & GAME CONTROLLER]** 세부 매핑 명세서입니다.

---

## 1. 🎛️ EQ 노브 (3D 위치 XYZ 지속 이동)
믹서의 EQ 노브 3종을 이용하여 3D 우주 공간 내에서의 카메라/사용자 위치(Position)를 자유롭게 제어합니다.
- **12시 정중앙 (VAL 56 ~ 72 데드존)**: 해당 축 **완전 정지 (STOP)**
- **오른쪽 회전 (> 12시)**: 해당 방향으로 **지속 이동** (많이 돌릴수록 가속)
- **왼쪽 회전 (< 12시)**: 반대 방향으로 **지속 이동** (많이 돌릴수록 가속)
- **경계선 보호**: 공간 한계점(-25m ~ +25m) 도착 시 노브가 돌아가 있어도 안전하게 자동 정지

| 컨트롤러 조작부 | 연결 MIDI CC | 담당 3D 축 | 오른쪽 회전시 | 왼쪽 회전시 | 12시 중앙 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EQ HIGH (하이니)** | **CC 7 (MSB) + CC 39 (LSB)** *(14-Bit)* | **X축** | **오른쪽(Right ➡️)** | **왼쪽(Left ⬅️)** | **정지 (STOP)** |
| **EQ MID (미드)** | **CC 11 (MSB) + CC 43 (LSB)** *(14-Bit)* | **Y축** | **위로 상승(Up ⬆️)** | **아래 하강(Down ⬇️)** | **정지 (STOP)** |
| **EQ LOW (로우)** | **CC 15 (MSB) + CC 47 (LSB)** *(14-Bit)* | **Z축** | **앞으로 전진(Forward ⏩)** | **뒤로 후진(Backward ⏪)** | **정지 (STOP)** |

> 💡 **적용된 14-Bit High-Resolution 디코더**: 
> 노브 회전 시 신호가 0으로 튀거나 반대로 꺾이는 하드웨어 현상을 잡기 위해 `(MSB << 7) + LSB` 14비트 각도 디코딩 및 오버플로우 방지 알고리즘이 적용되어 있습니다.

---

## 2. 🎧 조그휠 (3D 시점/고개 360도 회전 - Orientation)
두 개의 조그휠을 이용하여 3D VR 공간을 바라보는 고개 각도(Rotation)를 360도 자유롭게 제어합니다.

- **왼쪽 조그휠 (Channel 1, CC 33)**: **Yaw (좌/우 360도 시선 회전)**
  - 휠 반시계 방향 턴 ➡️ 오른쪽 시선 회전
  - 휠 시계 방향 턴 ⬅️ 왼쪽 시선 회전
- **오른쪽 조그휠 (Channel 2, CC 33)**: **Pitch (위/아래 쳐다보기 & 숙이기)**
  - 휠 시계 방향 턴 ⬆️ 하늘/위쪽 쳐다보기
  - 휠 반시계 방향 턴 ⬇️ 바닥/아래쪽 쳐다보기

---

## 3. 🎯 시점 원점 초기화 (Reset View)
- **마스터키 버튼 (`NOTE/CC: 99`)**:
  - 누르는 순간 이동한 3D 카메라 위치 `(X:0, Y:0, Z:0)` 및 시선 회전 각도 `(Yaw:0, Pitch:0)`가 정중앙 정면으로 **즉시 원점 초기화**됩니다.

---

## 4. 🛑 비활성화 및 노이즈 차단 목록 (Disabled Signals)
조그휠을 건드릴 때 원치 않는 튀는 동작이나 초기화 현상을 방지하기 위해 아래 부가 신호들을 명시적으로 차단했습니다:
- **`CC 34` (조그휠 상단 터치/보조 CC)**: 기능 비활성화 (기능 매핑 없음)
- **`NOTE 54` (조그휠 터치 센서)**: Reset View 기능에서 완전히 제거하여 회전 시 시점 초기화되는 간섭 차단
- **Fallback CC 자동 이동**: 미지정된 신호로 인해 화면이 멋대로 움직이던 기본 백업 로직 제거

---

## 5. 🧭 3D Navigation Guide UI (나침반 HUD & 3D 축)
- **화면 좌측 상단 HUD UI**:
  - `EQ HIGH`, `EQ MID`, `EQ LOW` 노브 조작 시 현재 이동 상태(`➡️ 우측`, `⬆️ 위`, `⏩ 전진` 등)와 실시간 좌표 `POS: X, Y, Z`를 시각적으로 강조 표시
- **3D 우주 공간 나침반 가이드**:
  - 공간 원점에 **빨간색(X축)**, **초록색(Y축)**, **파란색(Z축)** 3D 좌표축 가이드선 렌더링

---

## 📂 관련 수정 주요 파일
- [App.jsx](file:///c:/OMG/star-mix-fe-vr-intro/src/App.jsx): 14-Bit MIDI 디코더, 위치/회전 상태 관리, Compass HUD UI
- [VRScene.jsx](file:///c:/OMG/star-mix-fe-vr-intro/src/components/VRScene.jsx): `CameraRig` 시선 고정 및 360도 Yaw/Pitch 3D 렌더링
- [ControllerPanel.jsx](file:///c:/OMG/star-mix-fe-vr-intro/src/components/ControllerPanel.jsx): 그룹 2 안내 문구 업데이트
- [index.css](file:///c:/OMG/star-mix-fe-vr-intro/src/index.css): Compass HUD 네온 CSS 스타일링
