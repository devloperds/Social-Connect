export async function translateText(text: string, source: string, target: string) {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`
  );
  const data = await res.json();
  return data.responseData.translatedText;
}
