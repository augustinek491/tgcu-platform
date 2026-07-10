import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card className="p-6 sm:p-8">
      <h1 className="font-display text-2xl font-medium text-fg">Sign in</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        Access your membership, market data and marketplace.
      </p>
      <LoginForm />
    </Card>
  );
}
