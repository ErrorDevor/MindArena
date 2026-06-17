import React, { SVGProps } from "react";

const ArrowIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
   return (
      <svg {...props} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M1.16667 12.5L0 11.3333L9.66667 1.66667H4.16667V0H12.5V8.33333H10.8333V2.83333L1.16667 12.5Z" />
      </svg>
   );
};

export default ArrowIcon;
