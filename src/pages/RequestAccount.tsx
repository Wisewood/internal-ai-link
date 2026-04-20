import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import witLogo from "@/assets/wit-logo.png";

const WITAI_SUPABASE_URL = "https://kgrlqsdltjjdykceovrt.supabase.co";
const WITAI_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtncmxxc2RsdGpqZHlrY2VvdnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTI4MDMsImV4cCI6MjA4MzI2ODgwM30.zfKlCAgsIzsoe962-VeUDuFVYvSTbRZpz0ttR19gegA";
const ENDPOINT = `${WITAI_SUPABASE_URL}/functions/v1/request-account`;

const RequestAccount = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim() || !email.trim() || !company.trim()) {
      toast({
        title: "Please fill in the required fields",
        description: "Name, email, and company are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WITAI_ANON_KEY}`,
          apikey: WITAI_ANON_KEY,
        },
        body: JSON.stringify({ name, email, company, phone, message }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setSubmitted(true);
    } catch (err) {
      console.error("Account request failed:", err);
      toast({
        title: "Something went wrong",
        description:
          "We couldn't send your request. Please try again or email us at info@wisewoodint.com.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ background: "#f5f5f5", color: "#1a1a1a" }}
    >
      <header className="w-full flex items-center justify-between px-6 py-5 md:px-8">
        <Link to="/" className="flex items-center gap-2 text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to chat
        </Link>
        <img src={witLogo} alt="WIT" className="h-7 w-auto" style={{ filter: "brightness(0)" }} />
        <div className="w-20" />
      </header>

      <main className="w-full max-w-xl px-6 py-10 md:py-16 flex-1">
        {submitted ? (
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
              Request received.
            </h1>
            <p className="text-base text-[#555]">
              Thanks, <span className="font-medium">{name.split(" ")[0]}</span>. A member of
              our team will review your request and reach out within one business day at{" "}
              <span className="font-medium">{email}</span>.
            </p>
            <Link
              to="/"
              className="inline-block rounded-full px-5 py-2 text-sm font-medium"
              style={{ background: "#1a1a1a", color: "#ffffff" }}
            >
              Back to WitAI
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                Request a WitAI account
              </h1>
              <p className="text-base text-[#555]">
                Accounts are set up by our team. Tell us a bit about you and we'll get back
                within one business day with your login.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  autoComplete="organization"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">What are you looking for? (optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Event type, audience size, rough timeline — anything that helps us prep."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full"
                style={{ background: "#1a1a1a", color: "#ffffff" }}
              >
                {isSubmitting ? "Sending..." : "Send request"}
              </Button>

              <p className="text-xs text-[#888] text-center pt-2">
                By submitting, you agree to our{" "}
                <Link to="/terms" className="underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default RequestAccount;
