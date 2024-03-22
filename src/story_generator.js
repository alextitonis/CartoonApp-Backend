import { getHf, textToImage, imageToImage } from "./hf.js";
import * as fs from "fs";
import tts from "./tts.js";

const voiceId = "21m00Tcm4TlvDq8ikWAM";

export default async function generateStory(
  story_tag_line,
  character,
  characterImage,
  story_settings = { genre, style, tone, themes: [] }
) {
  let prompt = "<INFORMATION>\n";
  prompt += `Base on the following tag line: ${story_tag_line}\n`;
  prompt += `Main Character: ${character.name}\n`;
  prompt += `Genre: ${story_settings.genre}\n`;
  prompt += `Style: ${story_settings.style}\n`;
  prompt += `Tone: ${story_settings.tone}\n`;
  prompt += `Themes: ${story_settings.themes.join(", ")}\n`;
  prompt += "</INFORMATION>\n";
  prompt += "<FORMAT>\n";
  prompt +=
    "Must return 2-4 panels, with information on the panel and a line of the person speaking\n";
  prompt += "Example:\n";
  prompt += "Panel {number}:\n";
  prompt += "Dialogue: {dialogue}\n";
  prompt += "Description: {description}\n";
  prompt += "ImageType: {imageType}\n";
  prompt +=
    "Dialogue is a line that the character is saying in the panel and description is the description of the scene and character\n";
  prompt += "Both dialogue and description should be short!\n";
  prompt += "Image type can either be character or environment!\n";
  prompt += "<FORMAT>\n";
  prompt +=
    "[INST]Write a story with the information above, make it interesting and engaging. The story should atleast 3 panels, up to 5 panels. [/INST]";

  const hf = getHf();
  const hfResponse = await hf.textGeneration({
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    inputs: prompt,
    parameters: {
      max_new_tokens: 10000,
      return_full_text: false,
      repetition_penalty: 1.2,
    },
  });

  const resp = hfResponse.generated_text;
  const panels = [];
  const panelPattern =
    /Panel (\d+):\s+Dialogue: "(.+)"\s+Description: (.+)\s+Image Type: (.+)/g;

  let match;
  while ((match = panelPattern.exec(resp)) !== null) {
    const panel = {
      index: parseInt(match[1]),
      dialogue: match[2],
      description: match[3],
      imageType: match[4], // Extract ImageType
    };
    panels.push(panel);
  }

  if (panels.length >= 3) {
    panels.splice(3);
  }

  const promises = [];
  console.log("Total panels:", panels.length);
  for (let i = 0; i < panels.length; i++) {
    const description = panels[i].description;
    console.log("Generating image for:", description);
    const imageType = panels[i].imageType.toLowerCase().trim();
    if (imageType == "environment") {
      promises.push(
        textToImage(description).then((img) => {
          console.log("Image generated!");
          panels[i].img = img;
        })
      );
    } else {
      promises.push(
        imageToImage(description, characterImage).then((img) => {
          console.log("Image generated!");
          panels[i].img = img;
        })
      );
    }
    promises.push(
      tts(voiceId, panels[i].dialogue).then((audio) => {
        console.log("Audio generated!");
        panels[i].audio = audio;
      })
    );
  }

  await Promise.all(promises);
  console.log("Story generated!");

  fs.writeFileSync("story.json", JSON.stringify(panels));
  return panels;
}

/*let b64 = fs.readFileSync("test.jpeg", "base64");
if (!b64.startsWith("data:image/")) {
  b64 = `data:image/png;base64,${b64}`;
}

const resp = await generateStory(
  "An astronaut is stranded on a distant planet.",
  "John",
  b64,
  {
    genre: "Science Fiction",
    style: "Hard Sci-Fi",
    tone: "Serious",
    themes: ["Survival", "Isolation"],
  }
);

for (let i = 0; i < resp.length; i++) {
  //img is base64 save it as file
  const img = resp[i].img;
  const buffer = Buffer.from(img, "base64");
  fs.writeFileSync(`panel_${i}.png`, buffer);
  console.log(resp[i].line);
}
*/
