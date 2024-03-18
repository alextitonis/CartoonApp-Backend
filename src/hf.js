import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
import Replicate from "replicate";
import * as fs from "fs";
dotenv.config();
const key = process.env.HF_API_KEY;
const hf = new HfInference(key);
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const getHf = () => {
  return hf;
};

export async function textToImage(prompt, characterImage) {
  try {
    prompt += " cold color palette, muted colors, detailed, 8k";
    characterImage = characterImage.replace(
      /^data:image\/(png|jpeg|jpg);base64,/,
      ""
    );
    const imageBlob = new Blob([Buffer.from(characterImage, "base64")], {
      type: "image/png",
    });
    console.log("Generating image for:", imageBlob);
    const resp = await hf.textToImage({
      model: "stabilityai/stable-diffusion-2",
      inputs: prompt,
      parameters: {
        negative_prompt: "blurry",
      },
    });

    console.log("Image generated!", resp);
    const buffer = await resp.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    if (!base64.startsWith("data:image/")) {
      return `data:image/png;base64,${base64}`;
    }
    return base64;
    //save file, resp is a blob
  } catch (e) {
    console.log(e);
    if (!characterImage.startsWith("data:image/")) {
      return `data:image/png;base64,${characterImage}`;
    }
    return characterImage;
  }
}
