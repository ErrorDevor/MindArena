import React, { SVGProps } from "react";

const WrenchIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
   return (
      <svg {...props} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path
            d="M12 4.73726C11.9999 5.70517 11.0594 6.59703 9.64647 7.99338C8.73749 8.89171 7.26237 8.89063 6.35292 7.99277C4.94097 6.59738 3.99992 5.705 4 4.7371C4.00008 3.7692 4.2362 3.57503 6.40565 1.43103C6.61441 1.22295 6.97347 1.36924 6.97348 1.66223L6.97357 3.87014C6.9736 4.43056 7.43251 4.88564 7.99959 4.88559C8.56666 4.88555 9.02643 4.43123 9.02655 3.87081L9.02703 1.66288C9.02709 1.36988 9.38619 1.22353 9.59491 1.43157C11.764 3.57523 12.0001 3.76936 12 4.73726Z"
            // stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M10 8L10 12.7768C10 13.8205 9.10457 14.6667 8 14.6667C6.89543 14.6667 6 13.8205 6 12.7768L6 8"
            // stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M8.00422 12.6677L8 12.6719"
            // stroke="white"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   );
};

export default WrenchIcon;
