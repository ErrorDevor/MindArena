import React, { SVGProps } from "react";

const CloseIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
   return (
      <svg {...props} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path
            d="M5 9.00195L9 5.00195"
            //    stroke="#C81734"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M9 9.00195L5 5.00195"
            //    stroke="#C81734"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
};

export default CloseIcon;
