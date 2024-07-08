document.getElementById("bigConet").style.display="none";
document.getElementById("usercont").style.display="none";
document.getElementById("oppNamecont").style.display="none";
document.getElementById("valueCont").style.display="none";
document.getElementById("whosTurn").style.display="none";
document.getElementById("retryButton").style.display="none";

const socket = io();
let name;
let selectedCharacter;

// Fonction pour charger les personnages depuis l'API
async function loadCharacters() {
    try {
        const response = await fetch('http://localhost:3000/api/characters/all');
        const data = await response.json();
        const selectElement = document.getElementById('characterSelect');
        selectElement.innerHTML = ''; // Clear existing options
        data.forEach(character => {
            const option = document.createElement('option');
            option.value = character._id;
            option.textContent = `${character.name} - ${character.description}`;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading characters:', error);
        const selectElement = document.getElementById('characterSelect');
        selectElement.innerHTML = '<option value="">Failed to load characters</option>';
    }
}

loadCharacters();

document.getElementById('find').addEventListener('click', function() {
    name = document.getElementById("name").value;
    selectedCharacter = document.getElementById("characterSelect").value;
    if(name === null || name === '' || selectedCharacter === '') {
        alert("Please enter a name and select a character");
    } else {
        socket.emit("find", {name: name, characterId: selectedCharacter});
        document.getElementById('loading').style.display = 'block';
    }
});

const retryButton = document.getElementById("retryButton");
retryButton.addEventListener("click", resetGame);

function resetGame() {
    socket.emit("leaveGame", {name: name});
    name = "";
    document.getElementById("name").value = "";
    document.getElementById("user").innerText = "";
    document.getElementById("oppname").innerText = "";
    document.getElementById("value").innerText = "";
    document.getElementById("whosTurn").innerText = "X's Turn";
    const characterSelect = document.getElementById("characterSelect");
    characterSelect.style.display = "block";
    characterSelect.style.margin = "0 auto";
    characterSelect.style.textAlign = "center";
    document.getElementById("choosechar").style.display="block";
    document.getElementById("bigConet").style.display="none";
    document.getElementById("usercont").style.display="none";
    document.getElementById("oppNamecont").style.display="none";
    document.getElementById("valueCont").style.display="none";
    document.getElementById("whosTurn").style.display="none";
    document.getElementById("retryButton").style.display="none";
    document.getElementById("entreNama").style.display="block";
    document.getElementById("name").style.display="block";
    document.getElementById("find").style.display="block";
    document.getElementById('loading').style.display = 'none';


    document.querySelectorAll(".btn").forEach(btn => {
        btn.innerText = "";
        btn.disabled = false;
        btn.style.color = "";
    });
}

socket.on("find",(e)=>{

let allPlayers = e.allPlayers;
console.log("Received allPlayers:", allPlayers);

    document.getElementById("bigConet").style.display="block"
    document.getElementById('loading').style.display = 'none'
    document.getElementById("entreNama").style.display="none"
    document.getElementById("name").style.display="none"
    document.getElementById("find").style.display="none"
    document.getElementById("characterSelect").style.display="none"
    document.getElementById("choosechar").style.display="none"
    document.getElementById("usercont").style.display="block"
    document.getElementById("oppNamecont").style.display="block"
    document.getElementById("valueCont").style.display="block"
    document.getElementById("whosTurn").style.display="block"
    document.getElementById("whosTurn").innerText="X's Turn"


    let oppname
    let value

    const foundObj = allPlayers.find(obj => obj.p1.p1name === name || obj.p2.p2name === name);
    if (foundObj) {
        if (foundObj.p1.p1name === name) {
            oppname = foundObj.p2.p2name;
            value = foundObj.p1.p1value;
            character = foundObj.p1.p1character;
        } else {
            oppname = foundObj.p1.p1name;
            value = foundObj.p2.p2value;
            character = foundObj.p2.p2character;
        }
        document.getElementById("user").innerText = name;
        document.getElementById("oppname").innerText = oppname;
        document.getElementById("value").innerText = value;
    } else {
        console.log("Player not found in allPlayers");
    }
});

 
document.querySelectorAll(".btn").forEach((e) => {
e.addEventListener("click", function() {
    let value = document.getElementById("value").innerText;
    let currentTurn = document.getElementById("whosTurn").innerText.split("'")[0];
    if (currentTurn === value) {
        e.innerText = value;
        socket.emit("playing", {value: value, id: e.id, name: name});
    } else {
        alert("Ce n'est pas votre tour !");
    }
});
});
socket.on("playing", (e) => {
console.log("Received playing update:", e);
const foundObj = e.allPlayers.find(obj => obj.p1.p1name === name || obj.p2.p2name === name);
if (foundObj) {
    const p1id = foundObj.p1.p1move;
    const p2id = foundObj.p2.p2move;
    
    if (foundObj.sum % 2 === 0) {
        document.getElementById("whosTurn").innerText = "O's Turn";
    } else {
        document.getElementById("whosTurn").innerText = "X's Turn";
    }

    if (p1id !== '') {
        document.getElementById(p1id).innerText = "X";
        document.getElementById(p1id).disabled = true;
        document.getElementById(p1id).style.color = "black";
    }
    if (p2id !== '') {
        document.getElementById(p2id).innerText = "O";
        document.getElementById(p2id).disabled = true;
        document.getElementById(p2id).style.color = "black";
    }

    if (e.gameStatus === "win") {
        document.getElementById("whosTurn").innerText = e.winner;
        document.querySelectorAll(".btn").forEach(btn => {
            btn.disabled = true;
        });
        document.getElementById("retryButton").style.display = "block";
    } else if (e.gameStatus === "draw") {
        document.getElementById("whosTurn").innerText = "It's a draw!";
        document.querySelectorAll(".btn").forEach(btn => {
            btn.disabled = true;
        });
        document.getElementById("retryButton").style.display = "block";
    }
} else {
    console.log("Player not found in allPlayers");
}
});