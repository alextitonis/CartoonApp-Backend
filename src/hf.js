import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const key = process.env.HF_API_KEY;
const hf = new HfInference(key);

export const getHf = () => {
  return hf;
};

export async function textToImage(prompt) {
  try {
    prompt += " cold color palette, muted colors, detailed, 8k";
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
  } catch (e) {
    console.log(e);
    if (!characterImage.startsWith("data:image/")) {
      return `data:image/png;base64,${characterImage}`;
    }
    return characterImage;
  }
}

export async function imageToImage(
  prompt,
  characterImage,
  negative_prompt = "nsfw, low-res",
  width = 680,
  height = 680,
  num_inference_steps = 10,
  guidance_scale = 5
) {
  try {
    const url = `http://fairytale.xenon.fun:5000/predictions`;
    if (!characterImage.startsWith("data:image/")) {
      characterImage = `data:image/png;base64,${characterImage}`;
    }
    const body = {
      input: {
        image: characterImage,
        prompt,
        negative_prompt,
        width,
        height,
        num_inference_steps,
        guidance_scale,
      },
    };
    const resp = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const img = resp.data.output;
    if (!img.startsWith("data:image/")) {
      return `data:image/png;base64,${img}`;
    }
    return img;
  } catch (e) {
    console.log(e);
    if (!characterImage.startsWith("data:image/")) {
      return `data:image/png;base64,${characterImage}`;
    }
    return characterImage;
  }
}
