import React, { SVGProps } from "react";

const CheckDoneIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
   return (
      <svg {...props} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
         
            <g clipPath="url(#clip0_57_20889)">
               <path
                  d="M16.2996 6.20447L10.003 12.5011L6.85547 9.3528"
                  stroke="#068A60"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
               <path
                  d="M17.5 10C17.5 14.1425 14.1425 17.5 10 17.5C5.8575 17.5 2.5 14.1425 2.5 10C2.5 5.8575 5.8575 2.5 10 2.5C11.2108 2.5 12.3508 2.79417 13.3633 3.30333"
                  stroke="#068A60"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
               />
            </g>
            <defs>
               <clipPath id="clip0_57_20889">
                  <rect width="20" height="20" fill="white" />
               </clipPath>
            </defs>
         
      </svg>
   );
};

export default CheckDoneIcon;
