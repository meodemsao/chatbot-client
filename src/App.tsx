/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Textarea, Button, Card } from "@nextui-org/react";
import { SSE } from "sse";
import { createId } from "@paralleldrive/cuid2";
import _ from "lodash";

interface Message {
  id: string;
  userName: string;
  text: string;
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Partial<Message>>({});
  const [messages, setMessages] = useState<Partial<Message>[]>([]);

  useEffect(() => {
    if (result.id != null && result.id != undefined) {
      console.log("result.............", result);

      // const mergeResult = _.merge(messages, result);
      let mergeResult: any;
      const messageIds = messages.map((e) => e.id);
      if (messageIds.includes(result.id)) {
        console.log("có id");

        const messagesArr = messages.map((e) => {
          if ((e.id = result.id)) {
            return result;
          }
          return e;
        });
        mergeResult = messagesArr;
      } else {
        console.log("chưa có id");
        console.log(messages, "-----------------messages");
        mergeResult = [...messages, result];
      }
      console.log("mergeResult.............", mergeResult);
      // console.log("mergeResult.............", mergeResult);
      // setMessages(mergeResult);
      setPrompt("");
    }
  }, [result]);

  const handleSubmitPromptBtnClicked = async () => {
    const humanId = createId();
    const botId = createId();

    setMessages([
      ...messages,
      {
        id: humanId,
        userName: "human",
        text: prompt,
      },
    ]);

    if (prompt !== "") {
      setIsLoading(true);

      // setResult({
      //   id: newConversionId,
      //   userName: "chatgpt",
      //   text: "...",
      // });

      const source = new SSE("http://192.168.1.13:8080/chatbot/conversion", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        payload: JSON.stringify({ prompt: prompt }),
      });

      let text = "...";
      source.addEventListener("chat", (e: any) => {
        console.log("eeeeeeeeeeeeeee.................", e.data);
        if (e.data != "[DONE]") {
          // const payload = JSON.parse(e.data);
          text += ` ${e.data}`;
          setResult({
            id: botId,
            userName: "chatgpt",
            text: text,
          });
        } else {
          console.log("done.......................", text);
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
              const isHuman = mess?.userName === "human";
              return (
                <span
                  key={index}
                  className={mess?.userName === "human" ? "text-end" : ""}
                >
                  <span
                    className={`border border-solid rounded-xl p-2 ${
                      isHuman ? "bg-blue-500 text-white" : "bg-gray-100"
                    }`}
                  >
                    {`${mess.id}  ${mess.text}`}
                  </span>
                  <br />
                </span>
              );
            })}
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
