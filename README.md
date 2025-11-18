# ⛓️NOVAPAY
## 🖥️ 서비스 소개

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

2025.03 ~ 06 : 주제 선정 및 스터디

2025.07 ~ 08 : 개발 중점 

2025.09 ~ 11 : 보안성 강화 및 정리 



## ⚙️ 사용 환경 및 오픈소스 라이브러리 
Backend: Node[22.17.0], Express[5.1.0], Veramo, Hardhat, Solidity

Frontend: React, Ethers[6.15.0], Toss Payments

Blockchain: Hardhat (Local Ethereum)[2.25.0]

Wallet: MetaMask Extension[13.6.0]

Verifiable Credential Agent opensource: Veramo

Payment Gateway opensource: Toss Payments API (테스트 결제)

Database: On-chain Registry (VC 해시 저장)



## 🧠 주요 개념 

DID (Decentralized Identifier)
: 사용자의 지갑 주소를 기반으로 한 탈중앙 신원 식별자

VC (Verifiable Credential)
: 카드사가 서명한 한 번만 사용할 수 있는 결제권한 증명서

블록체인 (BlockChain)
: VC 해시를 기록하고 사용 여부를 표시하여 double-spend 가능성을 차단 

MetaMask
: 사용자는 서명 요청을 승인함으로써 자신이 이 VC의 실제 소유자임을 증명



## 💳결제 흐름 요약 
1️⃣ DID 생성 및 메타마스크 서명 : 사용자가 자신의 지갑 주소 기반으로 서명합니다.

2️⃣ VC 발급 (Veramo Agent) : 카드사 서버가 사용자의 DID로 결제권한 VC를 발급합니다.

3️⃣ VC 해시 등록 (스마트컨트랙트) : 발급된 VC의 해시값을 온체인에 등록합니다.

4️⃣ VC 검증 및 사용 기록 : 결제 시 VC를 검증하고, 사용 후 사용 기록을 블록체인에 기록합니다. 

5️⃣ 결제 요청 (Toss payments API) : VC가 유효하면 Toss 결제창이 자동 호출되고 결과를 저장합니다.

6️⃣ 결제 결과 페이지 표시 : VC 만료 시간, 결제 정보, 사용 일시 등을 시각적으로 제공합니다.



## ⌛핵심 보안 요소 
무결성과 일회성 보장을 위한 VC 유효성 이중 검증
#### 서비스 제공자
- 결제 요청 이전에 제출된 VC의 만료 시간
- 블록체인에 기록된 사용 여부
- 블록체인 VC 해시와의 일치 여부
#### -> VC가 유효한 경우에만 결제를 요청 가능 

#### 카드사
- 승인 단계에서 VC의 만료 시간을 재확인
#### -> 시간 경과로 인한 무효 상태를 방지

#### 서비스 제공자
- 승인 결과가 서비스 제공자에게 전달될 때, confirm API를 호출
#### -> 문제가 없을 경우 해당 VC를 블록체인에 사용 완료 상태로 기록하여 재사용을 차단



## 📈 기대 효과

사용자 DID 기반의 결제 보안성 강화

결제 정보의 위변조 및 재사용 방지

중앙 서버 의존도를 줄인 투명한 거래 구조

Web3 결제 모델의 실증적 구현

VC 수명관리 및 사용 추적 가능성 확보
