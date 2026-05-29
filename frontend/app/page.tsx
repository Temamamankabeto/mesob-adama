"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ClipboardList,
  Facebook,
  FileText,
  Globe2,
  Home,
  Linkedin,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Phone,
  Search,
  Send,
  UserPlus,
  Users,
  Youtube,
} from "lucide-react";

import { useSendContact, useTrackApplication } from "@/hooks/home/use-home";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import mesob from "@/app/mesob.jpg";

const navGroups = [
  {
    label: "Home Page",
    href: "/",
    icon: Home,
    items: [
      { label: "About Us", href: "/about", icon: Users },
      { label: "Service Provider", href: "/service-providers", icon: Building2 },
    ],
  },
  {
    label: "Services",
    href: "/services",
    items: [
      { label: "City", href: "/services?level=city", icon: Building2 },
      { label: "Sub City", href: "/services?level=subcity", icon: Building2 },
      { label: "Woreda", href: "/services?level=woreda", icon: Building2 },
    ],
  },
  {
    label: "Resource",
    href: "/resources",
    items: [
      { label: "Reports", href: "/resources/reports", icon: FileText },
      { label: "Guidelines", href: "/resources/guidelines", icon: ClipboardList },
      { label: "Policies", href: "/resources/policies", icon: FileText },
    ],
  },
  { label: "News", href: "/news" },
  { label: "Contacts", href: "/contact" },
];

const services = [
  { title: "City Services", text: "Services provided at city administration", icon: Building2 },
  { title: "Sub City Services", text: "Services provided at sub city level", icon: Users },
  { title: "Woreda Services", text: "Services provided at woreda level", icon: FileText },
];

export default function HomePage() {
  const [applicationNumber, setApplicationNumber] = useState("");
  const [language, setLanguage] = useState("Afaan Oromoo");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const trackMutation = useTrackApplication();
  const contactMutation = useSendContact();

  async function handleTrack() {
    if (!applicationNumber.trim()) return;
    try {
      const res = await trackMutation.mutateAsync({ application_number: applicationNumber });
      alert(`Status: ${res.data.status}`);
    } catch {
      alert("Application not found");
    }
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await contactMutation.mutateAsync(contactForm);
      setContactForm({ name: "", email: "", message: "" });
      alert("Your message has been sent successfully.");
    } catch {
      alert("Unable to send your message right now.");
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image src={mesob} alt="Adama MESOB" width={70} height={70} className="h-10 w-10 shrink-0 rounded-full object-cover" />
            <div className="min-w-0 leading-tight">
              <h1 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Adama<span className="text-sky-500">.</span></h1>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-[11px] sm:tracking-[0.28em]">MESOB eService</p>
            </div>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            <div className="group relative">
              <Button variant="outline" className="h-9 min-w-28 justify-between border-0 bg-white px-3 text-xs font-bold shadow-none hover:bg-slate-50">
                <span className="flex items-center gap-2"><Globe2 className="h-4 w-4" />EN</span>
                <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
              </Button>
              <div className="invisible absolute right-0 top-full z-50 w-48 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                <div className="rounded-xl border bg-white p-2 shadow-xl">
                  {["Afaan Oromoo", "English", "አማርኛ"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setLanguage(item)}
                      className="flex w-full items-center rounded-lg px-3 py-3 text-left text-sm font-semibold hover:bg-slate-100"
                    >
                      {item}{language === item && <Check className="ml-auto h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="group relative">
              <Button className="h-10 rounded-full bg-sky-500 px-7 text-xs font-black uppercase tracking-wide shadow-lg shadow-sky-100 hover:bg-sky-600">
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="invisible absolute right-0 top-full z-50 w-52 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                <div className="rounded-xl border bg-white p-3 text-[#08214a] shadow-xl">
                  <Link href="/login" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-100"><LockKeyhole className="h-4 w-4" />Sign In</Link>
                  <Link href="/register" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-100"><UserPlus className="h-4 w-4" />Create Account</Link>
                </div>
              </div>
            </div>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu"><Menu /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm overflow-y-auto p-0">
              <SheetHeader className="border-b px-5 py-4 text-left">
                <SheetTitle className="flex items-center gap-3">
                  <Image src={mesob} alt="Adama MESOB" width={44} height={44} className="h-10 w-10 rounded-full object-cover" />
                  <span className="leading-tight">Adama MESOB<br /><span className="text-xs font-semibold text-slate-500">eService</span></span>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-5 px-5 py-5">
                <div className="grid grid-cols-1 gap-2">
                  {navGroups.map((group) => {
                    const GroupIcon = group.icon;
                    return (
                      <div key={group.label} className="rounded-xl border bg-white p-2">
                        <Link
                          href={group.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
                        >
                          {GroupIcon && <GroupIcon className="h-4 w-4" />}
                          {group.label}
                        </Link>
                        {group.items && (
                          <div className="ml-4 border-l pl-2">
                            {group.items.map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <Link
                                  key={item.label}
                                  href={item.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                  <ItemIcon className="h-4 w-4" />
                                  {item.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Language</p>
                  <div className="grid gap-2">
                    {["Afaan Oromoo", "English", "አማርኛ"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setLanguage(item)}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-100"
                      >
                        {item}{language === item && <Check className="ml-auto h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button asChild className="h-11 rounded-xl bg-sky-500 font-bold hover:bg-sky-600">
                    <Link href="/login" onClick={() => setMobileOpen(false)}><LockKeyhole className="mr-2 h-4 w-4" />Sign In</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11 rounded-xl font-bold">
                    <Link href="/register" onClick={() => setMobileOpen(false)}><UserPlus className="mr-2 h-4 w-4" />Create Account</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <nav className="mx-auto hidden h-14 max-w-7xl items-center bg-white px-4 md:px-6 lg:flex">
          {navGroups.map((group) => {
            const GroupIcon = group.icon;

            if (!group.items) {
              return (
                <Link
                  key={group.label}
                  href={group.href}
                  className="flex h-14 min-w-32 items-center justify-center gap-2 border-b-2 border-transparent px-4 text-sm font-semibold text-slate-700 hover:border-sky-500 hover:text-sky-600"
                >
                  {GroupIcon && <GroupIcon className="h-5 w-5" />}
                  {group.label}
                </Link>
              );
            }

            return (
              <div key={group.label} className="group relative">
                <Link
                  href={group.href}
                  className="flex h-14 min-w-36 items-center justify-center gap-2 border-b-2 border-transparent px-4 text-sm font-semibold text-slate-700 hover:border-sky-500 hover:text-sky-600"
                >
                  {GroupIcon && <GroupIcon className="h-5 w-5" />}
                  {group.label}
                  <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 w-56 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                  <div className="rounded-xl border bg-white p-3 shadow-xl">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;

                      return (
                        <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-100">
                          <ItemIcon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </header>

      <section className="px-3 pb-6 pt-4 sm:px-4 md:px-6 md:pb-8 md:pt-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-50 px-4 py-14 text-center sm:px-6 sm:py-16 md:rounded-[2rem] md:px-10 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(250,204,21,0.18),transparent_18%),radial-gradient(circle_at_40%_62%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_62%_48%,rgba(56,189,248,0.16),transparent_26%)]" />
          <div className="relative mx-auto max-w-5xl">
            <h2 className="mx-auto max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
              eService for ensuring good governance
            </h2>

            <div className="mx-auto mt-10 max-w-5xl md:mt-14">
              <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:rounded-full sm:p-0">
                <Search className="absolute left-5 top-6 h-5 w-5 text-slate-400 sm:top-1/2 sm:-translate-y-1/2" />
                <Input
                  value={applicationNumber}
                  onChange={(e) => setApplicationNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTrack();
                  }}
                  placeholder="Search"
                  className="h-12 rounded-xl border-0 bg-transparent pl-12 pr-4 text-sm shadow-none focus-visible:ring-0 sm:h-14 sm:rounded-full sm:pr-28"
                />
                <Button
                  onClick={handleTrack}
                  disabled={trackMutation.isPending}
                  className="mt-2 h-11 w-full rounded-xl bg-sky-500 px-6 text-sm font-bold hover:bg-sky-600 sm:absolute sm:right-2 sm:top-1/2 sm:mt-0 sm:h-10 sm:w-auto sm:-translate-y-1/2 sm:rounded-full"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-3 py-6 sm:px-4 md:px-8 md:py-8 lg:grid-cols-[1fr_440px]">
        <Card className="rounded-2xl border-0 bg-white shadow-lg">
          <CardContent className="p-5 sm:p-7">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-2xl font-black sm:text-3xl">Our Services</h3>
              <Link href="/services" className="flex items-center gap-2 font-bold text-[#063d91]">View All <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {services.map((service, index) => <Link href="/services" key={service.title} className="rounded-xl border bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7"><div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 ${index % 3 === 0 ? "bg-emerald-100 text-emerald-700" : index % 3 === 1 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}><service.icon className="h-7 w-7 sm:h-8 sm:w-8" /></div><h4 className="font-black">{service.title}</h4><p className="mt-2 text-sm leading-6 text-slate-700">{service.text}</p></Link>)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-lg">
          <CardContent className="p-5 sm:p-7">
            <h3 className="mb-6 text-2xl font-black sm:text-3xl">Contact Us</h3>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="relative"><Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input value={contactForm.name} onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))} className="h-12 rounded-xl pl-12 sm:h-14" placeholder="Name" required /></div>
              <div className="relative"><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input type="email" value={contactForm.email} onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))} className="h-12 rounded-xl pl-12 sm:h-14" placeholder="Email" required /></div>
              <div className="relative"><MessageSquare className="absolute left-4 top-5 h-5 w-5 text-slate-400" /><Textarea value={contactForm.message} onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))} className="min-h-36 rounded-xl pl-12 pt-4 sm:min-h-40" placeholder="Message" required /></div>
              <Button disabled={contactMutation.isPending} className="h-12 w-full rounded-xl bg-[#063d91] text-base font-bold sm:h-14"><Send className="mr-2 h-5 w-5" />{contactMutation.isPending ? "Sending..." : "Send Message"}</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <footer className="bg-gradient-to-r from-[#06295a] to-[#04507f] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:px-8 lg:grid-cols-5 lg:py-12">
          <div className="sm:col-span-2 lg:col-span-1"><div className="flex items-center gap-3"><Image src={mesob} alt="Adama MESOB" width={58} height={58} className="rounded-full" /><div className="text-xl font-black">Adama MESOB<br /><span className="text-emerald-400">eService</span></div></div><p className="mt-5 text-sm leading-7 text-white/85">Tajaajila elektiroonikaalaa bulchiinsa gaarii mirkaneessuuf hojjanna.</p></div>
          <FooterLinks
            title="About Us"
            items={[
              { label: "About Us", href: "/about" },
              { label: "Service Provider", href: "/service-providers" },
              { label: "Vision & Mission", href: "/about" },
              { label: "Our Team", href: "/about" },
            ]}
          />
          <FooterLinks
            title="Services"
            items={[
              { label: "City Services", href: "/services?level=city" },
              { label: "Sub City Services", href: "/services?level=subcity" },
              { label: "Woreda Services", href: "/services?level=woreda" },
              { label: "All Services", href: "/services" },
            ]}
          />
          <FooterLinks
            title="Resources"
            items={[
              { label: "Reports", href: "/resources/reports" },
              { label: "Guidelines", href: "/resources/guidelines" },
              { label: "Policies", href: "/resources/policies" },
              { label: "Latest News", href: "/news" },
            ]}
          />
          <div><h4 className="mb-4 font-black">Contact</h4><p className="flex gap-3 text-sm"><MapPin className="h-5 w-5 shrink-0" />Adama, Oromia, Ethiopia</p><p className="mt-4 flex gap-3 text-sm"><Phone className="h-5 w-5 shrink-0" />+251 9141</p></div>
        </div>
        <div className="border-t border-white/20"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-center text-sm md:flex-row md:px-8 md:text-left"><p>© 2026 Adama MESOB eService. All Rights Reserved.</p><div className="flex flex-wrap items-center justify-center gap-4"><span>Follow Us</span><Facebook className="h-5 w-5" /><Send className="h-5 w-5" /><Youtube className="h-5 w-5" /><Linkedin className="h-5 w-5" /></div></div></div>
      </footer>
    </main>
  );
}

type FooterLinkItem = { label: string; href: string };

function FooterLinks({ title, items }: { title: string; items: FooterLinkItem[] }) {
  return (
    <div>
      <h4 className="mb-4 font-black">{title}</h4>
      <ul className="space-y-3 text-sm text-white/85">
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
