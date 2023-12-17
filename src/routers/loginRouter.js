import express from "express";
import { Author } from "../models/authors.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const loginRouter = express.Router();
loginRouter.use(express.json());

loginRouter.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(req.body);
    const existingAuthor = await Author.findOne({ email });

    if (!existingAuthor) {
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      existingAuthor.password
    );

    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenziali non valide" });
    }

    const payload = {
      id: existingAuthor._id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h", 
    });

    res.json({ id: existingAuthor._id, token });

  } catch (error) {
    console.error("Errore durante il login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default loginRouter;
