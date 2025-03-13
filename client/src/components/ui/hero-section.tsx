import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="mb-10">
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-6 md:p-10 relative overflow-hidden">
        <div className="max-w-lg relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Summer Reading List</h1>
          <p className="text-gray-700 mb-6">
            Discover the perfect books for your summer vacation with our handpicked collection.
          </p>
          <Button size="lg" className="px-6">
            Explore Now
          </Button>
        </div>
        <div className="hidden md:block absolute -right-10 bottom-0 h-full w-1/2">
          <svg
            viewBox="0 0 800 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full opacity-80"
            preserveAspectRatio="xMidYMid slice"
          >
            <rect width="800" height="400" fill="url(#paint0_linear)" />
            <g opacity="0.7">
              <rect x="100" y="50" width="150" height="250" rx="5" fill="#3B82F6" />
              <rect x="120" y="70" width="110" height="170" rx="2" fill="#E5E7EB" />
              <rect x="130" y="250" width="90" height="20" rx="2" fill="#E5E7EB" />
              <rect x="150" y="280" width="50" height="10" rx="2" fill="#E5E7EB" />
            </g>
            <g opacity="0.9">
              <rect x="300" y="100" width="150" height="220" rx="5" fill="#6366F1" />
              <rect x="320" y="120" width="110" height="150" rx="2" fill="#E5E7EB" />
              <rect x="330" y="280" width="90" height="20" rx="2" fill="#E5E7EB" />
              <rect x="350" y="310" width="50" height="10" rx="2" fill="#E5E7EB" />
            </g>
            <g opacity="0.8">
              <rect x="500" y="70" width="150" height="250" rx="5" fill="#4F46E5" />
              <rect x="520" y="90" width="110" height="170" rx="2" fill="#E5E7EB" />
              <rect x="530" y="270" width="90" height="20" rx="2" fill="#E5E7EB" />
              <rect x="550" y="300" width="50" height="10" rx="2" fill="#E5E7EB" />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear"
                x1="0"
                y1="0"
                x2="800"
                y2="400"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#DBEAFE" />
                <stop offset="1" stopColor="#E0E7FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}
