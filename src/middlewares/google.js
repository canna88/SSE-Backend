import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Author } from "../models/authors.js";
import bcrypt from "bcrypt";

const googleStrategy = new GoogleStrategy(
  {
    clientID:
      "525117999541-c9m1oth3eo46ho438g9p2n74n1s6ebbu.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3030/api/authors/oauth-google-callback",
  },
  async function (_, __, profile, cb) {
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
    console.log(profile);

    const GoogleAuthor = await Author.findOne({ email: profile._json.email });
    if (!GoogleAuthor) {
      console.log("Profilo: ", profile._json.given_name, profile._json.family_name, profile._json.email);
      
      const hashedPassword = await bcrypt.hash(profile.id,10)

      const newAuthor = new Author({
        firstName: profile._json.given_name,
        lastName: profile._json.family_name,
        avatar: profile._json.picture,
        email: profile._json.email,
        password: hashedPassword,
      });

      await newAuthor.save();
      console.log("Nuovo autorizzato: ", newAuthor);
      return cb(null, newAuthor);
    } else {
      console.log("Utente già esistente: ", GoogleAuthor);

      return cb(null, GoogleAuthor);
    }
  }
);

export default googleStrategy;
