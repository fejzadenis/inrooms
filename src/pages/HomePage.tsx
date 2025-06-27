import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/common/Button';

export function HomePage() {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const words = ['Lead', 'Partnership', 'Prospect', 'Champion', 'Client', 'Solution'];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <MainLayout>
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Meet Your Next</span>
                  <span className="block bg-gradient-to-r from-[#003B7A] to-[#00B2FF] text-transparent bg-clip-text min-h-[1.2em] transition-all duration-500 ease-in-out">
                    {words[currentWordIndex]}
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Meet people who provide you value by attending relationship nurturing video conferences. Connect with decision-makers, share opportunities, practice your pitch, and accelerate your sales success.
                </p>
                <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto px-8 py-3 text-base font-medium">
                      Get started
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/about" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-base font-medium">
                      Learn more
                    </Button>
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <img
              src="/logo + typewrite colored scale 2.png"
              alt="inRooms Logo"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>

      <div className="bg-white mt-16">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Why choose inRooms?</h2>
            <p className="mt-4 text-lg text-gray-500">
              We're building the most effective networking platform for tech sales professionals.
            </p>
          </div>
          <dl className="mt-12 space-y-10 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-8">
            {[
              {
                title: 'Curated Events',
                description: 'Carefully selected topics and participants to ensure meaningful connections.',
              },
              {
                title: 'Expert Networking',
                description: 'Connect with industry leaders and experienced professionals in tech sales.',
              },
              {
                title: 'Career Growth',
                description: 'Learn from peers, share experiences, and discover new opportunities.',
              },
            ].map((feature) => (
              <div key={feature.title} className="relative">
                <dt>
                  <p className="text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </MainLayout>
  );
}