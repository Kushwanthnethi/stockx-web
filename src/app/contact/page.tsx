import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact Us | StocksX",
    description: "Get in touch with StocksX support, legal, and policy teams.",
    alternates: {
        canonical: "/contact",
    },
};

export default function ContactPage() {
    return (
        <div className="container max-w-3xl mx-auto py-10 px-4 space-y-8">
            <div className="space-y-3">
                <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
                <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
                <p className="text-muted-foreground">
                    For support, legal, account, privacy, or advertising-related queries, reach us at:
                </p>
                <p className="text-lg font-semibold">
                    <a href="mailto:contact@stocksx.info" className="inline-flex items-center gap-2 underline hover:text-primary transition-colors">
                        <Mail className="h-4 w-4" />
                        contact@stocksx.info
                    </a>
                </p>
            </div>

            <section className="rounded-xl border bg-card p-6 space-y-4">
                <h2 className="text-2xl font-bold tracking-tight inline-flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Contact Form
                </h2>
                <p className="text-sm text-muted-foreground">
                    Fill this form and email the details to us, or send directly to contact@stocksx.info.
                </p>

                <form className="space-y-4" action="mailto:contact@stocksx.info" method="post" encType="text/plain">
                    <div className="space-y-1">
                        <label htmlFor="name" className="text-sm font-medium">Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Your full name"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                        <input
                            id="subject"
                            name="subject"
                            type="text"
                            required
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="How can we help?"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="message" className="text-sm font-medium">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            required
                            rows={5}
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Write your message"
                        />
                    </div>

                    <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                        Send via Email
                    </button>
                </form>
            </section>

            <section className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                <p className="inline-flex items-center gap-2 font-medium text-foreground mb-1">
                    <ShieldCheck className="h-4 w-4" />
                    Policy Requests
                </p>
                <p>
                    For data deletion, privacy requests, or legal policy concerns, email us at contact@stocksx.info.
                </p>
            </section>
        </div>
    );
}