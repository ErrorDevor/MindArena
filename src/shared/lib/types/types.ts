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
   };
};

export type CommentsType = {
   id: string;
   comment: string;
   user: UserData;
};

export type UserData = {
   id: string;
   userName: string;
   userPhoto?: string;
   expert?: boolean;
   inquiries?: number;
   role: string;
};

export type AI = {
   id: string;
   name: string;
   icon: string;
};