/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Textarea, Button, Card } from "@nextui-org/react";
import { SSE } from "sse";

interface Message {
  userName: string;
  text: string;
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (result != "" && result != undefined) {
      setMessages([...messages, { userName: "chatgpt", text: result }]);
      setPrompt("");
    }
  }, [result]);

  const handleSubmitPromptBtnClicked = async () => {
    const message: Message = {
      userName: "human",
      text: prompt,
    };

    messages.push(message);
    setMessages(messages);

    if (prompt !== "") {
      setIsLoading(true);
      setResult("");

      const source = new SSE("http://localhost:8080/chatbot/conversion", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        payload: JSON.stringify({ prompt: prompt }),
      });

      let text = "";
      source.addEventListener("chat", (e: any) => {
        console.log("eeeeeeeeeeeeeee.................", e.data);
        if (e.data != "[DONE]") {
          // const payload = JSON.parse(e.data);
          text += ` ${e.data}`;
        } else {
          console.log("done.......................", text);
          setResult(text);
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
          {messages?.length > 0 &&
            messages.map((mess, index) => {
              return (
                <div key={index}>
                  <p>{`${mess.userName}: ${mess.text}`}</p>
                  <br />
                </div>
              );
            })}
        </Card>
        {/* <div className="w-1/2 h-[30vh] border border-solid rounded-lg py-2 px-4">
          So I started to walk into the water. I won't lie to you boys, I was
          terrified. But I pressed on, and as I made my way past the breakers a
          strange calm came over me. I don't know if it was divine intervention
          or the kinship of all living things but I tell you Jerry at that
          moment, I was a marine biologist.
        </div> */}
        <div>
          <Textarea
            className="mb-2"
            value={prompt}
            onValueChange={setPrompt}
            placeholder="Insert your prompt here"
          />
          <div className="text-end">
            <Button
              className="mr-2"
              isLoading={isLoading}
              onClick={() => handleSubmitPromptBtnClicked()}
            >
              Prompt
            </Button>
            <Button
              isLoading={isLoading}
              onClick={() => setPrompt("")}
              color="primary"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
