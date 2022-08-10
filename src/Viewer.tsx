import { useState } from "react";
import { setup, tw } from "twind";
import { Link, Route, useLocation } from "wouter";

setup({
  theme: {
    extend: {
      colors: {
        green: { 500: "#06c4a5" },
      },
    },
  },
});

const decodeBase64 = (_input: string) => {
  let input = _input
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error(
        "InvalidLengthError: Input base64url string is the wrong length to determine padding",
      );
    }
    input += new Array(5 - pad).join("=");
  }

  return atob(input);
};

const downloadFile = (url: string, filename: string) =>
  fetch(url)
    .then((resp) => resp.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

function Viewer({ filename }: { filename: string }) {
  const downloadFilename = decodeBase64(filename.slice(7));
  const [, setLocation] = useLocation();

  return (
    <div
      className={tw`absolute top-0 grid w-full h-full p-8 place-items-center`}
      onClick={(e: MouseEvent) => {
        if (e.currentTarget === e.target) {
          setLocation("/");
        }
      }}
    >
      <div
        className={tw`w-full max-w-max`}
      >
        <span
          onClick={() => {
            downloadFile(
              `https://firebasestorage.googleapis.com/v0/b/enlil-202912.appspot.com/o/user%2F1%2Frecord%2F${filename}?alt=media`,
              downloadFilename,
            );
          }}
          className={tw
            `text(green-500 hover:white) px-6 py-4 rounded-xl bg(white hover:green-500) transition-colors duration-150 bg-opacity-80 cursor-pointer`}
        >
          {downloadFilename}
        </span>
      </div>
    </div>
  );
}

export default Viewer;
