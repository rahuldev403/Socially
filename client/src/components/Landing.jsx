import { motion } from "framer-motion";
import Button from "./ui/Button";
import { MessageSquare, ThumbsUp, Users, Sparkles } from "lucide-react";

export default function Landing({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo/Title */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-7xl font-bold mb-4 bg-pink-400  bg-clip-text text-transparent">
              Socially
            </h1>
            <p className="text-2xl text-muted-foreground font-medium">
              Share your thoughts, connect with others
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            A modern social platform where ideas come alive. Post your thoughts,
            engage in meaningful discussions, and build a community around the
            topics you care about. Earn karma, climb the leaderboard, and make
            your voice heard.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              Get Started -&gt;
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto"
        >
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="Nested Conversations"
            description="Engage in threaded discussions with unlimited reply depth"
            delay={0.9}
          />
          <FeatureCard
            icon={<ThumbsUp className="w-8 h-8" />}
            title="Karma System"
            description="Earn points for quality content and climb the leaderboard"
            delay={1.0}
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Community Driven"
            description="Connect with like-minded people and grow your network"
            delay={1.1}
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
