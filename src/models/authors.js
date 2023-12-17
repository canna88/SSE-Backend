import { model, Schema } from "mongoose";

const AuthorSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  password: { type: String },
  dataDiNascita: { type: String }, // Puoi anche utilizzare il tipo di dato Date se preferisci gestire le date in modo più robusto
  avatar: { type: String },
});

export const Author = model("Author", AuthorSchema, "authors");
