import { Trivia as CommonTrivia } from "@/components/sectionBlocks/common/trivia/Trivia";
import { ferryTriviaContent } from "./Trivia.content";

export const Trivia = () => {
  return <CommonTrivia {...ferryTriviaContent} />;
};
