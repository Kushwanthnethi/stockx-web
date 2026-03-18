import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BarChart3, BookOpen, Building2, LineChart, Mail, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="container max-w-6xl mx-auto py-10 space-y-10">
            <div className="flex flex-col gap-6">
                <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>

                <div className="rounded-2xl border bg-card/60 backdrop-blur-sm p-6 md:p-8">
                    <p className="text-xs md:text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-3">
                        About StocksX
                    </p>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                        Building a Clearer Interface for Market Decisions
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg mt-4 max-w-3xl leading-relaxed">
                        StocksX is a modern market intelligence platform focused on turning noisy market data into clean,
                        actionable insights. We combine real-time signals, fundamental context, and thoughtful product design
                        to help retail investors make better-informed decisions.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-6">
                        <Badge variant="secondary">Real-time Market Monitoring</Badge>
                        <Badge variant="secondary">Research-First Product Design</Badge>
                        <Badge variant="secondary">Investor-Centric Workflows</Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Target className="h-4 w-4 text-primary" />
                            Mission
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Make high-quality stock market intelligence understandable and usable for everyday investors.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Vision
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Become a trusted digital companion for long-term investing decisions in Indian markets.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Principles
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Clarity over noise, transparency over hype, and consistency over short-term market excitement.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                What We Build
                            </CardTitle>
                            <CardDescription>
                                Product areas currently available in StocksX.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-lg border p-3 bg-muted/20">
                                <h3 className="font-medium text-sm">Market Dashboard</h3>
                                <p className="text-xs text-muted-foreground mt-1">Daily pulse for indices, movers, and latest developments.</p>
                            </div>
                            <div className="rounded-lg border p-3 bg-muted/20">
                                <h3 className="font-medium text-sm">Stock Screener</h3>
                                <p className="text-xs text-muted-foreground mt-1">Filter opportunities using key financial and momentum criteria.</p>
                            </div>
                            <div className="rounded-lg border p-3 bg-muted/20">
                                <h3 className="font-medium text-sm">Portfolio Tracking</h3>
                                <p className="text-xs text-muted-foreground mt-1">Live monitoring of holdings, allocation, and portfolio trends.</p>
                            </div>
                            <div className="rounded-lg border p-3 bg-muted/20">
                                <h3 className="font-medium text-sm">Research Tools</h3>
                                <p className="text-xs text-muted-foreground mt-1">Contextual insights for results, sectors, and company developments.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LineChart className="h-5 w-5 text-primary" />
                                How We Think About News & Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                            <p>
                                We aim to add original value on top of publicly available market developments by providing context,
                                structure, and relevance for investors.
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5">
                                <li>Source-first attribution for external headlines and references</li>
                                <li>Contextual interpretation focused on investor impact</li>
                                <li>Noise reduction through curation and prioritization</li>
                                <li>Clear separation between information and personal investment decisions</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                Important Note
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                StocksX provides informational content for research purposes only and does not constitute financial advice,
                                investment recommendation, or solicitation. Always perform your own due diligence or consult a certified
                                financial advisor before making investment decisions.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Building2 className="h-4 w-4 text-primary" />
                                Company Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p><span className="text-foreground font-medium">Name:</span> StocksX</p>
                            <p><span className="text-foreground font-medium">Category:</span> Market Intelligence Platform</p>
                            <p><span className="text-foreground font-medium">Focus:</span> Indian Equity Markets</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4 text-primary" />
                                Team & Product
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>
                                We are a product-first team working at the intersection of software engineering, financial data,
                                and user experience.
                            </p>
                            <p>
                                Our goal is to ship fast, iterate responsibly, and keep investor clarity at the center of every release.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Mail className="h-4 w-4 text-primary" />
                                Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-3">
                                For support, feedback, or partnerships, contact our team.
                            </p>
                            <Button asChild className="w-full">
                                <a href="mailto:nethikushwanth@gmail.com">Email Us</a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
