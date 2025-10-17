import { MessageSquare, Sparkles, Shield, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent p-4 text-white shadow-lg">
            <MessageSquare className="h-12 w-12" />
          </div>
          
          <h1 className="mb-4 text-5xl font-bold tracking-tight">
            Company AI Assistant
          </h1>
          
          <p className="mb-8 text-xl text-muted-foreground">
            Your intelligent companion for instant answers and support.
            Click the chat icon to get started.
          </p>

          {/* Features */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Smart Responses</h3>
              <p className="text-sm text-muted-foreground">
                Get intelligent, context-aware answers to your questions instantly.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-accent/10 p-3 text-accent">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Always Available</h3>
              <p className="text-sm text-muted-foreground">
                24/7 support ready to help whenever you need assistance.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Your conversations are handled with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
