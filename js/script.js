// ==========================================
// 1. UI 인터페이스 제어
// ==========================================
function toggleFaq(element) {
    element.classList.toggle('active');
}

function switchMainPage(pageId, element) {
    const pages = document.getElementsByClassName("main-page");
    for (let i = 0; i < pages.length; i++) { pages[i].classList.remove("active"); }
    const tabBtns = document.getElementsByClassName("main-tab-btn");
    for (let i = 0; i < tabBtns.length; i++) { tabBtns[i].classList.remove("active"); }
    
    document.getElementById(pageId).classList.add("active");
    element.classList.add("active");

    if(pageId === 'page-simulator') { runXpSimulator(); }
}

function switchSubTab(event, tabId) {
    const tabContents = document.getElementsByClassName("sub-tab-content");
    for (let i = 0; i < tabContents.length; i++) { tabContents[i].classList.remove("active"); }
    const tabButtons = document.getElementsByClassName("sub-tab-btn");
    for (let i = 0; i < tabButtons.length; i++) { tabButtons[i].classList.remove("active"); }
    
    document.getElementById(tabId).classList.add("active");
    event.currentTarget.classList.add("active");
}

// ==========================================
// 2. XP 테이블 생성 (1,000레벨 지원)
// ==========================================
function getCumulativeXpByLevel(lvl) {
    if (lvl <= 0) return 0;
    return Math.floor(((23 * lvl)**2 - 525) / 5) + 1;
}

function getLevelByXp(xp) {
    if (xp <= 0) return 0;
    for (let l = 1; l <= 1000; l++) {
        let requiredTotalXp = Math.floor(((23 * l)**2 - 525) / 5) + 1;
        if (xp < requiredTotalXp) { return l - 1; }
    }
    return 1000; 
}

function renderFullXpTable() {
    const tbody = document.getElementById('full-xp-table-body');
    if (!tbody) return;

    let htmlStr = '';
    for (let i = 1; i <= 1000; i++) { 
        const cumXp = getCumulativeXpByLevel(i);
        const reqXp = i === 1 ? 0 : cumXp - getCumulativeXpByLevel(i - 1);
        htmlStr += `
            <tr id="row-lvl-${i}">
                <td style="color: #e91e3f; font-weight: 700; font-size:12px;">${i} Lv</td>
                <td style="color: #e2e8f0; font-size:12px;">${cumXp.toLocaleString()} XP</td>
                <td style="font-size:12px;">${reqXp.toLocaleString()} XP</td>
            </tr>
        `;
    }
    tbody.innerHTML = htmlStr;
}

function searchLevelXp(isManual = false) {
    const searchInput = document.getElementById('search-level-input');
    if (!searchInput) return;

    let rawVal = searchInput.value;
    if (!rawVal) {
        document.getElementById('search-cum-xp').innerText = '- XP';
        document.getElementById('search-req-xp').innerText = '- XP';
        return;
    }

    let inputVal = parseInt(rawVal);
    if (inputVal < 1) inputVal = 1;
    if (inputVal > 1000) inputVal = 1000; 
    searchInput.value = inputVal;
    
    const cumXp = getCumulativeXpByLevel(inputVal);
    const reqXp = inputVal === 1 ? 0 : cumXp - getCumulativeXpByLevel(inputVal - 1);
    
    document.getElementById('search-cum-xp').innerText = cumXp.toLocaleString() + ' XP';
    document.getElementById('search-req-xp').innerText = reqXp.toLocaleString() + ' XP';

    if (isManual) {
        const targetRow = document.getElementById(`row-lvl-${inputVal}`);
        if(targetRow) {
            targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetRow.classList.remove('highlight-pulse');
            void targetRow.offsetWidth; 
            targetRow.classList.add('highlight-pulse');
        }
    }
}

// ==========================================
// 3. 실시간 시뮬레이터 (체크박스/다중선택 개편 완벽 적용)
// ==========================================
function runXpSimulator() {
    const simLevelEl = document.getElementById('sim-level');
    const simTimeEl = document.getElementById('sim-time');
    const simAttendEl = document.getElementById('sim-attendance');
    if (!simLevelEl) return;

    // 공백일 때 제한 코드가 실행되지 않도록 조건 추가 (Placeholder 보존)
    if (simLevelEl.value !== "" && parseInt(simLevelEl.value) > 1000) simLevelEl.value = 1000;
    if (simTimeEl.value !== "" && parseInt(simTimeEl.value) > 999999) simTimeEl.value = 999999;
    if (simAttendEl.value !== "" && parseInt(simAttendEl.value) > 9999) simAttendEl.value = 9999;

    // 빈칸이면 0으로 취계산
    const level = Math.max(0, parseInt(simLevelEl.value) || 0);
    const time = Math.max(0, parseInt(simTimeEl.value) || 0);
    const attendanceCount = Math.max(0, parseInt(simAttendEl.value) || 0);
    
    const channel = document.getElementById('sim-channel').value;
    
    // 토글 스위치 (checked 불리언 값으로 변경)
    const boost1Yn = document.getElementById('sim-boost1').checked;
    const boost2Yn = document.getElementById('sim-boost2').checked;
    const eventYn = document.getElementById('sim-event').checked;
    const attendBoostYn = document.getElementById('sim-attend-boost').checked;

    // 채널 로직
    let channelBaseXp = 0;
    let levelBonusXp = 0;
    let checkInterval = 1;

    if (channel === 'chat') {
        channelBaseXp = 200; 
        levelBonusXp = 0;    
        checkInterval = 1;   
    } else {
        checkInterval = 5;   
        channelBaseXp = (channel === 'voice') ? 3000 : 3200;
        
        if (level >= 700) levelBonusXp = 1000;
        else if (level >= 649) levelBonusXp = 800;
        else if (level >= 600) levelBonusXp = 750;
        else if (level >= 550) levelBonusXp = 700;
        else if (level >= 500) levelBonusXp = 650;
        else if (level >= 450) levelBonusXp = 600;
        else if (level >= 400) levelBonusXp = 500;
        else if (level >= 350) levelBonusXp = 450; 
        else if (level >= 300) levelBonusXp = 400;
        else if (level >= 250) levelBonusXp = 350;
        else if (level >= 200) levelBonusXp = 300;
        else if (level >= 150) levelBonusXp = 250;
        else if (level >= 100) levelBonusXp = 200;
        else if (level >= 50) levelBonusXp = 150;
        else levelBonusXp = 0;
    }

    const channelCycles = Math.floor(time / checkInterval);
    const buffCycles = channelCycles; 
    const channelTotalXp = (channelBaseXp + levelBonusXp) * channelCycles;

    // 버프 다중 체크 처리
    const b1Add = boost1Yn ? 300 : 0;
    const b2Add = boost2Yn ? 100 : 0;
    const evAdd = eventYn ? 200 : 0;
    
    // 펭귄 Pill버튼 다중 중복 합산
    let penguinAdd = 0;
    if (document.getElementById('pen-child').checked) penguinAdd += 225;
    if (document.getElementById('pen-youth').checked) penguinAdd += 325;
    if (document.getElementById('pen-adult').checked) penguinAdd += 425;
    if (document.getElementById('pen-mother').checked) penguinAdd += 525;

    const buffTotalXp = (b1Add + b2Add + evAdd + penguinAdd) * buffCycles;
    const attendanceBaseTotal = attendanceCount * 5000;
    const attendanceBoostTotal = attendBoostYn ? (attendanceCount * 5000) : 0;
    
    const finalGrandTotal = channelTotalXp + buffTotalXp + attendanceBaseTotal + attendanceBoostTotal;
    const currentCumulativeXp = getCumulativeXpByLevel(level);
    const projectedTotalXp = currentCumulativeXp + finalGrandTotal;
    
    const finalLevel = getLevelByXp(projectedTotalXp);

    // 디스플레이 매핑
    document.getElementById('totalXpDisplay').innerText = projectedTotalXp.toLocaleString() + ' XP';
    document.getElementById('newXpDisplay').innerText = '(예상 추가 획득: + ' + finalGrandTotal.toLocaleString() + ' XP)';
    document.getElementById('reachedLevelDisplay').innerText = '도달 예상: ' + finalLevel + ' Lv';
    
    document.getElementById('out-channel-base').innerText = channelBaseXp.toLocaleString() + ' XP';
    document.getElementById('out-level-bonus').innerText = levelBonusXp.toLocaleString() + ' XP';
    document.getElementById('out-combined-base').innerText = (channelBaseXp + levelBonusXp).toLocaleString() + ' XP';
    document.getElementById('out-channel-cycles').innerText = channelCycles + '회';
    document.getElementById('out-channel-total').innerText = channelTotalXp.toLocaleString() + ' XP';
    
    document.getElementById('out-b1-val').innerText = b1Add.toLocaleString() + ' XP';
    document.getElementById('out-b2-val').innerText = b2Add.toLocaleString() + ' XP';
    document.getElementById('out-ev-val').innerText = evAdd.toLocaleString() + ' XP';
    document.getElementById('out-pen-val').innerText = penguinAdd.toLocaleString() + ' XP';
    document.getElementById('out-buff-cycles').innerText = buffCycles + '회';
    document.getElementById('out-buff-total').innerText = buffTotalXp.toLocaleString() + ' XP';
    
    document.getElementById('out-attend-base').innerText = attendanceBaseTotal.toLocaleString() + ' XP';
    document.getElementById('out-attend-boost').innerText = attendanceBoostTotal.toLocaleString() + ' XP';

    const cycleText = (channel === 'chat') ? '1분당' : '5분당';
    const cycleBaseText = (channel === 'chat') ? '1분' : '5분';
    document.getElementById('label-b1').innerText = `[아이템] XP Boost+ 추가합산 (${cycleText})`;
    document.getElementById('label-b2').innerText = `[아이템] [XP] S1 Boost+ 추가합산 (${cycleText})`;
    document.getElementById('label-ev').innerText = `[이벤트] 6월 Bonus 추가합산 (${cycleText})`;
    document.getElementById('label-pen').innerText = `[아이템] 펭귄 마스코트 추가합산 (${cycleText})`;
    document.getElementById('label-buff-cycles').innerText = `[아이템] 적용 인정 횟수 (${cycleBaseText} 지속 기준)`;
}

window.onload = function() {
    renderFullXpTable(); 
    runXpSimulator(); 
    searchLevelXp(false); 
};