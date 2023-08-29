function setSub() {
    let player1Sub = document.getElementById("player1-sub");
    let player2Sub = document.getElementById("player2-sub");

    let player1Aces = document.getElementById("player1-aces");
    let player1Twos = document.getElementById("player1-twos");
    let player1Threes = document.getElementById("player1-threes");
    let player1Fours = document.getElementById("player1-fours");
    let player1Fives = document.getElementById("player1-fives");
    let player1Sixes = document.getElementById("player1-sixes");

    let player1Sum = 0;
    if(!isNaN(parseInt(player1Aces.textContent))) {
        player1Sum += parseInt(player1Aces.textContent);
    }
    if(!isNaN(parseInt(player1Twos.textContent))) {
        player1Sum += parseInt(player1Twos.textContent);
    }
    if(!isNaN(parseInt(player1Threes.textContent))) {
        player1Sum += parseInt(player1Threes.textContent);
    }
    if(!isNaN(parseInt(player1Fours.textContent))) {
        player1Sum += parseInt(player1Fours.textContent);
    }
    if(!isNaN(parseInt(player1Fives.textContent))) {
        player1Sum += parseInt(player1Fives.textContent);
    }
    if(!isNaN(parseInt(player1Sixes.textContent))) {
        player1Sum += parseInt(player1Sixes.textContent);
    }

    let player2Aces = document.getElementById("player2-aces");
    let player2Twos = document.getElementById("player2-twos");
    let player2Threes = document.getElementById("player2-threes");
    let player2Fours = document.getElementById("player2-fours");
    let player2Fives = document.getElementById("player2-fives");
    let player2Sixes = document.getElementById("player2-sixes");

    let player1Bonus = document.getElementById("player1-bonus");
    let player2Bonus = document.getElementById("player2-bonus");

    let player2Sum = 0;
    if(!isNaN(parseInt(player2Aces.textContent))) {
        player2Sum += parseInt(player2Aces.textContent);
    }
    if(!isNaN(parseInt(player2Twos.textContent))) {
        player2Sum += parseInt(player2Twos.textContent);
    }
    if(!isNaN(parseInt(player2Threes.textContent))) {
        player2Sum += parseInt(player2Threes.textContent);
    }
    if(!isNaN(parseInt(player2Fours.textContent))) {
        player2Sum += parseInt(player2Fours.textContent);
    }
    if(!isNaN(parseInt(player2Fives.textContent))) {
        player2Sum += parseInt(player2Fives.textContent);
    }
    if(!isNaN(parseInt(player2Sixes.textContent))) {
        player2Sum += parseInt(player2Sixes.textContent);
    }

    player1Sub.textContent = player1Sum;
    player2Sub.textContent = player2Sum;

    if(player1Sum > 64)
        player1Bonus.textContent = 35;
    if(player2Sum > 64)
        player2Bonus.textContent = 35;
}

function setTotal() {
    let player1Total = document.getElementById("player1-total");
    let player2Total = document.getElementById("player2-total");

    player1Total.textContent = "0";
    player2Total.textContent = "0";
}

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