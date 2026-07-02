import React, { SVGProps } from "react";

const CheckIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
   return (
      <svg {...props} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path
            d="M4 7L5.99724 9L10 5"
            //    stroke="#0F5919"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
};

export default CheckIcon;
