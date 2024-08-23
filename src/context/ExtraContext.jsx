import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatBaseURL, getRequest, postRequest } from "../utils/constant";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export const ExtraContext = createContext();

export const ExtraContextProvider = ({ children, user }) => {

  const navigate = useNavigate();
  const [score, setScore] = useState(null);

  const [userChats, setUserChats] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [userChatsError, setUserChatsError] = useState(null);
  //to read messages of selected users only
  const [currentChat, setCurrentChat] = useState(null);
  //to read messages of selected users only
  console.log("selected userssss", currentChat);
  console.log("selected user", user);

  const updateCurrentChat = useCallback((chat) => {
    setCurrentChat(chat);
    
  }, []);

  useEffect(() => {
    const getUserChats = async () => {
      setIsUserChatsLoading(true);
      if (user.id) {
        const response = await axios.post(`https://494c-117-219-22-193.ngrok-free.app/getmatched`,{
            email: user.email,
  
        });
        if (response.error) {
          setUserChatsError(response);
          setIsUserChatsLoading(false);
          return;
        }
        setUserChats(response.data);
        console.log('User Chats', response.data);
        setIsUserChatsLoading(false);
      }
    };

    getUserChats(); // Call the async function inside useEffect
  }, [user]); // Adding user as a dependency



  //now for potential chats
//   const [potentialChats, setPotentialChats] = useState(null);
//   useEffect(() => {
//     const getUser = async () => {
//       const response = await axios.post('https://494c-117-219-22-193.ngrok-free.app/getmatched',{
//         email : user.email
//       });
//       console.log(response);
//       if (response.error) {
//         return console.log("Error Fetching Users", response.error);
//       }
//       const pChats = response.data.filter((u) => {
//         let isChatCreated = false;
//         if (user.id === u.id) {
//           return false;
//         }
//         if (userChats) {
//           isChatCreated = userChats?.some((chat) => {
//             return chat.members[0] === u.id || chat.members[1] === u.id;
//           });
//         }
//         return !isChatCreated;
//       });
//       //array of users whom we can chat
//       setPotentialChats(pChats);
      
//     };
//     getUser();
//   }, [userChats]);
//   console.log("Potential Chats", potentialChats);
  
  const createChat = useCallback(async (firstId, secondId) => {
    const response = await postRequest(
      `${chatBaseURLURL}/chats`,
      JSON.stringify({
        firstId,
        secondId,
      })
    );
    if (response.error) {
      console.log("Error creating chat", response.error);
      return;
    }
    // Add the new chat to the user's chats list
    setUserChats((prev) => [...prev, response]);
  }, []);

  //now for messages
  const [messages, setMessages] = useState(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(null);
  const [messagesError, setMessagesError] = useState(null);

  console.log("Messages", messages, currentChat)
  useEffect(() => {
    const getMessages = async () => {
      setIsMessagesLoading(true);
      setMessagesError(false);
      const response = await getRequest(
        `http://localhost:1243/api/messages/${currentChat?.id}`
      );
      console.log(response)
      setIsMessagesLoading(false);
      if(response.error){
        return messagesError(response)
      }
      setMessages(response);
    };
    getMessages(); // Call the async function inside useEffect
  }, [currentChat]);

  //sending meesage
  const[newMessage, setNewMessage]= useState(null) 
  const[sendtextmessageError, setSendTextMessageError] = useState(null)
  const sendTextMessage = useCallback(async(textMessage, sender, currentChatId, setTextMessage)=>{
    if(!textMessage){
        return console.log("send a message")
    }
    const response = await postRequest(`${chatBaseURL}/messages`, JSON.stringify({
        chatId: currentChatId,
        senderId: sender.id,
        text: textMessage, 
    }))
    console.log("mesasage resp", response)
    if(response.error){
        return setSendTextMessageError(response)
    }
   
    setNewMessage(response)
    setTextMessage("")
    setMessages((prev)=>[...prev, response])
  },[])

  return (
    <ExtraContext.Provider
      value={{
        score,
        setScore,
        userChats,
        setUserChats,
        isUserChatsLoading,
        setIsUserChatsLoading,
        userChatsError,
        setUserChatsError,
        updateCurrentChat,
        currentChat,
        sendTextMessage,
        messages,
        isMessagesLoading,
        setIsMessagesLoading,
        messagesError,
        setMessagesError,
        newMessage,
      }}
    >
      {children}
    </ExtraContext.Provider>
  );
};
