const wordbtn = document.getElementById("wordbtn");

const wordlist = document.getElementById("itiran");
wordlist.hidden=true;
wordbtn.addEventListener('click',()=>{
    wordlist.hidden = !wordlist.hidden;

});