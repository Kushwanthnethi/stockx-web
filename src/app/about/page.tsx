import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Code2, GraduationCap, LineChart, Mail, MapPin, Send, Target, Terminal } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="container max-w-5xl mx-auto py-10 space-y-12">
            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-4">
                    <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">About Me</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Final-year B.Tech student blending technology, finance, and user experience to build professional-grade products.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button asChild>
                        <Link href="mailto:nethikushwanth@gmail.com">
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Me
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <a href="https://www.linkedin.com/in/kushwanth-nethi-ba0743281" target="_blank" rel="noopener noreferrer">
                            LinkedIn
                        </a>
                    </Button>
                </div>
            </div>

            <Separator className="my-8" />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Profile & key info */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="overflow-hidden border-2 border-primary/10">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                        <CardHeader className="-mt-16 relative z-10">
                            <div className="w-24 h-24 rounded-full border-4 border-background bg-secondary flex items-center justify-center text-4xl shadow-lg">
                                {/* Placeholder for avatar if none provided */}
                                👨‍💻
                            </div>
                            <CardTitle className="mt-4 text-2xl">Developer & Analyst</CardTitle>
                            <CardDescription>Frontend • Backend • Finance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="mr-2 h-4 w-4" />
                                India
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                B.Tech Final Year
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Code2 className="mr-2 h-4 w-4" />
                                Full Stack Developer
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Skills
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Next.js</Badge>
                            <Badge variant="secondary">React</Badge>
                            <Badge variant="secondary">Tailwind CSS</Badge>
                            <Badge variant="secondary">PostgreSQL</Badge>
                            <Badge variant="secondary">Spring Boot</Badge>
                            <Badge variant="secondary">NestJS</Badge>
                            <Badge variant="secondary">JWT Auth</Badge>
                            <Badge variant="secondary">System Design</Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Detailed Bio */}
                <div className="md:col-span-2 space-y-8">

                    {/* Current Focus */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                            <Terminal className="h-6 w-6 text-primary" />
                            <h2>Current Focus</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Currently, I’m working on <strong className="text-foreground">StockX</strong>, a premium stock intelligence and social platform.
                            My focus is on bridging the gap between complex financial data and user-friendly interfaces.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card className="bg-secondary/50 border-none">
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold mb-2 text-foreground">Frontend Engineering</h3>
                                    <p className="text-sm text-muted-foreground">Building responsive, high-performance UIs with Next.js and Tailwind CSS.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-secondary/50 border-none">
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold mb-2 text-foreground">Backend Architecture</h3>
                                    <p className="text-sm text-muted-foreground">Designing scalable APIs with NestJS, handling Authentication (JWT), and optimizing Database queries.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Financial Analysis */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                            <LineChart className="h-6 w-6 text-primary" />
                            <h2>Financial Interests</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Beyond coding, I actively analyze financial results, sectors, and investor-focused metrics.
                            My goal is to understand how big investors think and apply those insights to build better data-driven platforms.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                            <li>Analysis of Financial Results & Sectors</li>
                            <li>Tracking Investor Metrics & Smart Money Flow</li>
                            <li>Building tools for Retail Investors</li>
                        </ul>
                    </section>

                    {/* Philosophy */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <h2>Philosophy & Goals</h2>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            I believe in continuous learning, practical implementation, and clean architecture.
                            My long-term goal is to build professional-grade, scalable products in the fintech or software domain.
                        </p>
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-primary-foreground">
                            <p className="text-sm font-medium text-foreground italic">
                                "Aiming to step confidently into the industry with a strong foundation in both technical skills and domain knowledge."
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
