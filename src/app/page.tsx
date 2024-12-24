"use client";

import { FileDropzone } from "@/components/file-dropzone";
import { UploadBox } from "@/components/upload-box";
import {
  type FileUploaderResult,
  useFileUploader,
} from "@/hooks/use-file-uploader";
import { splitImage } from "@/utils";
import { useEffect, useState } from "react";

function ImageSplitCore(props: { fileUploaderProps: FileUploaderResult }) {
  const {
    imageContent,
    imageMetadata,
    rawFile,
    handleFileUploadEvent,
    cancel,
  } = props.fileUploaderProps;

  const [squareImageContent, setSquareImageContent] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (imageContent && imageMetadata) {
      const canvas = document.createElement("canvas");
      canvas.width = imageMetadata.width;
      canvas.height = imageMetadata.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Load and center the image
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setSquareImageContent(canvas.toDataURL("image/png"));
      };
      img.src = imageContent;
    }
  }, [imageContent, imageMetadata]);

  async function handleSplitImage() {
    if (rawFile && imageMetadata) {
      const images = await splitImage(rawFile, imageMetadata, 7);

      const originalFileName = imageMetadata.name;
      const fileNameWithoutExtension =
        originalFileName.substring(0, originalFileName.lastIndexOf(".")) ||
        originalFileName;

      images.forEach((blob, index) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileNameWithoutExtension}_${index}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }

  if (!imageMetadata) {
    return (
      <UploadBox
        title="Create square images with custom backgrounds. Fast and free."
        subtitle="Allows pasting images from clipboard"
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUploadEvent}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6">
        {squareImageContent && (
          <img src={squareImageContent} alt="Preview" className="mb-4" />
        )}
        <p className="text-lg font-medium text-white/80">
          {imageMetadata.name}
        </p>
      </div>

      <div className="flex gap-6 text-base">
        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60">Original</span>
          <span className="font-medium text-white">
            {imageMetadata.width} × {imageMetadata.height}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={cancel}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-red-800"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            void handleSplitImage();
          }}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          Split
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const fileUploaderProps = useFileUploader();

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Drop image file"
    >
      <ImageSplitCore fileUploaderProps={fileUploaderProps} />
    </FileDropzone>
  );
}
