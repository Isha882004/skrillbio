import { useContext } from "react";
import MessageContext  from "../context/MessagesContext";

const userMessages = () => {
  const messagesContext = useContext(MessageContext);

  if (!messagesContext) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
 
  return messagesContext;
};

export default userMessages;