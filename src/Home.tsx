import { ChangeEvent, useRef, useState } from "react";
import { tw } from "twind";
import { Link, Route, useLocation } from "wouter";
import { nanoid } from "nanoid";
import "./Home.css";
import { uploadFile } from "./firebase";

const encodeBase64 = async (string: string) => {
  const data = new TextEncoder().encode(string);

  const base64url = await new Promise<string>((r) => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result as string);
    reader.readAsDataURL(new Blob([data]));
  });

  return base64url.split(",", 2)[1]
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

function Home() {
  const [isUploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const [location, setLocation] = useLocation();

  return (
    <div className={tw`grid w-full h-full place-items-center`}>
      <button
        className={tw`outline-none(& hover:& focus:&)`}
        onClick={() => {
          if (!isUploading) {
            fileInput.current?.click();
          }
        }}
      >
        <img
          src="/topimaru.png"
          style={{ width: "min(calc(529 / 726 * 30vw), 30vh)" }}
          className={tw`${
            isUploading
              ? "gelatine cursor-wait"
              : "hover:scale-125 transition-transform duration-300 cursor-pointer"
          }`}
        />
        <div className={tw`w-0 h-0 overflow-hidden`}>
          <input
            ref={fileInput}
            className={tw`opacity-0`}
            type="file"
            onChange={async () => {
              if (!fileInput.current?.files?.length || isUploading) return;

              const file = fileInput.current.files[0];
              if (file.size > 4.5 * 1024 * 1024) {
                alert("最大ファイルサイズは4.5MBです。");
                return;
              }

              setUploading(true);

              const filename = file.name;
              const hash = nanoid(5);
              const bucket = `${hash}__${filename}`;
              const prefix = "user/1/record/";

              const response = await uploadFile(
                `${prefix}${bucket}`,
                fileInput.current.files[0],
              );

              if (response.ok) {
                setLocation(
                  `/${
                    encodeURIComponent(`${hash}__${await encodeBase64(
                      filename,
                    )}`)
                  }`,
                );
              }

              setUploading(false);
            }}
          />
        </div>
      </button>
    </div>
  );
}

export default Home;
