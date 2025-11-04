export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col gap-8 items-center max-w-4xl">
        <h1 className="text-4xl font-bold text-center">
          AI Workbench
        </h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-400">
          AI stack for rapid project integration and DevOps automation
        </p>
        <div className="flex flex-col gap-4 w-full max-w-2xl">
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Phase 1 Architecture</h2>
            <p className="text-gray-600 dark:text-gray-400">
              This workbench integrates AI capabilities through Dify workflows and
              Supabase backend services. Check the /ai-stack folder for examples
              and configuration.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">🔄 Dify Integration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI workflow orchestration and management
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">🗄️ Supabase Backend</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Database, authentication, and real-time services
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
