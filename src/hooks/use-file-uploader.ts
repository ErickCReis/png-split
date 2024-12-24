import { type ChangeEvent, useCallback, useState } from "react";
import { useClipboardPaste } from "./use-clipboard-paste";

const parseImageFile = (
  content: string,
  fileName: string,
): Promise<{
  content: string;
  metadata: { width: number; height: number; name: string };
}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        content,
        metadata: {
          width: img.width,
          height: img.height,
          name: fileName,
        },
      });
    };
    img.src = content;
  });
};

export type FileUploaderResult = {
  /** The processed image content as a data URL (for regular images) or object URL (for SVGs) */
  imageContent: string;
  /** The raw file content as a string */
  rawContent: string;
  /** The raw file */
  rawFile: File | null;
  /** Metadata about the uploaded image including dimensions and filename */
  imageMetadata: {
    width: number;
    height: number;
    name: string;
  } | null;
  /** Handler for file input change events */
  handleFileUpload: (file: File) => void;
  handleFileUploadEvent: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Resets the upload state */
  cancel: () => void;
};

/**
 * A hook for handling file uploads, particularly images and SVGs
 * @returns {FileUploaderResult} An object containing:
 * - imageContent: Use this as the src for an img tag
 * - rawContent: The raw file content as a string (useful for SVG tags)
 * - imageMetadata: Width, height, and name of the image
 * - handleFileUpload: Function to handle file input change events
 * - cancel: Function to reset the upload state
 */
export const useFileUploader = (): FileUploaderResult => {
  const [imageContent, setImageContent] = useState<string>("");
  const [rawContent, setRawContent] = useState<string>("");
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [imageMetadata, setImageMetadata] = useState<{
    width: number;
    height: number;
    name: string;
  } | null>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setRawContent(content);
      setRawFile(file);

      const { content: imgContent, metadata } = await parseImageFile(
        content,
        file.name,
      );
      setImageContent(imgContent);
      setImageMetadata(metadata);
    };

    reader.readAsDataURL(file);
  };

  const handleFileUploadEvent = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFilePaste = useCallback((file: File) => {
    processFile(file);
  }, []);

  useClipboardPaste({
    onPaste: handleFilePaste,
    acceptedFileTypes: ["image/*", ".jpg", ".jpeg", ".png", ".webp"],
  });

  const cancel = () => {
    setImageContent("");
    setImageMetadata(null);
  };

  return {
    imageContent,
    rawContent,
    rawFile,
    imageMetadata,
    handleFileUpload: processFile,
    handleFileUploadEvent,
    cancel,
  };
};
