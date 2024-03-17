import { Storage } from "@google-cloud/storage";
import * as fs from "fs";

export default async function uploadImageToGoogleCloudStorage(base64ImageData) {
  fs.writeFileSync("image.txt", base64ImageData);
}
