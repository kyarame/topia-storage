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

function Viewer({ filename }: { filename: string }) {
  const downloadFilename = filename.slice(0, 7) +
    decodeBase64(filename.slice(7));
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
        className={tw`w-96 max-w-max text(green-500 hover:white) px-6 py-4 rounded-xl bg(white hover:green-500) transition-colors duration-150 bg-opacity-80(& hover:&) cursor-pointer`}
      >
        <a
          href={`https://firebasestorage.googleapis.com/v0/b/enlil-202912.appspot.com/o/user%2F1%2Frecord%2F${
            encodeURIComponent(downloadFilename)
          }?alt=media`}
          target="_blank"
          download={downloadFilename.slice(7)}
        >
          {downloadFilename.slice(7)}
        </a>
      </div>
    </div>
  );
}

export default Viewer;
