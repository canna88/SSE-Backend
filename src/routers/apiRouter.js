import express from "express";
import blogPostsRouter from "./blogPostsRouter.js";
import authorsRouter from "./authorsRouter.js";
import loginRouter from "./loginRouter.js";


//Creazione router
const apiRouter = express.Router()

apiRouter.use(express.json());

apiRouter.use("/blogposts", blogPostsRouter);
apiRouter.use("/authors", authorsRouter);
apiRouter.use("/login", loginRouter);


export default apiRouter;
