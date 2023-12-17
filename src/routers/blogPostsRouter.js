import express from "express";
import { BlogPost } from "../models/blogposts.js";
import checkUsers from "../middlewares/checkUsers.js";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const blogPostsRouter = express.Router();
blogPostsRouter.use(express.json());

blogPostsRouter.get("/", async (req, res) => {
  try {
    const titleFilter = req.query.title;

    const query = {};
    if (typeof titleFilter === "string") {
      query.title = {
        $regex: titleFilter,
        $options: "i",
      };
    }

    const blogPosts = await BlogPost.find(query).populate("author");
    res.json(blogPosts);
  } catch (error) {
    console.error("Errore durante il recupero dei blog posts", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

blogPostsRouter.get("/:id", async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id).populate("author");
    if (!blogPost) {
      return res.status(404).json({ message: "Blog post non trovato" });
    }
    res.json(blogPost);
  } catch (error) {
    console.error("Errore durante il recupero del blog post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




blogPostsRouter.get("/download/:filename", async (req, res) => {
  const filename = req.params.filename;

  res.send(path.resolve(`./uploads/${filename}` + req.params.filename));
});

blogPostsRouter.post("/", checkUsers, async (req, res) => {
  try {
    const newBlogPost = new BlogPost(req.body);
    await newBlogPost.save();
    res.status(201).json(newBlogPost);
  } catch (error) {
    console.error("Errore durante la creazione del blog post:", error);

    // Verifica se l'errore è dovuto a dati non validi
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Errore di validazione dei dati",
        errors: error.errors,
      });
    }

    // Altrimenti, gestisci gli altri errori come errore interno del server
    res.status(500).json({ message: "Internal Server Error" });
  }
});

blogPostsRouter.put("/:id", checkUsers, async (req, res) => {
  try {
    const blogPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!blogPost) {
      return res.status(404).json({ message: "Blog post non trovato" });
    }
    res.json(blogPost);
  } catch (error) {
    console.error("Errore durante l'aggiornamento del blog post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

blogPostsRouter.delete("/:id", checkUsers, async (req, res) => {
  try {
    const blogPost = await BlogPost.findByIdAndDelete(req.params.id);

    if (!blogPost) {
      return res.status(404).json({ message: "Blog post non trovato" });
    }
  } catch (error) {
    console.error("Errore durante l'eliminazione del blog post:", error);
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

blogPostsRouter.patch(
  "/:id",
  checkUsers,
  express.json(),
  upload.single("cover"),
  async (req, res, next) => {
    try {
      // Verifica se il file è presente
      if (!req.file) {
        // Se il file non è presente, setta cover a null
        req.body.cover = null;
      } else {
        // Se il file è presente, invia il file a Cloudinary e ottieni l'URL
        const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path);
        req.body.cover = cloudinaryResponse.secure_url;
      }

      // Continua con la tua logica di aggiornamento del blog post utilizzando req.body

      // Ad esempio:
      const updatedBlogPost = await BlogPost.findByIdAndUpdate(
        req.params.id,
        { cover: req.body.cover, /* altri campi del body */ },
        { new: true }
      );

      // Invia una risposta di successo
      res.status(200).json({
        message: "Blog post aggiornato con successo",
        updatedBlogPost,
      });
    } catch (error) {
      console.error("Errore durante l'aggiornamento del blog post:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);



export default blogPostsRouter;
