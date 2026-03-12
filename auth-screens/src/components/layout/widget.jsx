import { BASE_URL } from "@/lib/constants";
import { getCurrentScreen } from "@auth0/auth0-acul-js";
import { getScreenComponent } from "@/screens";
import { Card } from "@/components/ui/card";

export default function Widget() {
  const screen = getCurrentScreen() || "";

  return (
    <div className="flex-1 w-full relative">
      <div className="w-full border-b border-gray-300 pb-2 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-2xl font-bold" style={{color: '#800020'}}>
            Vanguard-ACUL
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col justify-center min-h-screen">
          <div className="mb-6">
            <h1 className="mb-2 font-bold" style={{fontSize: '24px'}}>
              Log in to the Personal Investor site
            </h1>
            <p className="mb-8 underline" style={{fontSize: '14px'}}>
              Not a personal investor?
            </p>
          </div>
          <div className="flex items-start gap-8 mb-6">
            <Card className="w-[300px] h-[400px] p-6 shadow-lg">
              <div className="text-center">
                <button className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Simple and secure
                </button>
                <div className="mb-4 flex justify-center">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="border">
                    <rect width="120" height="120" fill="white"/>
                    <g fill="black">
                      <rect x="10" y="10" width="10" height="10"/>
                      <rect x="30" y="10" width="10" height="10"/>
                      <rect x="50" y="10" width="10" height="10"/>
                      <rect x="70" y="10" width="10" height="10"/>
                      <rect x="90" y="10" width="10" height="10"/>
                      <rect x="10" y="30" width="10" height="10"/>
                      <rect x="90" y="30" width="10" height="10"/>
                      <rect x="10" y="50" width="10" height="10"/>
                      <rect x="30" y="50" width="10" height="10"/>
                      <rect x="50" y="50" width="10" height="10"/>
                      <rect x="70" y="50" width="10" height="10"/>
                      <rect x="90" y="50" width="10" height="10"/>
                      <rect x="10" y="70" width="10" height="10"/>
                      <rect x="90" y="70" width="10" height="10"/>
                      <rect x="10" y="90" width="10" height="10"/>
                      <rect x="30" y="90" width="10" height="10"/>
                      <rect x="50" y="90" width="10" height="10"/>
                      <rect x="70" y="90" width="10" height="10"/>
                      <rect x="90" y="90" width="10" height="10"/>
                    </g>
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Skip the password</p>
              </div>
            </Card>
            <Card className="w-[512px] h-[400px] p-4 shadow-lg">
              {getScreenComponent(screen)}
            </Card>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="underline text-black hover:text-gray-700">Open a new account</a>
            <a href="#" className="underline text-black hover:text-gray-700">Set up online access</a>
          </div>
        </div>
      </div>
    </div>
  );
}
