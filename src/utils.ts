import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const FFMPEG_CORE_VERSION = "0.12.6";
const baseURL = `https://unpkg.com/@ffmpeg/core-mt@${FFMPEG_CORE_VERSION}/dist/umd`;

export async function splitImage(
  image: File,
  imageSize: { width: number; height: number },
  parts: number,
): Promise<Blob[]> {
  const ffmpeg = new FFmpeg();

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript",
    ),
  });

  ffmpeg.on("log", ({ message }) => {
    console.log(message);
  });

  // Step 1: Write the input file to the FFmpeg file system
  await ffmpeg.writeFile(image.name, await fetchFile(image));

  const { width, height } = imageSize;
  const partWidth = Math.floor(width / parts);

  const outputBlobs: Blob[] = [];

  for (let i = 0; i < parts; i++) {
    const outputFileName = `part${i}.png`;
    const cropFilter = `crop=${partWidth}:${height}:${i * partWidth}:0`;

    await ffmpeg.exec([
      "-i",
      image.name,
      "-vf",
      cropFilter,
      "-frames:v",
      "1",
      outputFileName,
    ]);

    const data = await ffmpeg.readFile(outputFileName);
    outputBlobs.push(new Blob([data], { type: "image/png" }));
  }

  return outputBlobs;
}
