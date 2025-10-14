# ⛓️NOVAPAY
## 🖥️서비스 소개

- CHAINNOVA의 NOVAPAY는 사용자의 전자서명과 VC로 결제의 유효성을 증명하는 차세대 신뢰 결제 플랫폼입니다.
- 사용자가 MetaMask 서명으로 결제에 동의하면 카드사가 VC를 발급하고, 그 해시값과 사용여부를 블록체인에 기록하여 재사용을 차단합니다.
서비스 제공자는 결제 시점에 VC의 유효성을 확인한 뒤 Toss Payments와 결합하여 안전하고 투명한 단일 결제를 보장합니다.
- 이를 통해 신뢰 가능한 결제, 위변조 방지, 재사용 공격 방지,
그리고 사용자 중심의 데이터 소유권 보장을 실현합니다.


## 👩‍💻 팀원 소개
김솔리

박선영

김예원

김채현                      


## 📅 개발 기간

2025.03 ~ 06 : 주제 선정 및 계획 수립 

2025.07 ~ 08 : 개발 중점 

2025.09 ~ 11 : 보안성 강화 및 정리 

## ⚙️ 서버 및 환경
Backend: Node.js + Express

Frontend: React.js (Vite) + Tailwind CSS

Blockchain: Hardhat (Local Ethereum)

Verifiable Credential Agent: Veramo

Payment Gateway: Toss Payments (테스트 결제)

Database: On-chain Registry (VC 해시 저장)

## 🛠 사용 기술 및 라이브러리
Front-End

React [18.2.0]
TailwindCSS [3.3.3]
Framer Motion [10.12.7]
Ethers [6.7.1]
Toss Payments (테스트 환경)

Back-End

Node.js [18.x]
Express [4.18.2]
Veramo [5.5.0]
Hardhat [2.22.2]
Solidity [0.8.x]

## ⌛주요 기능
1️⃣ DID 생성 및 메타마스크 서명
 사용자가 자신의 지갑 주소 기반으로 서명합니다.

2️⃣ VC 발급 (Veramo Agent)
 카드사 서버가 사용자의 DID로 결제권한 VC를 발급합니다.

3️⃣ VC 해시 등록 (스마트컨트랙트)
 발급된 VC의 해시값을 온체인에 기록하여 위변조를 방지합니다.

4️⃣ VC 검증 및 사용 기록
 결제 시 VC를 검증하고, 사용 후 markVCUsed 트랜잭션을 실행합니다.

5️⃣ 결제 요청 (Toss API)
 VC가 유효하면 Toss 결제창이 자동 호출되고 결과를 저장합니다.

6️⃣ 결제 결과 페이지 표시
 VC 만료 시간, 트랜잭션 해시, 사용 일시 등을 시각적으로 제공합니다.

## 💳 결제 흐름 요약

사용자가 DID를 생성하고 메타마스크로 서명

카드사(백엔드)가 서명된 데이터를 기반으로 VC를 발급

VC의 해시값을 스마트컨트랙트에 등록 (VCRegistry.sol)

결제 시 프론트엔드가 VC를 서버로 전달하여 검증

서버는 VC 유효성 확인 후 markVCUsed 트랜잭션 실행

Toss 결제 API를 호출하여 결제 승인 처리

결제 결과 화면에 VC 만료시간 및 사용정보 표시

## 🧠 핵심 보안 구조

DID (Decentralized Identifier)

사용자의 지갑 주소를 기반으로 한 탈중앙 신원 식별자

VC (Verifiable Credential)

카드사가 서명한 “한 번만 사용할 수 있는 결제권한 증명서”

VCRegistry.sol

VC 해시 저장, 사용 상태 관리, 재사용 방지 기능 수행

Veramo Agent

VC 발급 및 검증을 담당하는 백엔드 핵심 모듈

Toss API

실제 결제 요청과 결제 확인을 처리하는 외부 결제 게이트웨이

## 📈 기대 효과

사용자 DID 기반의 결제 보안성 강화

결제 정보의 위변조 및 재사용 방지

중앙 서버 의존도를 줄인 투명한 거래 구조

Web3 결제 모델의 실증적 구현

VC 수명관리 및 사용 추적 가능성 확보
