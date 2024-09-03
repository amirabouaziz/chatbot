import { useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = "f9bddfdc20mshe818590d9f9ea1bp12e7f0jsn228f9d3d24c8";
const API_HOST = "chatgpt-42.p.rapidapi.com";
const API_PATH = "/conversationllama3";

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Rec-inov! Let's start with your CV. What is your full name?",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [cvData, setCvData] = useState({});
  const [jobOfferData, setJobOfferData] = useState({});
  const [collectingCV, setCollectingCV] = useState(true);

  const questionsCV = [
    "What is your full name?",
    "What is your contact information (phone, email)?",
    "What is your professional summary or objective?",
    "What are your educational qualifications (include dates and institutions)?",
    "What are your work experiences (include roles, companies, and dates)?",
    "What skills do you have (both technical and soft skills)?",
    "What certifications or awards do you have?",
    "What projects have you worked on (include brief descriptions)?",
    "What languages do you speak (include proficiency levels)?",
    "Are there any other relevant details or personal statements?"
  ];

  const questionsJobOffer = [
    "Job title:",
    "Required skills (include technical and soft skills):",
    "Job location:",
    "Job type (full-time/part-time/contract):",
    "Salary range:",
    "Additional job requirements:",
    "Languages required (include proficiency levels):"
  ];

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    if (collectingCV) {
      if (step < questionsCV.length) {
        const key = questionsCV[step];
        setCvData({ ...cvData, [key]: message });
        setStep(step + 1);
        if (step + 1 < questionsCV.length) {
          const nextQuestion = questionsCV[step + 1];
          setMessages([...newMessages, {
            message: nextQuestion,
            sender: "ChatGPT"
          }]);
        } else {
          setCollectingCV(false);
          setStep(0);
          setMessages([...newMessages, {
            message: "Great! Now let's create a job offer. Please provide the details.",
            sender: "ChatGPT"
          }]);
        }
      }
    } else {
      if (step < questionsJobOffer.length) {
        const key = questionsJobOffer[step];
        setJobOfferData({ ...jobOfferData, [key]: message });
        setStep(step + 1);
        if (step + 1 < questionsJobOffer.length) {
          const nextQuestion = questionsJobOffer[step + 1];
          setMessages([...newMessages, {
            message: nextQuestion,
            sender: "ChatGPT"
          }]);
        } else {
          setMessages([...newMessages, {
            message: "Thank you for providing the job offer details. We will now process your CV and the job offer.",
            sender: "ChatGPT"
          }]);
          // Call function to process CV and job offer matching here
          await matchCvToJobOffer();
        }
      }
    }

    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => ({
      role: messageObject.sender === "ChatGPT" ? "assistant" : "user",
      content: messageObject.message
    }));

    const apiRequestBody = {
      messages: apiMessages,
      web_access: false
    };

    try {
      const response = await fetch(`https://${API_HOST}${API_PATH}`, {
        method: "POST",
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": API_HOST,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.result) {
        setMessages([...chatMessages, {
          message: data.result,
          sender: "ChatGPT"
        }]);
      } else {
        console.error('No result returned from the API');
        alert("No response received from the API. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      if (error.message.includes("insufficient_quota")) {
        alert("You have exceeded your API quota. Please check your plan and billing details.");
      } else if (error.message.includes("Gateway Timeout")) {
        alert("The API request timed out. Please try again later.");
      } else {
        alert("An error occurred. Please try again later.");
      }
    } finally {
      setIsTyping(false);
    }
  }

  async function matchCvToJobOffer() {
    // Replace with your logic to match CV and job offer
    console.log("Matching CV to Job Offer...");
    console.log("CV Data:", cvData);
    console.log("Job Offer Data:", jobOfferData);
    // For demo purposes, just show a success message
    setMessages([...messages, {
      message: "The CV and job offer matching is complete. Check your console for the results.",
      sender: "ChatGPT"
    }]);
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="Rec-inov is typing..." /> : null}
            >
              {messages.map((message, i) => (
                <Message key={i} model={message} />
              ))}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
