import { getAllFiles } from "@/lib/content";
import DirectoryClient from "./DirectoryClient";

export const metadata = {
  title: "Genetic Testing Company Directory — GeneticTesting.com",
  description: "Discover the leading genetic testing companies — from consumer DNA testing to clinical diagnostics and oncology genomics.",
};

export default function DirectoryPage() {
  const companies = getAllFiles("companies") as any[];
  return <DirectoryClient companies={companies} />;
}
