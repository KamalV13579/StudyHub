/* eslint-disable @next/next/no-img-element */
/**
 * This is the login page of the application, allowing users to log in.
 * Used a07 Alias for reference
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const logIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      window.alert(error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex  min-h-[calc(100svh-164px)] flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex w-60 items-center justify-center rounded-md">
                  <img
                    src="https://kzyyqceiufmftdesrefz.supabase.co/storage/v1/object/public/public-images//logo.png"
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              </a>
              <h1 className="text-xl font-bold">Log in to StudyHub</h1>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  Sign up here!
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" onClick={logIn}>
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
