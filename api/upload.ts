import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

const STORAGE_BUCKET = "enlil-202912.appspot.com";
const MOBILE_SDK_APP_ID = "1:683248750662:android:99c8abf258b36c8d";
const USER_AGENT =
  "Dalvik/2.1.0 (Linux; U; Android 123; MyModel Build/PQ3A.190801.002)";

export async function uploadFile(
  bucket: string,
  body: any,
  firebaseAccessToken: string,
) {
  const resumableResponse = await fetch(
    `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o?name=${
      encodeURIComponent(bucket)
    }&uploadType=resumable`,
    {
      method: "POST",
      headers: {
        Authorization: `Firebase ${firebaseAccessToken}`,
        "X-Firebase-Storage-Version": "Android/22.24.13 (100400-455379205)",
        "x-firebase-gmpid": MOBILE_SDK_APP_ID,
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Header-Content-Type": "application/octet-stream",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip",
      },
    },
  ).then((r) => {
    return Object.fromEntries((r.headers as any).entries()) as unknown as {
      "x-guploader-uploadid": string;
      "x-goog-upload-url": string;
      "x-goog-upload-control-url": string;
      "x-goog-upload-chunk-granularity": number;
    };
  });

  const response = await fetch(
    resumableResponse["x-goog-upload-url"],
    {
      method: "POST",
      headers: {
        Authorization: `Firebase ${firebaseAccessToken}`,
        "X-Firebase-Storage-Version": "Android/22.24.13 (100400-455379205)",
        "x-firebase-gmpid": MOBILE_SDK_APP_ID,
        "X-Goog-Upload-Command": "upload,finalize",
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Offset": "0",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip",
      },
      body,
    },
  ).then((r) => r.json());

  return {
    ...response,
    absoluteUrl: response.error
      ? undefined
      : `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${
        encodeURIComponent(response.name)
      }?alt=media`,
  } as {
    absoluteUrl: string;
    name: string;
    bucket: string;
    generation: string;
    metageneration: string;
    contentType: string;
    timeCreated: string;
    updated: string;
    storageClass: "STANDARD";
    size: string;
    md5Hash: string;
    contentEncoding: string;
    contentDisposition: string;
    crc32c: string;
    etag: string;
    downloadTokens: string;
    error?: never;
  } | {
    error: { code: number; message: string };
  };
}

export default async (request: VercelRequest, response: VercelResponse) => {
  try {
    if (request.method !== "POST") {
      response.status(400).json({
        message: "Only POST is supported",
      });
      return;
    }

    if (!request.query.accessToken) {
      response.status(400).json({
        message: "accessToken is missing",
      });
      return;
    }

    if (!request.query.bucket) {
      response.status(400).json({
        message: "bucket is missing",
      });
      return;
    }

    const result = await uploadFile(
      request.query.bucket as string,
      request.body,
      request.query.accessToken as string,
    );

    response.status(200).json(result);
  } catch (e) {
    response.status(500).send({
      message: (e as any).toString(),
    });
  }
};
