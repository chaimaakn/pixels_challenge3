const express=require("express");
const router=express.Router();
const userModel=require("../dataBase/models/user");


router.post("/create/user", async function(req, res) {
    const name = req.body.name;
    
    if (!name) {
        res.status(401).json("Invalid body !!");
        return;
    }

    try {
        await userModel.create({
            name,
            
        });
    
        res.json("user created successfully");
    } catch (error) {
        console.log(error);
        res.json("An error has been detected");
    }
});

router.put("/update/user/:id", async function(req, res) {
    const id=req.params.id; 
    const name=req.body.name;
    const Date=req.body.Date;
    try {
        const char= await userModel.findOne({ _id: id});

        if (!char) {
            return res.status(404).json({ error: "user not found" });
        }
        

        if (name) char.name = name;
        if (Date) char.Date = Date;
        // Attendre que la promesse de sauvegarde soit résolue
        await char.save();
        res.json("user saved");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.delete("/delete/user/:id", async function(req, res) {
    const id = req.params.id;

    try {

        const char = await userModel.findOneAndDelete({ _id: id });

        if (!char) {
            return res.status(404).json({ error: "user not found" });
        }

        res.json({ message: "user deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



router.get('/users/all', async (req, res) => {
    try {
      const characters = await userModel.find(); 
      res.json(characters); 
    } catch (err) {
      res.status(500).json({error: "Internal Server Error"  }); 
    }
  });
  

module.exports=router;