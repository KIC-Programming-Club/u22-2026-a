const answer1 = document.getElementById("answer1");
const correctEffect = document.getElementById("correct-effect");

console.log(answer1);
console.log(correctEffect);

answer1.addEventListener("click", function() {
    // 正解エフェクト
    correctEffect.classList.add("show");
});