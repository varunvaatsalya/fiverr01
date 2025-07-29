"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showError } from "@/app/utils/toast";
import imageCompression from "browser-image-compression";

function ImageDropUploader({
  imageId,
  setImageId,
  folder = "general",
  purpose = "form-upload",
}) {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("Please upload a valid image file.");
      return;
    }
    setUploading(true);

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: "image/jpeg",
    };

    try {
      const compressedFile = await imageCompression(file, options);

      // 🆕 Rename compressed file
      const timestamp = Date.now();
      const extension = "jpeg"; // bcz we're forcing image/jpeg above
      const customFileName = `${timestamp}_upload.${extension}`;

      // Wrap in File object to preserve name
      const renamedFile = new File([compressedFile], customFileName, {
        type: compressedFile.type,
      });
      const formData = new FormData();
      formData.append("image", renamedFile);
      formData.append("folder", folder);
      formData.append("purpose", purpose);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setPreviewUrl(data.filepath);
        setImageId(data.imageId);
        // setTempImageId(data.imageId);
      } else {
        showError(data.message || "Image upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      showError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const deleteTempImage = async () => {
    if (imageId) {
      const body = JSON.stringify({ id: imageId });
      const blob = new Blob([body], { type: "application/json" });
      setPreviewUrl("");
      setImageId(null);
      navigator.sendBeacon("/api/uploads/delete", blob);
    }
  };

  useEffect(() => {
    if (!imageId) setPreviewUrl("");
    const handleRouteChange = () => deleteTempImage();
    const handleUnload = () => deleteTempImage();

    window.addEventListener("beforeunload", handleUnload);
    router.events?.on("routeChangeStart", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      router.events?.off("routeChangeStart", handleRouteChange);
    };
  }, [imageId]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <>
      <div className="flex items-start gap-1 w-full">
        <div className="flex-1 aspect-video border-2 border-dashed rounded-md">
          {previewUrl ? (
            <Image
              src={`/api${previewUrl}`}
              alt="Preview"
              width={256}
              height={160}
              className="w-full h-full object-contain rounded"
            />
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`w-full h-full flex justify-center items-center cursor-pointer ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-400"
              }`}
            >
              <p className="text-gray-400">
                {isDragging
                  ? "Drop image here"
                  : uploading
                  ? "Uploading..."
                  : "Click or drag & drop image"}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {previewUrl && (
          <button
            className="p-2 bg-red-600 text-white text-xs rounded-full"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteTempImage();
            }}
          >
            ✕
          </button>
        )}
      </div>
    </>
  );
}

export default ImageDropUploader;
