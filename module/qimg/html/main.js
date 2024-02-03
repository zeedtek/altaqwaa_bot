document.addEventListener('DOMContentLoaded', async function () {

    setTimeout(async () => {
        const answerGreen = document.getElementById("green");
        const time = document.getElementById("time");
        time.src = "./true.png";
        answerGreen.style.backgroundColor = "#53925b";
        answerGreen.style.boxShadow = "#00000066 0px 2px 4px, #0000004d 0px 7px 13px -3px, #00000033 0px -3px 0px inset;";
    }, 2000);

});
