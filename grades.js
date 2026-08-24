/*成績データをCSS→HTMLに反映 */
const percentageCorrect = getComputedStyle(document.documentElement).getPropertyValue("--correct");
document.getElementById("percentage-correct").textContent = percentageCorrect.trim();

const percentageIncorrect = getComputedStyle(document.documentElement).getPropertyValue("--incorrect");
document.getElementById("percentage-incorrect").textContent = percentageIncorrect.trim();

const percentageUnanswered = getComputedStyle(document.documentElement).getPropertyValue("--unanswered");
document.getElementById("percentage-unanswered").textContent = percentageUnanswered.trim();

const wordbtn = document.getElementById("wordbtn");

const wordlist = document.getElementById("itiran");
wordlist.hidden=true;
wordbtn.addEventListener('click',()=>{
    wordlist.hidden = !wordlist.hidden;

});