import { AI, CardType, CommentsType } from "shared/lib/types/types";

export const aiModels: AI[] = [
   {
      id: "chatgpt",
      name: "ChatGPT",
      icon: "/images/ai/chatgpt-icon.png",
   },
   {
      id: "claude",
      name: "Claude",
      icon: "/images/ai/claude-ai-icon.png",
   },
   {
      id: "gemini",
      name: "Gemini",
      icon: "/images/ai/gemini-ai-icon.png",
   },
   {
      id: "grok",
      name: "Grok",
      icon: "/images/ai/grok-icon.png",
   },
];

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
         "Need: longitudinal microplastic exposure in humans - 6+ month study. 3 inquiries",
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
      subtitle: "SaaS teams under 50 people",
      tags: [{ id: "mecheine", name: "Mecheine" }],
      views: 12400,
   },
   {
      id: "4",
      status: { state: "Quantum", variant: "quantum" },
      user: {
         id: "criticalthinker",
         avatar: "/images/avatar.png",
         name: "@criticalthinker",
      },
      title: "How to extend healthy life after 60?",
      subtitle: "",
      tags: [{ id: "longevity", name: "Longevity" }],
      views: 12400,
   },
   {
      id: "5",
      status: { state: "Divergent", variant: "divergent" },
      user: {
         id: "patternwatch",
         avatar: "/images/avatar2.png",
         name: "@patternwatch",
      },
      title: "Efficiency vs legitimacy",
      subtitle: "«Manager = Political Buffer Between Team And Shareholders. Al Can't Replace That — Accountability Needs A Human Face.»",
      tags: [{ id: "philosophy", name: "Philosophy" }],
      views: 12400,
      tier: {
         status: true,
         name: "Tier 2",
      },
   },
];

export const commentsData: CommentsType[] = [
   {
      id: "1",
      comment:
         "What if we compare not to placebo but to metformin as active control? Would isolate CHRNA7 pathway specifically.",
      user: {
         id: "mikhail_k",
         userName: "@mikhail_k",
         userPhoto: "/images/avatar.png",
         expert: false,
         inquiries: 5,
         role: "Founder",
      },
   },
   {
      id: "2",
      comment:
         "40 patients took rapamycin off-label 3+ years — no immune markers change below 3mg/week.",
      user: {
         id: "dr_anna",
         userName: "@dr.Anna",
         userPhoto: "/images/avatar2.png",
         expert: true,
         inquiries: undefined,
         role: "Oncologist",
      },
   },
   {
      id: "3",
      comment:
         "What if we compare not to placebo but to metformin as active control? Would isolate CHRNA7 pathway specifically.",
      user: {
         id: "criticalthinker",
         userName: "@criticalthinker",
         userPhoto: "/images/avatar3.png",
         expert: true,
         inquiries: undefined,
         role: "Oncologist",
      },
   },

   {
      id: "4",
      comment:
         "What if we compare not to placebo but to metformin as active control? Would isolate CHRNA7 pathway specifically.",
      user: {
         id: "mikhail_k",
         userName: "@mikhail_k",
         userPhoto: "/images/avatar.png",
         expert: false,
         inquiries: 5,
         role: "Founder",
      },
   },
   {
      id: "5",
      comment:
         "40 patients took rapamycin off-label 3+ years — no immune markers change below 3mg/week.",
      user: {
         id: "dr_anna",
         userName: "@dr.Anna",
         userPhoto: "/images/avatar2.png",
         expert: true,
         inquiries: undefined,
         role: "Oncologist",
      },
   },
   {
      id: "6",
      comment:
         "What if we compare not to placebo but to metformin as active control? Would isolate CHRNA7 pathway specifically.",
      user: {
         id: "criticalthinker",
         userName: "@criticalthinker",
         userPhoto: "/images/avatar3.png",
         expert: true,
         inquiries: undefined,
         role: "Oncologist",
      },
   },
   {
      id: "7",
      comment:
         "What if we compare not to placebo but to metformin as active control? Would isolate CHRNA7 pathway specifically.",
      user: {
         id: "mikhail_k",
         userName: "@mikhail_k",
         userPhoto: "/images/avatar.png",
         expert: false,
         inquiries: 5,
         role: "Founder",
      },
   },
];
