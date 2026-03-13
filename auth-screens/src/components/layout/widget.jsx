import { BASE_URL } from "@/lib/constants";
import { getCurrentScreen } from "@auth0/auth0-acul-js";
import { getScreenComponent } from "@/screens";
import { Card } from "@/components/ui/card";

export default function Widget() {
  const screen = getCurrentScreen() || "";

  return (
    <div className="flex-1 w-full relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col justify-center min-h-screen">
          <div className="mb-6">
            <h1 className="mb-8 font-bold" style={{fontSize: '24px'}}>
              Log in to your OpCo
            </h1>
          </div>
          <div className="flex justify-center">
            <Card className="w-[512px] h-[400px] p-4 shadow-lg">
              {getScreenComponent(screen)}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
