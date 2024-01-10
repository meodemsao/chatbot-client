/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { Textarea, Button } from "@nextui-org/react";
import { SSE } from "sse";

function App() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const resultRef = useRef();

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  const handleSubmitPromptBtnClicked = async () => {
    if (prompt !== "") {
      setIsLoading(true);
      setResult("");

      const source = new SSE("http://localhost:8080/chatbot/conversion", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        payload: JSON.stringify({ message: prompt }),
      });

      source.addEventListener("chat", (e: any) => {
        if (e.data != "[DONE]") {
          console.log('eeeeeeeeeeeeeee.................', e.data)
          // const payload = JSON.parse(e.data);
          const text = e.data;
          if (text != "\n") {
            // console.log("Text: " + text);
            resultRef.current = prompt + '\n' + resultRef.current + " " + text;
            // console.log("ResultRef.current: " + resultRef.current);
            setResult(resultRef.current as unknown as string);
          }
        } else {
          console.log('done.......................')
          source.close();
        }
      });

      source.addEventListener("readystatechange", (e: any) => {
        if (e.readyState >= 2) {
          setIsLoading(false);
        }
      });

      source.stream();
    } else {
      alert("Please insert a prompt!");
    }
  };

  return (
    <>
      <div>
        <Textarea value={prompt} onValueChange={setPrompt} placeholder="Insert your prompt here" />
        <Button
          isLoading={isLoading}
          onClick={() => handleSubmitPromptBtnClicked()}
        >
          Prompt
        </Button>
      </div>
    </>
  );
}

export default App;
