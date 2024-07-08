const mongoose=require("mongoose");

async function ConnectDb(url){
   await mongoose.connect(url,
    {
        dbName:"tictactoe",

    }
   );

   console.log("connected to the database");
}

module.exports=ConnectDb;