import ElevenLabs from "elevenlabs-node";
import dotenv from "dotenv";
import * as fs from "fs";

const random_string = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

dotenv.config();
const tempFolder = "temp/";
const tts = async (voiceId, text) => {
  if (!fs.existsSync(tempFolder)) {
    fs.mkdirSync(tempFolder);
  }

  const voice = new ElevenLabs({
    apiKey: process.env.ELEVENLABS_API_KEY,
    voiceId,
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const fileName = `${tempFolder}tts_${timestamp}_${random_string(4)}.mp3`;
  console.log("Text to speech:", text);
  const resp = await voice.textToSpeech({ fileName, textInput: text });
  if (resp.status === "ok") {
    console.log("Audio file generated!", fileName, text);
    const buffer = fs.readFileSync(fileName);
    fs.unlinkSync(fileName);
    const base64 = `data:audio/mpeg;base64,${buffer.toString("base64")}`;
    return base64;
  }
};

export default tts;
