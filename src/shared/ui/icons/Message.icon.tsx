import React, { SVGProps } from "react";

const MessageIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
   return (
      <svg {...props} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path
            d="M4.95841 11.0833H4.66675C2.33341 11.0833 1.16675 10.5 1.16675 7.58329V4.66663C1.16675 2.33329 2.33341 1.16663 4.66675 1.16663H9.33342C11.6667 1.16663 12.8334 2.33329 12.8334 4.66663V7.58329C12.8334 9.91663 11.6667 11.0833 9.33342 11.0833H9.04175C8.86092 11.0833 8.68592 11.1708 8.57508 11.3166L7.70008 12.4833C7.31508 12.9966 6.68508 12.9966 6.30008 12.4833L5.42508 11.3166C5.33175 11.1883 5.11591 11.0833 4.95841 11.0833Z"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M4.08325 4.66663H9.91659"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M4.08325 7.58337H7.58325"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
};

export default MessageIcon;
