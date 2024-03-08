import ElevenLabs from "elevenlabs-node";
import dotenv from "dotenv";
import * as fs from "fs";

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
  const fileName = `${tempFolder}tts_${timestamp}.mp3`;
  console.log("Text to speech:", text);
  const resp = await voice.textToSpeech({ fileName, textInput: text });
  if (resp.status === "ok") {
    const buffer = fs.readFileSync(fileName);
    fs.unlinkSync(fileName);
    const base64 = `data:audio/mpeg;base64,${buffer.toString("base64")}`;
    return base64;
  }
};

export default tts;
