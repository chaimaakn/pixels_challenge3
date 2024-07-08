const express=require("express");
const router=express.Router();
const charModel=require("../dataBase/models/character.js");


router.post("/create/char",async function(req,res){

const name=req.body.name;
const description=req.body.description;

    if(!description || !name ){
        res.status(401).json("Invalid body !! ");
        return;
    }

    try{
        const char= await charModel.findOne({name: name});
        if(char){
          res.status(401).json("the name of this character already exist !! please change it");
          return;
        }
      

        await charModel.create({
            name,description
          });
    
    res.json("Character created succesfuly");
    }
    catch(error){
    console.log(error);    
    res.json("an error has been detected");
    }
    
    }
);
router.put("/update/char/:id", async function(req, res) {
    const id=req.params.id; 
    const name=req.body.name;
    const description=req.body.description;
    try {
        const char= await charModel.findOne({ _id: id});

        if (!char) {
            return res.status(404).json({ error: "Character not found" });
        }
        

        if (name) char.name = name;
        if (description) char.description = description;
        // Attendre que la promesse de sauvegarde soit résolue
        await char.save();
        res.json("Character saved");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.delete("/delete/char/:id", async function(req, res) {
    const id = req.params.id;

    try {

        const char = await charModel.findOneAndDelete({ _id: id });

        if (!char) {
            return res.status(404).json({ error: "Character not found" });
        }

        res.json({ message: "Character deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



router.get('/characters/all', async (req, res) => {
    try {
      const characters = await charModel.find(); 
      res.json(characters); 
    } catch (err) {
      res.status(500).json({error: "Internal Server Error"  }); 
    }
  });
  

module.exports=router;