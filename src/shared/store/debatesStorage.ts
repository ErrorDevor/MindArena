export const DEBATES_STORAGE_KEY = "mindarena_debates";

export const getStoredDebates = () => {
   if (typeof window === "undefined") return [];

   const data = localStorage.getItem(DEBATES_STORAGE_KEY);

   if (!data) return [];

   try {
      return JSON.parse(data);
   } catch {
      return [];
   }
};

export const saveDebateToStorage = (debate: any) => {
   const debates = getStoredDebates();

   const exists = debates.some((item: any) => item.id === debate.id);

   const nextDebates = exists
      ? debates.map((item: any) => (item.id === debate.id ? debate : item))
      : [debate, ...debates];

   localStorage.setItem(DEBATES_STORAGE_KEY, JSON.stringify(nextDebates));

   return nextDebates;
};
