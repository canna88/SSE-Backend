import {model,Schema} from "mongoose";

const BlogPostSchema = new Schema({
    category: { type: String },
    title: { type: String },
    cover: { type: String },
    readTime: {
        value: { type: Number },
        unit: { type: String, default: "min" },
    },
    author: {type: Schema.Types.ObjectId, ref: "Author"},
    content: { type: String },
    comments: [{
        _id: { type: Schema.Types.ObjectId, auto: true },
        text: { type: String },
    }],
});

export const BlogPost = model("BlogPost", BlogPostSchema, "blogposts");
