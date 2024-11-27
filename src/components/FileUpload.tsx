/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [isUploading, setisUploading] = useState<boolean>(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      try {
        const response = await axios.post("/api/create-chat", {
          file_key,
          file_name,
        });
        return response.data;
      } catch (error) {
        console.error("Error in mutation:", error);
        // throw error; // Rethrow the error to be caught by `onError`
      }
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      // console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        //bigger than 10 mb
        toast.error("Please upload a smaller file");
        return;
      }

      try {
        setisUploading(true);
        const data = await uploadToS3(file);
        console.log(data);
        if (!data?.file_key || !data?.file_name) {
          toast.error("Something went wrong!");
          console.log("something went wrong!");
          return;
        }
        mutate(data, {
          onSuccess: ({chatId}) => {
            // toast.success(data);
            // console.log("Filedata", data);
            router.push(`/chat/${chatId}`);
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onError: (err) => {
            console.log("Mutation error", err);
            toast.error("Error creating chat");
          },
        });
        // console.log("data", data);
      } catch (error) {
        console.log(error);
      } finally {
        setisUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex flex-col justify-center items-center",
        })}
      >
        <input {...getInputProps()} />
        {isUploading || isPending ? (
          <>
            {/*loading state */}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF here</p>
          </>
        )}
      </div>
    </div>
  );
};
export default FileUpload;
