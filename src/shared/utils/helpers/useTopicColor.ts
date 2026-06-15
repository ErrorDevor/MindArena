import React from "react";

export const topicColors = [
   "linear-gradient(180deg, #6D52D5 0%, #967CEE 100%)",
   "linear-gradient(180deg, #34C7D2 0%, rgba(52, 199, 210, 0.4) 100%)",
   "linear-gradient(180deg, #F1C149 0%, rgba(241, 193, 73, 0.4) 100%)",
   "linear-gradient(180deg, #DA5812 0%, rgba(218, 88, 18, 0.4) 100%)",
   "linear-gradient(180deg, #2B59AE 0%, rgba(43, 89, 174, 0.4) 100%)",
   "linear-gradient(180deg, #D03FE6 0%, #E296EE 100%)",
];

export const useTopicColor = (index: number) => {
   return React.useMemo(() => {
      return topicColors[index % topicColors.length];
   }, [index]);
};
