import express from "express";
import checkUsers from "../middlewares/checkUsers.js";
import { Author } from "../models/authors.js";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import bcrypt from "bcrypt";
import checkJwt from "../middlewares/checkJwt.js";
import passport from "passport";
import googleStrategy from "../middlewares/google.js";
import jwt from "jsonwebtoken";

const authorsRouter = express.Router();
authorsRouter.use(express.json());

//Google login

authorsRouter.get(
  "/oauth-google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

authorsRouter.get(
  "/oauth-google-callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    
    const payload = { id: req.user.id };
    console.log("Dati dell'utente: ", payload);
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.redirect(`http://localhost:3000/login/?token=${token}&userId=${req.user.id}`);
  }
);


//Rotte tradizionali

authorsRouter.get("/", async (req, res) => {
  try {
    const authors = await Author.find({}); // Esegui la query per ottenere tutti gli autori

    res.json(authors); // Invia la risposta JSON con gli autori
  } catch (error) {
    console.error("Errore durante il recupero degli autori:", error);
    // Invia una risposta di errore
    res.status(500).json({ message: "Internal Server Error" });
  }
});

authorsRouter.get("/:id", checkJwt, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ message: "Autore non trovato" });
    }
    res.json(author);
  } catch (error) {
    console.error("Errore durante il recupero dell'autore:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

authorsRouter.post("/", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // Creazione di un nuovo autore
    const newAuthor = new Author({
      ...req.body,
      password: hashedPassword,
    });

    // Salvataggio dell'autore nel database
    const savedAuthor = await newAuthor.save();
    res.status(201).json(newAuthor);
  } catch (error) {
    console.error("Errore durante la creazione dell'autore:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

authorsRouter.put("/:id", checkJwt, async (req, res) => {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!author) {
      return res.status(404).json({ message: "Autore non trovato" });
    }
    res.json(author);
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'autore:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

authorsRouter.delete("/:id", checkUsers, async (req, res) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) {
      return res.status(404).json({ message: "Autore non trovato" });
    }
    res.status(204).json(); // Risposta vuota con status code 204 No Content
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'autore:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//PATCH
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "epicode-strive-school",
  },
});

const upload = multer({
  storage: cloudinaryStorage,
});

// Endpoint PATCH
authorsRouter.patch(
  "/:id",
  express.json(),
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        req.body.avatar = null;
      } else {
        const cloudinaryResponse = await cloudinary.uploader.upload(
          req.file.path
        );
        req.body.avatar = cloudinaryResponse.secure_url;
      }

      const updatedAuthorAvatar = await Author.findByIdAndUpdate(
        req.params.id,
        { avatar: req.body.avatar },
        { new: true }
      );

      res.status(200).json({
        message: "Autore aggiornato con successo",
        updatedAuthorAvatar,
      });
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'autore:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default authorsRouter;
