import React, { useEffect, useRef } from "react";

const UtterancesChat: React.FC = () => {
  const commentBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (commentBox.current) {
      commentBox.current.innerHTML = "";
      const script = document.createElement("script");
      script.src = "https://utteranc.es/client.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.setAttribute("repo", "HenriqueMartinsBotelho/public-chat");
      script.setAttribute("issue-term", "pathname");
      script.setAttribute("label", "comment");
      script.setAttribute("theme", "github-dark");
      commentBox.current.appendChild(script);
    }
  }, []);

  return <div className="mt-10" ref={commentBox} />;
};

export default UtterancesChat;
