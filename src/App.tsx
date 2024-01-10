/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { Textarea, Button, Card } from "@nextui-org/react";
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
          console.log("eeeeeeeeeeeeeee.................", e.data);
          // const payload = JSON.parse(e.data);
          const text = e.data;
          if (text != "\n") {
            // console.log("Text: " + text);
            resultRef.current = prompt + "\n" + resultRef.current + " " + text;
            // console.log("ResultRef.current: " + resultRef.current);
            setResult(resultRef.current as unknown as string);
          }
        } else {
          console.log("done.......................");
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
      <div className="w-3/5 m-auto">
        <div className="text-4xl font-semibold text-center my-4">Chat GPT</div>
        <Card
          isFooterBlurred
          radius="lg"
          className="border-none w-full h-[50vh] py-2 px-4 overflow-auto mb-8"
        >
          So I started to walk into the water. I won't lie to you boys, I was
          terrified. But I pressed on, and as I made my way past the breakers a
          strange calm came over me. I don't know if it was divine intervention
          or the kinship of all living things but I tell you Jerry at that
          moment, I was a marine biologist. So I started to walk into the water.
          I won't lie to you boys, I was terrified. But I pressed on, and as I
          made my way past the breakers a strange calm came over me. I don't
          know if it was divine intervention or the kinship of all living things
          but I tell you Jerry at that moment, I was a marine biologist. So I
          started to walk into the water. I won't lie to you boys, I was or the
          kinship of all living things but I tell you Jerry at that moment, I
          was a marine biologist.
        </Card>
        <div>
          <Textarea
            className="mb-2"
            value={prompt}
            onValueChange={setPrompt}
            placeholder="Insert your prompt here"
          />
          <div className="text-end">
            <Button
              isLoading={isLoading}
              className="mr-2"
              // onClick={() => handleSubmitPromptBtnClicked()}
            >
              Clear
            </Button>
            <Button
              isLoading={isLoading}
              onClick={() => handleSubmitPromptBtnClicked()}
              color="primary"
            >
              Prompt
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
