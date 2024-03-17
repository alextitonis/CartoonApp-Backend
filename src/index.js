import express from "express";
import cors from "cors";
import timeout from "connect-timeout";
import generateStory from "./story_generator.js";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import * as fs from "fs";

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
const corsOptions = {
  origin: "*",
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(timeout("1200000000"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use("/images", express.static("uploads"));

app.post("/generate", async (req, res) => {
  const { prompt, character, characterImage, genre, style, tone, themes } =
    req.body;
  const filename = uuidv4() + ".png";
  const base64Data = characterImage.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync(`uploads/${filename}`, base64Data, "base64");
  const imageUrl = `${req.protocol}://${req.get("host")}/images/${filename}`;

  console.log("Prompt:", imageUrl);

  const resp = await generateStory(prompt, character, imageUrl, {
    genre,
    style,
    tone,
    themes,
  });
  res.json(resp);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
