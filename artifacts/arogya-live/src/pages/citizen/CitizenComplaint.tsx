import { useState, FormEvent } from "react";
import { PublicLayout } from "@/layouts/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CitizenComplaint() {
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!email.trim()) {
    alert("Please enter your email.");
    return;
  }

  if (!description.trim()) {
    alert("Please describe your problem.");
    return;
  }

  const response = await fetch("/api/complaints", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      description,
      imageUrl: null,
    }),
  });

  if (response.ok) {
    alert("Complaint submitted successfully!");

    setEmail("");
    setDescription("");
    setImage(null);
  } else {
    alert("Failed to submit complaint.");
  }
};
  return (
    <PublicLayout>
      <div className="container mx-auto max-w-2xl py-10 px-4">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-2">
              Report a Problem
            </h1>

            <p className="text-muted-foreground mb-6">
              Please fill out the form below to submit your complaint.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">

  <div>
    <Label htmlFor="email">Email Address</Label>
    <Input
      id="email"
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    </div>

  <div>
    <Label htmlFor="description">Describe your problem</Label>
    <Textarea
      id="description"
      placeholder="Write your complaint here..."
      rows={6}
      value={description}
      onChange={(e) => setDescription(e.target.value)}
    />
  </div>

  <div>
    <Label htmlFor="image">Upload Photo (Optional)</Label>
    <Input
      id="image"
      type="file"
      accept="image/*"
      onChange={(e) =>
        setImage(e.target.files ? e.target.files[0] : null)
      }
    />
  </div>

 <Button type="submit" className="w-full">
  Submit Complaint
</Button>
</form>


          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}