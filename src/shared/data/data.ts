import { CardType } from "shared/lib/types/types";

export const sidebarData = {
   topics: [
      { id: "ai_tech", topic: "AI & Tech", count: 142 },
      { id: "medicine", topic: "Medicine", count: 89 },
      { id: "geopolitics", topic: "Geopolitics", count: 67 },
      { id: "economics", topic: "Economics", count: 54 },
      { id: "science", topic: "Science", count: 42 },
      { id: "philosophy", topic: "Philosophy", count: 31 },
   ],

   live: [
      { id: "CHRNA7_biomarker", name: "CHRNA7 biomarker" },
      { id: "Rapamycin_dosing", name: "Rapamycin dosing" },
   ],
   tags: [
      { id: "rapamycin", tag: "rapamycin" },
      { id: "management", tag: "management" },
      { id: "microplastics", tag: "microplastics" },
      { id: "longevity", tag: "longevity" },
   ],
};

export const contentArray: CardType[] = [
   {
      id: "1",
      status: { state: "Live", variant: "live" },
      user: {
         id: "m/okbuddycinephile",
         avatar: "/images/avatar2.png",
         name: "@insightminer",
      },
      title: "The Practitioner Said What Everyone Feared — Then One Fact Changed The Entire Direction",
      subtitle:
         "«Manager = Political Buffer Between Team And Shareholders. Al Can't Replace That — Accountability Needs A Human Face.»",
      tags: [{ id: "ai", name: "Ai labor" }],
      views: 12400,
      tier: {
         status: true,
         name: "Tier 2",
      },
   },
   {
      id: "2",
      status: { state: "Research Gap", variant: "research" },
      user: {
         id: "m/okbuddycinephile",
         avatar: "/images/user.jpg",
         name: "@insightminer",
      },
      title: "The Practitioner Said What Everyone Feared — Then One Fact Changed The Entire Direction",
      subtitle:
         "«Manager = Political Buffer Between Team And Shareholders. Al Can't Replace That — Accountability Needs A Human Face.»",
      tags: [{ id: "mecheine", name: "Mecheine" }],
      views: 1200,
      tier: {
         status: true,
         name: "Tier 2",
      },
   },
   {
      id: "3",
      status: { state: "Convergent", variant: "convergent" },
      user: {
         id: "m/okbuddycinephile",
         avatar: "/images/avatar3.png",
         name: "@truthseeker",
      },
      title: "Microplastics & IQ - 6 of 7 Attacks Survived",
      subtitle: "Mechanism of neurotoxicity still open",
      tags: [{ id: "mecheine", name: "Mecheine" }],
      views: 12400,
   },
   // {
   //    id: "4",
   //    status: { state: "Quantum", variant: "quantum" },
   //    user: {
   //       id: "m/okbuddycinephile",
   //       avatar: "/images/avatar3.png",
   //       name: "@criticalthinker",
   //    },
   //    title: "How to extend healthy life after 60?",
   //    subtitle: "",
   //    tags: [{ id: "longevity", name: "Longevity" }],
   //    views: 12400,
   // },
];
