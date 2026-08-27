document.addEventListener('DOMContentLoaded', () => {
    // quiz.htmlへ画面遷移する処理
    const navigateToQuiz = () => {
        window.location.href = 'quiz.html';
    };

    // a) 「スタート」ボタンクリック時の処理
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', navigateToQuiz);
    }

    // b) Enterキー、 c) スペースキーを押した時の処理
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') {
            event.preventDefault();
            navigateToQuiz();
        }
    });
});
