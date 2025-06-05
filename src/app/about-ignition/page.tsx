import Image from 'next/image';
import Link from 'next/link';

export default function AboutIgnition() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </div>
        </Link>
      </div>

      {/* Hero Section with Logo */}
      <div className="relative h-48 md:h-64 w-full bg-white dark:bg-gray-900 shadow-md">
        <Image
          src="/momentumIgnitionLogo.png"
          alt="Momentum Ignition Logo"
          width={300}
          height={120}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          priority
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-gray-900 dark:text-white">About Momentum Ignition</h1>
          <div className="italic text-gray-600 dark:text-gray-400 mb-12 text-center border-b border-gray-200 dark:border-gray-700 pb-8">
            <p>A message from Jayden Deese, Founder & Lead AI Engineer</p>
          </div>

          {/* Purpose Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-500">Our Purpose</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                At Momentum Ignition, we convert live, high-frequency sports data into precise, actionable intelligence. 
                My goal is straightforward: give every stakeholder—bettors, broadcasters, front-office analysts, and creators—real-time 
                clarity on the hidden shifts that decide outcomes.
              </p>
            </div>
          </section>

          {/* Origin & Evolution */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-500">Origin & Evolution</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-gray-300">
                What started as a late-night prototype during my final semester—plotting &ldquo;game mood swings&rdquo; on a single screen—has 
                matured into an enterprise-grade analytics engine:
              </p>
              <ul className="list-none space-y-4">
                <li className="flex items-start bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                  <span className="text-orange-500 font-bold mr-4 text-xl">1</span>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Ingestion</strong>
                    <p className="text-gray-600 dark:text-gray-400">Sub-second capture of play-by-play feeds, tracking coordinates, and live odds.</p>
                  </div>
                </li>
                <li className="flex items-start bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                  <span className="text-orange-500 font-bold mr-4 text-xl">2</span>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Quantification</strong>
                    <p className="text-gray-600 dark:text-gray-400">Proprietary team- and player-level momentum indices, updated continuously.</p>
                  </div>
                </li>
                <li className="flex items-start bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                  <span className="text-orange-500 font-bold mr-4 text-xl">3</span>
                  <div>
                    <strong className="text-gray-900 dark:text-white">Distribution</strong>
                    <p className="text-gray-600 dark:text-gray-400">Low-latency APIs and WebSockets that feed web, mobile, and broadcast overlays.</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Technology Foundation */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-500">Technology Foundation</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-4 px-6 text-left text-gray-900 dark:text-white">Layer</th>
                      <th className="py-4 px-6 text-left text-gray-900 dark:text-white">Selected Stack</th>
                      <th className="py-4 px-6 text-left text-gray-900 dark:text-white">Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">Data Pipeline</td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">FastAPI, Kafka, Python asyncio</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">10 ms ingest latency & horizontal scale</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">Modeling</td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">Transformer sequence models, GBMs</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">Captures nonlinear swings & win-probability deltas</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">Storage</td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">SQLite, Redis, S3-backed Parquet lakes</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">Balances transactional speed with analytical depth</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Product Ecosystem */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-500">Product Ecosystem</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Momentum Odds</h3>
                  <p className="text-gray-600 dark:text-gray-400">Visualizes live momentum and corresponding odds movements for bettors and fans.</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Momentum Ignition API</h3>
                  <p className="text-gray-600 dark:text-gray-400">Licensed endpoints for sportsbooks, media networks, and third-party developers.</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">AI Sports Debate Generator <span className="text-sm text-orange-500">(beta)</span></h3>
                  <p className="text-gray-600 dark:text-gray-400">Produces balanced, data-grounded talking points for 1-on-1 player debates.</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Live AI Sports Blog <span className="text-sm text-orange-500">(in development)</span></h3>
                  <p className="text-gray-600 dark:text-gray-400">A real-time editorial layer that narrates momentum inflection points as they unfold.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Guiding Principles */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-500">Guiding Principles</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Speed with Substance</h3>
                  <p className="text-gray-600 dark:text-gray-400">Insight is only valuable if it arrives before the next possession.</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Transparent Methodology</h3>
                  <p className="text-gray-600 dark:text-gray-400">Explainable models, auditable confidence intervals, and clear versioning.</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Creator Enablement</h3>
                  <p className="text-gray-600 dark:text-gray-400">Empower analysts and content teams with the same tooling used by professional franchises.</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Continuous Improvement</h3>
                  <p className="text-gray-600 dark:text-gray-400">Ship, measure, refine—each release must materially advance accuracy or latency.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Looking Ahead */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-500">Looking Ahead</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-gray-300">
                Momentum Ignition will continue to expand its footprint across major sports and media formats. The forthcoming 
                Live AI Sports Blog represents the next step: transforming raw momentum analytics into authoritative, real-time storytelling.
              </p>
              <p className="text-lg leading-relaxed mb-8 text-gray-700 dark:text-gray-300">
                If your organization is exploring advanced sports intelligence, broadcast enhancement, or fan-engagement solutions, 
                I invite you to connect. Together we can ensure that every critical swing—on the court, field, or ice—is captured, 
                quantified, and communicated the moment it happens.
              </p>
              <blockquote className="border-l-4 border-orange-500 pl-6 py-2 bg-white dark:bg-gray-900 rounded-r-lg">
                <p className="text-xl italic text-gray-700 dark:text-gray-300">
                  <strong className="text-orange-600 dark:text-orange-500">Momentum Ignition</strong> – Turning data into decisive moments.
                </p>
              </blockquote>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 