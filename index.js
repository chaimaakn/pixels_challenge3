const express=require("express");
const app=express();
const CharModel=require("./dataBase/models/character.js");
const UserModel=require("./dataBase/models/user.js");
const ConnectDb = require("./dataBase/main.js");
const path=require("path");
const http=require("http");
const dotenv=require("dotenv");
dotenv.config();
const {Server}=require("socket.io");


const server=http.createServer(app);
const io =new Server(server);
app.use(express.json());
app.use(express.static(path.resolve("")));
let arr=[]
let playinArray=[]
function checkWinner(moves) {
    const winningCombos = [
        ['btn1', 'btn2', 'btn3'],
        ['btn4', 'btn5', 'btn6'],
        ['btn7', 'btn8', 'btn9'],
        ['btn1', 'btn4', 'btn7'],
        ['btn2', 'btn5', 'btn8'],
        ['btn3', 'btn6', 'btn9'],
        ['btn1', 'btn5', 'btn9'],
        ['btn3', 'btn5', 'btn7']
    ];

    for (let combo of winningCombos) {
        if (combo.every(btn => moves.includes(btn))) {
            return true;
        }
    }
    return false;
}

function removePlayer(playerName) {
    arr = arr.filter(name => name !== playerName);
    playinArray = playinArray.filter(game => 
        game.p1.p1name !== playerName && game.p2.p2name !== playerName
    );
}

io.on("connection",(socket)=>{


    socket.on("find", async (e) => {
        if (e.name != null && e.characterId != null) {
            try {
                const user = await UserModel.findOne({ name: e.name });
                if (!user) {
                    console.log(`User not found: ${e.name}, creating a new one.`);
                  
                    
                    // Création de l'utilisateur
                    await UserModel.create({
                        name: e.name,
                        
                    });
                } else {
                    console.log(`User already exists: ${e.name}`);
                }
                const character = await CharModel.findById(e.characterId);
                if (!character) {
                    socket.emit("error", { message: "Character not found" });
                    return;
                }

                removePlayer(e.name);
                arr.push({ name: e.name, characterId: e.characterId });
                if (arr.length >= 2) {
                    let p1 = arr[0];
                    let p2 = arr[1];
                    let p1char = await CharModel.findById(p1.characterId);
                    let p2char = await CharModel.findById(p2.characterId);
                    
                    let obj = {
                        p1: { p1name: p1.name, p1value: "X", p1move: "", p1character: p1char.name },
                        p2: { p2name: p2.name, p2value: "O", p2move: "", p2character: p2char.name },
                        sum: 1
                    };
                    playinArray.push(obj);
                    arr.splice(0, 2);
                    io.emit("find", { allPlayers: playinArray });
                }
            } catch (error) {
                console.error("Error in find event:", error);
                socket.emit("error", { message: "An error occurred" });
            }
        }
    });
    socket.on("playing", (e) => {
        console.log("Received playing update:", e);
        console.log("Current playinArray:", playinArray);
        
        let objToChange = playinArray.find(obj => 
            obj.p1.p1name === e.name || obj.p2.p2name === e.name
        );

        if (objToChange) {
            let currentPlayer, otherPlayer;
            if (e.value === "X" && objToChange.p1.p1name === e.name) {
                currentPlayer = objToChange.p1;
                otherPlayer = objToChange.p2;
                objToChange.p1.p1move = e.id;
            } else if (e.value === "O" && objToChange.p2.p2name === e.name) {
                currentPlayer = objToChange.p2;
                otherPlayer = objToChange.p1;
                objToChange.p2.p2move = e.id;
            } else {
                console.log("Mismatch between player value and name");
                return;
            }

            currentPlayer.moves = currentPlayer.moves || [];
            currentPlayer.moves.push(e.id);

            objToChange.sum++;

            let gameStatus = "ongoing";
            if (checkWinner(currentPlayer.moves)) {
                gameStatus = "win";
            } else if (objToChange.sum === 9) {
                gameStatus = "draw";
            }

            io.emit("playing", {
                allPlayers: playinArray, 
                gameStatus: gameStatus, 
                winner: gameStatus === "win" ? currentPlayer.p1name || currentPlayer.p2name : null
            });
        } else {
            console.log("Player not found in playinArray:", e.name);
        }
    });

    socket.on("resetGame", (data) => {
        // Supprimer le joueur des tableaux
        arr = arr.filter(playerName => playerName !== data.name);
        playinArray = playinArray.filter(game => 
            game.p1.p1name !== data.name && game.p2.p2name !== data.name
        );
    
        console.log("Game reset for player:", data.name);
        console.log("Updated playinArray:", playinArray);
    });

    socket.on("leaveGame", (data) => {
        removePlayer(data.name);
        console.log("Player left the game:", data.name);
        console.log("Updated arr:", arr);
        console.log("Updated playinArray:", playinArray);
    });


})
app.get("/hollowdev", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.use("/api",require("./Routes/Route2.js"));


async function start() {
    try {
        await ConnectDb(process.env.DATABASE_URL);
        server.listen(3000,() => {
            console.log('Server is running on port ' + 3000);
        });
    } catch (error) {
        console.log("An error occurred", error);
    }
}

start();

