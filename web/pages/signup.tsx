/**
 * This is the signup page of the application, allowing users to register.
 * Used a07 Alias for reference
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { AtSign } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, useRef, useEffect, memo, forwardRef } from "react";

const SearchBar = memo(
  forwardRef<
    HTMLInputElement,
    {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }
  >(({ value, onChange }, ref) => (
    <div className="p-2">
      <Input
        ref={ref}
        placeholder="Search majors..."
        value={value}
        onChange={onChange}
        className="w-full"
      />
    </div>
  )),
);
SearchBar.displayName = "SearchBar";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");

  const [selectedMajor, setSelectedMajor] = useState("");
  const [majorSearch, setMajorSearch] = useState("");
  const { resolvedTheme } = useTheme()

  // Determine which logo to show based on theme
  const logoUrl =
  resolvedTheme === "light"
    ? "https://kzyyqceiufmftdesrefz.supabase.co/storage/v1/object/public/public-images//image.png"
    : "https://kzyyqceiufmftdesrefz.supabase.co/storage/v1/object/public/public-images//logo.png";


  const majors = [
    { value: "aerospace-studies", label: "Aerospace Studies" },
    {
      value: "african-studies",
      label: "African, African American, and Diaspora Studies",
    },
    { value: "american-studies", label: "American Studies" },
    { value: "anthropology", label: "Anthropology" },
    { value: "applied-sciences", label: "Applied Sciences" },
    { value: "archaeology", label: "Archaeology" },
    { value: "art-history", label: "Art History" },
    { value: "asian-studies", label: "Asian Studies" },
    { value: "astronomy", label: "Astronomy" },
    { value: "biology", label: "Biology" },
    { value: "biomedical-engineering", label: "Biomedical Engineering" },
    { value: "biostatistics", label: "Biostatistics" },
    { value: "business-administration", label: "Business Administration" },
    { value: "chemistry", label: "Chemistry" },
    { value: "classics", label: "Classics" },
    { value: "clinical-lab-science", label: "Clinical Laboratory Science" },
    { value: "communication", label: "Communication Studies" },
    { value: "comparative-literature", label: "Comparative Literature" },
    { value: "computer-science", label: "Computer Science" },
    { value: "european-studies", label: "Contemporary European Studies" },
    { value: "data-science", label: "Data Science" },
    { value: "dental-hygiene", label: "Dental Hygiene" },
    { value: "dramatic-art", label: "Dramatic Art" },
    { value: "earth-marine-sciences", label: "Earth and Marine Sciences" },
    { value: "economics", label: "Economics" },
    { value: "english", label: "English and Comparative Literature" },
    { value: "environmental-health", label: "Environmental Health Sciences" },
    { value: "environmental-science", label: "Environmental Science" },
    { value: "environmental-studies", label: "Environmental Studies" },
    { value: "exercise-sport-science", label: "Exercise and Sport Science" },
    { value: "geography", label: "Geography" },
    { value: "geological-sciences", label: "Geological Sciences" },
    {
      value: "germanic-slavic",
      label: "Germanic and Slavic Languages and Literatures",
    },
    { value: "global-studies", label: "Global Studies" },
    { value: "health-policy", label: "Health Policy and Management" },
    { value: "history", label: "History" },
    {
      value: "human-org-dev",
      label: "Human and Organizational Leadership Development",
    },
    {
      value: "human-development",
      label: "Human Development and Family Science",
    },
    { value: "information-science", label: "Information Science" },
    { value: "interdisciplinary-studies", label: "Interdisciplinary Studies" },
    { value: "latin-american-studies", label: "Latin American Studies" },
    { value: "linguistics", label: "Linguistics" },
    { value: "management-society", label: "Management and Society" },
    { value: "mathematics", label: "Mathematics" },
    { value: "media-journalism", label: "Media and Journalism" },
    { value: "medical-anthropology", label: "Medical Anthropology" },
    { value: "music", label: "Music" },
    { value: "neurodiagnostics", label: "Neurodiagnostics and Sleep Science" },
    { value: "neuroscience", label: "Neuroscience" },
    { value: "nursing", label: "Nursing" },
    { value: "nutrition", label: "Nutrition" },
    { value: "peace-war-defense", label: "Peace, War, and Defense" },
    { value: "philosophy", label: "Philosophy" },
    { value: "physics", label: "Physics" },
    { value: "political-science", label: "Political Science" },
    { value: "psychology", label: "Psychology" },
    { value: "public-policy", label: "Public Policy" },
    { value: "radiologic-science", label: "Radiologic Science" },
    { value: "religious-studies", label: "Religious Studies" },
    { value: "romance-languages", label: "Romance Languages" },
    { value: "sociology", label: "Sociology" },
    { value: "statistics", label: "Statistics and Analytics" },
    { value: "studio-art", label: "Studio Art" },
    { value: "womens-gender-studies", label: "Women's and Gender Studies" },
    { value: "undeclared", label: "Undeclared" },
  ];

  const filteredMajors = majors.filter((major) =>
    major.label.toLowerCase().includes(majorSearch.toLowerCase()),
  );

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchRef.current && document.activeElement !== searchRef.current) {
        searchRef.current.focus();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [majorSearch]);

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name, handle: handle, major: selectedMajor } },
    });
    if (error) {
      console.log(error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-[calc(100svh-164px)] flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex w-40 items-center justify-center rounded-md pb-5">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
              </a>
              <h1 className="text-xl font-bold">Welcome to StudyHub!</h1>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Log in here!
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramses@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ramses"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="handle">Handle</Label>
                <div className="relative">
                  <AtSign className="absolute left-2 top-2.5 h-4 w-4" />
                  <Input
                    className="pl-8"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="ramses"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2 my-2">
                <Label htmlFor="major">Major</Label>
                <Select onValueChange={setSelectedMajor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Major" />
                  </SelectTrigger>
                  <SelectContent>
                    <SearchBar
                      ref={searchRef}
                      value={majorSearch}
                      onChange={(e) => setMajorSearch(e.target.value)}
                    />
                    <SelectGroup>
                      {filteredMajors.length > 0 ? (
                        filteredMajors.map((major) => (
                          <SelectItem key={major.value} value={major.value}>
                            {major.label}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          No majors found.
                        </div>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" onClick={signUp}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}