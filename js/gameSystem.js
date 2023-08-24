// 주사위 값들을 저장할 배열
let diceValues = [];

// 현재 플레이어 (1 또는 2)
let currentPlayer = 1;

// 현재 턴 수
let remainingTurns = 3;

// 플레이어들의 점수
let player1Score = 0;
let player2Score = 0;

// 주사위 굴리기 버튼 상태 설정
function setRollButtonState(disabled) {
    document.getElementById('roll-button').disabled = disabled;
}

// 턴 종료 버튼 상태 설정
function setEndTurnButtonState(disabled) {
    document.getElementById('end-turn-button').disabled = disabled;
}

// 주사위를 굴려서 랜덤한 값 얻기
function rollDice() {
    if (remainingTurns > 0) {
        diceValues = [];
        for (let i = 0; i < 5; i++) {
            const diceValue = Math.floor(Math.random() * 6) + 1;
            diceValues.push(diceValue);
        }
        displayDice();
        remainingTurns--;
        document.getElementById('remaining-turns').innerText = remainingTurns;
    }

    if (remainingTurns === 0) {
        setRollButtonState(true);
        setEndTurnButtonState(false);
    }
}

// 주사위 값들을 화면에 표시
function displayDice() {
    const diceContainer = document.getElementById('dice-container');
    diceContainer.innerHTML = ''; // 이전 주사위 삭제

    for (let i = 0; i < diceValues.length; i++) {
        const diceValue = diceValues[i];
        const diceElement = document.createElement('div');
        diceElement.className = 'dice';
        diceElement.innerText = diceValue;
        diceContainer.appendChild(diceElement);
    }
}

// 턴 종료
function endTurn() {
    if (remainingTurns === 0) {
        calculateScore();
        document.getElementById('player1-score').innerText = player1Score;
        document.getElementById('player2-score').innerText = player2Score;
        remainingTurns = 3;
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        document.getElementById('current-player').innerText = `플레이어 ${currentPlayer}`;
        setRollButtonState(false);
        setEndTurnButtonState(true);
    }
}

// 점수 계산
function calculateScore() {
    const counts = Array.from({length: 6}, () => 0); // 주사위 값들의 빈도수를 저장하는 배열 (인덱스 0부터 5까지)
    for (const diceValue of diceValues) {
        counts[diceValue - 1]++;
    }

    let score = 0;

    // 숫자 조합 점수 계산
    for (let i = 0; i < 6; i++) {
        score += (i + 1) * counts[i];
    }

    // 풀하우스 점수 계산
    let hasThreeOfAKind = false;
    let hasTwoOfAKind = false;
    for (const count of counts) {
        if (count === 3) {
            hasThreeOfAKind = true;
        } else if (count === 2) {
            hasTwoOfAKind = true;
        }
    }
    if (hasThreeOfAKind && hasTwoOfAKind) {
        score += 25;
    }

    // 스몰 스트레이트 점수 계산
    if ((counts[0] >= 1 && counts[1] >= 1 && counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1) ||
        (counts[1] >= 1 && counts[2] >= 1 && counts[3] >= 1 && counts[4] >= 1 && counts[5] >= 1)) {
        score += 30;
    }

    // 라지 스트레이트 점수 계산
    if ((counts[0] === 1 && counts[1] === 1 && counts[2] === 1 && counts[3] === 1 && counts[4] === 1) ||
        (counts[1] === 1 && counts[2] === 1 && counts[3] === 1 && counts[4] === 1 && counts[5] === 1)) {
        score += 40;
    }

    // 야추 점수 계산
    if (counts.every(count => count === 5)) {
        score += 50;
    }

    // 누적하여 플레이어의 점수에 추가
    if (currentPlayer === 1) {
        player1Score += score;
    } else {
        player2Score += score;
    }
}