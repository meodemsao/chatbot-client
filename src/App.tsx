/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";

function useBlob() {
  const [blob, setBlob] = useState<Blob>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        // A random doorbell audio sample I found on GitHub
        const url = "http://localhost:8000/api/v1/openai/speech";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzIiwiaWF0IjoxNzA3OTgyMDM5LCJleHAiOjE3MDgxNTQ4Mzl9.T4CyHLQD0ZTbRbvmPCUqK9-P2EWeCxGY3jzNwOuQZtQ8MrUlf1PZvXGTNgKrKwp777atkIFjYrT2OuH8law11w",
            Api_key: "zzz",
          },
          body: JSON.stringify({
            text: "somethings",
          }),
        });
        if (!response.ok)
          throw new Error(`Response not OK (${response.status})`);
        setBlob(await response.blob());
      } catch (e) {
        setError(e as string);
      }
    })();
  }, []);

  return { blob, error };
}
/**
 * Get an object URL for the current blob. Will revoke old URL if blob changes.
 * https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
 */
function useObjectUrl(blob: any) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [blob, url]);
  return url;
}

// Use the hook and render the audio element
function AudioPlayer({ blob }) {
  const src = useObjectUrl(blob);
  return <audio controls {...{ src }} />;
}

function App() {
  const { blob, error } = useBlob();
  return (
    <div>
      <h2>Audio player using binary data</h2>
      {blob ? (
        <AudioPlayer {...{ blob }} />
      ) : error ? (
        <div>There was an error fetching the audio file: {String(error)}</div>
      ) : (
        <div>Loading audio...</div>
      )}
    </div>
  );
}

export default App;
