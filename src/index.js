import express from "express";
import apiRouter from "./routers/apiRouter.js";
import mongoose from "mongoose";
import cors from "cors";
import passport from "passport";
import googleStrategy from "./middlewares/google.js";
import list from "express-list-endpoints"


// Inizializzo il server  con Express e la porta
const server = express();
const port = process.env.PORT;

//Configuro l'ingresso dei dati al ns server con formato Json e configura il middleware cors
server.use(express.json());
server.use(cors());

//Inizializzo passport
server.use(passport.initialize());
passport.use(googleStrategy);

//Creazione router
server.use("/api", apiRouter);

//Connessione al server

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    server.listen(port, () => {
      console.log("Server is listening on port: " + port);

    });
  })
  .catch((err) => {
    console.error("Errore di connessione al database: ", err);
  });
