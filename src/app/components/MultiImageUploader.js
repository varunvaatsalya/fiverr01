"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { showError } from "@/app/utils/toast";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { FaArrowLeft, FaArrowRight, FaExpandArrowsAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MultiImageUploader({
  multiple = true,
  limit = 5, // max images allowed
  folder = "general",
  purpose = "form-upload",
  images,
  addImage,
  removeImage,
  updateImage,
}) {
  const fileInputRef = useRef(null);
  const router = useRouter();

  const [expandBillImage, setExpandBillImage] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFileSelect = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("Please upload a valid image file.");
      return;
    }

    // limit check
    if (multiple && images.length >= limit) {
      showError(`You can only upload ${limit} images.`);
      return;
    }
    if (!multiple && images.length >= 1) {
      showError("Only one image allowed.");
      return;
    }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      fileType: "image/jpeg",
    };

    try {
      const compressedFile = await imageCompression(file, options);

      const timestamp = Date.now();
      const extension = "jpeg";
      const customFileName = `${timestamp}_upload.${extension}`;

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
        const newImage = {
          _id: data.imageId,
          url: data.filepath,
          used: false,
          markForDelete: false,
        };

        addImage(newImage);
      } else {
        showError(data.message || "Image upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      showError("Image upload failed. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveImage = (id) => {
    const index = images.findIndex((img) => img._id === id);
    if (index === -1) return; // id nahi mili to skip

    const current = images[index];
    if (!current) return;

    if (current.used) {
      if (
        !window.confirm(
          "This image is already used in the invoice. Are you sure you want to remove it?"
        )
      )
        return;
      updateImage(index, { ...current, markForDelete: true });
      return;
    }
    try {
      removeImage(index);
      const payload = new Blob([JSON.stringify({ id })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/uploads/delete", payload);
    } catch (err) {
      console.error("Failed to remove image:", err);
    }
  };

  const removeAllImages = () => {
    try {
      if (!images.length) return;

      const ids = images.filter((f) => !f.used).map((f) => f._id);

      for (let i = images.length - 1; i >= 0; i--) {
        if (!images[i].used) {
          removeImage(i);
        }
      }

      const payload = new Blob([JSON.stringify({ ids })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/uploads/delete?multiple=1", payload);
    } catch (err) {
      console.error("Failed to remove all images:", err);
    }
  };

  useEffect(() => {
    const handleRouteChange = () => removeAllImages();
    const handleUnload = () => removeAllImages();

    window.addEventListener("beforeunload", handleUnload);
    router.events?.on("routeChangeStart", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      router.events?.off("routeChangeStart", handleRouteChange);
    };
  }, [images]);

  const activeImages = images.filter((img) => !(img.used && img.markForDelete));

  return (
    <>
      <div className="w-full flex flex-wrap gap-4">
        {activeImages.map((img) => (
          <div key={img.id} className="relative w-40 h-28">
            <Image
              src={`/api${img.url}`}
              alt="Uploaded"
              width={256}
              height={160}
              className="object-contain w-full h-full rounded"
            />
            <div className="flex flex-col gap-2 absolute top-1 right-1">
              <button
                type="button"
                onClick={() => handleRemoveImage(img._id)}
                className="bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(activeImages.indexOf(img));
                  setExpandBillImage(true);
                }}
                className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
              >
                <FaExpandArrowsAlt className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload button (hidden if limit reached) */}
        {((multiple && activeImages.length < limit) ||
          (!multiple && activeImages.length < 1)) && (
          <div
            className="w-40 h-28 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/40 rounded-lg cursor-pointer hover:border-primary hover:text-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-2 rounded-full bg-muted-foreground/10 text-muted-foreground">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground">Upload Image</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
        <Dialog open={expandBillImage} onOpenChange={setExpandBillImage}>
          <DialogContent className="max-w-4xl h-[80vh] min-h-0 text-black p-4 flex flex-col">
            <DialogHeader className="shrink-0">
              <DialogTitle>Bill Preview</DialogTitle>
            </DialogHeader>

            {/* Image container */}
            <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center">
              {activeImages && activeImages.length > 0 && (
                <Image
                  height={800}
                  width={800}
                  src={`/api${activeImages[currentIndex].url}`}
                  alt={`Expanded Bill ${currentIndex + 1}`}
                  className={`object-contain w-full h-full transition-transform duration-300`}
                />
              )}
            </div>

            {/* Navigation + Rotate buttons */}
            <div className="shrink-0 flex justify-center gap-2 mt-2">
              {/* Prev */}
              <Button
                size="sm"
                variant="outline"
                className="text-black"
                onClick={() =>
                  setCurrentIndex((prev) =>
                    prev > 0 ? prev - 1 : activeImages.length - 1
                  )
                }
              >
                <FaArrowLeft className="size-5" />
              </Button>

              {/* Next */}
              <Button
                size="sm"
                variant="outline"
                className="text-black"
                onClick={() =>
                  setCurrentIndex((prev) => (prev + 1) % activeImages.length)
                }
              >
                <FaArrowRight className="size-5" />
              </Button>
              <div
                className="bg-white shadow-md rounded-lg border border-muted text-center font-semibold px-2"
                variant="secondary"
              >
                {`${currentIndex + 1}/${activeImages.length}`}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
