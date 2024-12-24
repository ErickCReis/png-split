"use client";

import { FileDropzone } from "@/components/file-dropzone";
import { UploadBox } from "@/components/upload-box";
import {
  type FileUploaderResult,
  useFileUploader,
} from "@/hooks/use-file-uploader";
import { splitImage } from "@/utils";
import { useState } from "react";

function ImageSplitCore(props: { fileUploaderProps: FileUploaderResult }) {
  const {
    imageContent,
    imageMetadata,
    rawFile,
    handleFileUploadEvent,
    cancel,
  } = props.fileUploaderProps;

  const [splitCount, setSplitCount] = useState(7);
  const [loading, setLoading] = useState(false);

  async function handleSplitImage() {
    if (rawFile && imageMetadata) {
      setLoading(true);

      const images = await splitImage(rawFile, imageMetadata, splitCount);

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

      setLoading(false);
    }
  }

  if (!imageMetadata) {
    return (
      <UploadBox
        title="Split wide images into multiple ones"
        subtitle="Allows pasting images from clipboard"
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUploadEvent}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-6 pb-0">
        {imageContent && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageContent} alt="Preview" className="mb-4" />
        )}
        <p className="text-lg font-medium text-white/80">
          {imageMetadata.name}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-white/60">Split count</span>
        <input
          type="number"
          min="0"
          max="999"
          value={isNaN(splitCount) ? 0 : splitCount}
          onChange={(e) => setSplitCount(parseInt(e.target.value))}
          className="w-24 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white"
          placeholder="Enter radius"
        />
      </div>

      <div className="flex gap-6 text-base">
        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60">Original</span>
          <span className="font-medium text-white">
            {imageMetadata.width} × {imageMetadata.height}
          </span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-white/5 p-3">
          <span className="text-sm text-white/60">Splitted size</span>
          <span className="font-medium text-white">
            {Math.round(imageMetadata.width / splitCount)} ×{" "}
            {imageMetadata.height}
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
          {loading ? (
            <div className="animate-spin">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v4" />
                <path d="m16.2 7.8 2.9-2.9" />
                <path d="M18 12h4" />
                <path d="m16.2 16.2 2.9 2.9" />
                <path d="M12 18v4" />
                <path d="m4.9 19.1 2.9-2.9" />
                <path d="M2 12h4" />
                <path d="m4.9 4.9 2.9 2.9" />
              </svg>
            </div>
          ) : (
            "Split"
          )}
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
