export const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    let info = null;
    try {
      info = await res.json();
    } catch (e) {
      // ignore JSON parse errors
    }
    const error = new Error(
      (info && info.message) || "An error occurred while fetching the data.",
    );
    // @ts-ignore
    error.info = info;
    // @ts-ignore
    error.status = res.status;
    throw error;
  }
  return res.json();
};
