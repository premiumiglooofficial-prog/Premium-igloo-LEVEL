// 페이지 전환 기능
function switchMainPage(pageId, element) {
    document.querySelectorAll('.main-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.main-tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    element.classList.add('active');
}

// 기타 시뮬레이터 및 테이블 계산 로직을 여기에 추가하세요.