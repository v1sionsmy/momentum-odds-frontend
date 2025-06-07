import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8">
              <Image
                src="/MomentumoddsLogo.png"
                alt="Momentum Odds Logo"
                width={300}
                height={120}
                className="mx-auto mb-8"
                priority
              />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              What does the game{" "}
              <span className="text-green-600 dark:text-green-400">feel like</span>{" "}
              right now?
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Every pass, three-pointer, or turnover tilts the emotional balance long before the box score catches up. 
              We capture that invisible swing and translate it into real-time, plain-English signals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                  Try Live Dashboard
                </Button>
              </Link>
              <Link href="/about-ignition">
                <Button variant="outline" size="lg" className="px-8 py-3">
                  About Ignition
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            About Momentum Odds
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">See the Story</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Momentum graphs reveal the narrative arc that box scores hide.
              </p>
            </Card>
            <Card className="p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Beat the Lag</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our odds-correlation layer shows when the sportsbook is snoozing on a momentum swing.
              </p>
            </Card>
            <Card className="p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trust the Transparency</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Raw pulses, confidence bands, and model logic are one click away—no black boxes.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Momentum Odds exists to answer a simple question: &ldquo;What does the game feel like right now?&rdquo;
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              We turn gut-level hunches into measurable momentum you can trust. In short, we capture that invisible swing 
              and translate it into real-time, plain-English signals that anyone—bettor, fan, or coach—can act on instantly.
            </p>
          </div>
        </div>
      </section>

      {/* The Spark Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            The Spark
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              <strong>It started in a cramped college apartment.</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              While binge-watching late-night NBA reruns, our founder Jayden Deese kept noticing moments where crowd energy 
              spiked but the numbers on screen barely budged. So he hacked together a small Python script that scraped 
              play-by-play data, weighed each event&apos;s &ldquo;emotional gravity,&rdquo; and plotted it as a living heartbeat next to the score.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 mb-6">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                That scrappy visualization revealed two truths:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Momentum isn&apos;t a myth—it&apos;s a trackable, repeatable pattern.</li>
                <li>Vegas lines react slowly to those patterns.</li>
              </ul>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              What began as a curiosity project snowballed into a full-blown AI engine that now powers Momentum Odds. 
              Today the same codebase Jayden wrote between finals and pizza runs ingests thousands of data points per minute, 
              fuses them with live bookmaker odds, and surfaces edge-finding alerts the moment a game&apos;s pulse shifts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Feel the Game?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Jump into tonight&apos;s live dashboard or rewind a classic matchup to watch the exact second the tide turned. 
            Because sports swing on moments—and now you can, too.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                Live Dashboard
              </Button>
            </Link>
            <Link href="/recent-games">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Explore Classic Games
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Image
            src="/MomentumoddsLogo.png"
            alt="Momentum Odds Logo"
            width={200}
            height={80}
            className="mx-auto mb-6 opacity-80"
          />
          <p className="text-gray-400 mb-4">
            Turn gut-level hunches into measurable momentum you can trust.
          </p>
          <p className="text-sm text-gray-500">
            Momentum Ignition LLC
          </p>
        </div>
      </footer>
    </div>
  );
}
