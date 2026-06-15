import React, { SVGProps } from "react";

const DropdownArrowIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
   return (
      <svg {...props} viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path
            d="M9 6L5 10L9 14"
            //    stroke="white"
            //    strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
};

export default DropdownArrowIcon;
