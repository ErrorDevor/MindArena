import React, { SVGProps } from "react";

const ArrowDotIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
   return (
      <svg {...props} viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
         <rect width="2" height="2" rx="0.2" />
         <rect x="2" y="2" width="2" height="2" rx="0.2" />
         <rect x="4" y="4" width="2" height="2" rx="0.2" />
         <rect x="2" y="6" width="2" height="2" rx="0.2" />
         <rect y="8" width="2" height="2" rx="0.2" />
      </svg>
   );
};

export default ArrowDotIcon;
