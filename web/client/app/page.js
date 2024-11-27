import { Button } from "@/components/ui/button";
import config from "./config/config";

export default function Home() {
  // console.log("local port is", process.env.PORT);
  // console.log("local port is", config.port);

  return (
    <div className="flex flex-col w-screen h-screen items-center justify-center">
      <Button>TodApp</Button>
    </div>
  );
}
