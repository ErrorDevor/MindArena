export type CardType = {
   id: string;
   status: { state: string; variant: "live" | "convergent" | "research" | "quantum" | "divergent" };
   user: {
      id: string;
      avatar: string;
      name: string;
   };
   title: string;
   subtitle: string;
   tags: {
      id: string;
      name: string;
   }[];
   views: number;
   tier?: {
      status: true;
      name: string;
   }
};
