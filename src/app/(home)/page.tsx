import { StartPage } from "screens/00-Start/ui/StartPage";

export const dynamic = "force-dynamic";

export default function Home() {
   try {
      return <><StartPage /></>;
   } catch (error) {
      return null;
   }
}
