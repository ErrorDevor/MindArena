import React, { SVGProps } from "react";

const ClockIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
   return (
      <svg {...props} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
         
            <path
               d="M12.8333 7.00002C12.8333 10.22 10.22 12.8334 6.99996 12.8334C3.77996 12.8334 1.16663 10.22 1.16663 7.00002C1.16663 3.78002 3.77996 1.16669 6.99996 1.16669C10.22 1.16669 12.8333 3.78002 12.8333 7.00002Z"
            //    stroke="#090C0A"
            //    strokeOpacity="0.5"
               strokeWidth="1.2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M9.16418 8.85503L7.35585 7.77586C7.04085 7.58919 6.78418 7.14003 6.78418 6.77253V4.38086"
            //    stroke="#090C0A"
            //    strokeOpacity="0.5"
               strokeWidth="1.2"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
        
      </svg>
   );
};

export default ClockIcon;
