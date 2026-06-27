export const splitTextIntoParagraphs = (text: string, sentencesPerParagraph = 2) => {
   const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];

   const paragraphs: string[] = [];

   for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
      paragraphs.push(
         sentences
            .slice(i, i + sentencesPerParagraph)
            .join(" ")
            .trim()
      );
   }

   return paragraphs;
};
