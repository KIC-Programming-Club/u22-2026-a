const answer = document.getElementById("answer2");
const correctEffect = document.getElementById("correct-effect");

console.log(answer);
console.log(correctEffect);

answer.addEventListener("click", function() {
    // 正解エフェクト
    correctEffect.classList.add("show");
});