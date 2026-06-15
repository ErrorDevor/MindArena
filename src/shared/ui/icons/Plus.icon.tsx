import React, { SVGProps } from "react";

const PlusIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
   return (
      <svg {...props} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
         
            <path
               d="M3.75 8.5H12.75"
            //    stroke="white"
               strokeWidth="1.2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M8.25 13V4"
            //    stroke="white"
               strokeWidth="1.2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         
      </svg>
   );
};

export default PlusIcon;
