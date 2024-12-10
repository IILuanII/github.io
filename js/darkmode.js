
var positionText = `MODO ESCURO`;

document.getElementById("darkModeToggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    if (positionText == `MODO ESCURO`) {
        positionText = `MODO CLARO`;
        
    }else{ positionText = `MODO ESCURO`;}

    modo = document.getElementById("darkModeToggle");
    modo.innerText = positionText;

});


