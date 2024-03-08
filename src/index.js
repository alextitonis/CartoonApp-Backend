import express from "express";
import cors from "cors";
import timeout from "connect-timeout";
import generateStory from "./story_generator.js";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
const corsOptions = {
  origin: "*",
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.json());
app.use(timeout("1200000000"));

app.post("/generate", async (req, res) => {
  const { prompt, character, genre, style, tone, themes } = req.body;
  const resp = await generateStory(prompt, character, {
    genre,
    style,
    tone,
    themes,
  });
  res.json(resp);
});

app.listen(port, () => {
  console.log("Server is running on port 3000");
});
