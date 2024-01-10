/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Textarea, Button, Card, CardBody } from "@nextui-org/react";
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

      const source = new SSE("http://192.168.1.13:8080/chatbot/conversion", {
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

  console.log(messages, "----------------------messages");

  return (
    <>
      <div className="w-3/5 m-auto">
        <div className="text-4xl font-semibold text-center my-4">Chat GPT</div>
        <Card
          isFooterBlurred
          radius="lg"
          className="border-none w-full h-[70vh] overflow-auto mb-8"
        >
          <CardBody>
            <div className="w-full">
              {messages?.length > 0 &&
                messages.map((mess, index) => {
                  const isHuman = mess?.userName === "human";
                  return (
                    <div key={index} className="flex items-center mb-2">
                      {!isHuman ? (
                        <p className="mx-2 bg-[#f6f6f6] p-2 rounded-xl">
                          {mess.text}
                        </p>
                      ) : (
                        <div className="float-right mr-0 ml-auto">
                          <p className="mx-2 p-2 rounded-xl bg-[#e3effd]">
                            {mess.text}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </CardBody>
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
              className="mr-2"
              isLoading={isLoading}
              onClick={() => handleSubmitPromptBtnClicked()}
              color="primary"
            >
              Prompt
            </Button>
            <Button onClick={() => setPrompt("")}>Clear</Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
