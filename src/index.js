import express from "express";
import cors from "cors";
import generateStory from "./story_generator.js";

const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(post, () => {
  console.log("Server is running on port 3000");
});
