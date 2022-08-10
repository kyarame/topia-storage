async function getFirebaseAccessToken() {
  const accessToken = localStorage.getItem("accessToken");
  const accessTokenExpiresAt = parseInt(
    localStorage.getItem("accessTokenExpiresAt") ?? "0",
  );

  if (!accessToken || accessTokenExpiresAt < Date.now()) {
    const refreshToken = localStorage.getItem("refreshToken");

    const token = await fetch(
      `/api/token${
        refreshToken ? `?refreshToken=${encodeURIComponent(refreshToken)}` : ""
      }`,
    )
      .then((x) => x.json());

    localStorage.setItem("refreshToken", token.refreshToken);
    localStorage.setItem("accessToken", token.accessToken);
    localStorage.setItem(
      "accessTokenExpiresAt",
      token.accessTokenExpiresAt.toString(),
    );

    return token.accessToken;
  }

  return accessToken;
}

export async function uploadFile(
  bucket: string,
  file: File,
) {
  const accessToken = await getFirebaseAccessToken();
  return await fetch(
    `/api/upload?accessToken=${encodeURIComponent(accessToken)}&bucket=${
      encodeURIComponent(bucket)
    }`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: await file.text(),
    },
  );
}
