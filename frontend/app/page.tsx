"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Facebook,
  FileBadge,
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
import { Input } from "@/components/ui/input";
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

const categories = [
  { title: "Employment Services", icon: BriefcaseBusiness },
  { title: "Personal Documents", icon: Users },
  { title: "Certificates", icon: FileBadge },
  { title: "Business Services", icon: Building2 },
  { title: "Payments & Fines", icon: CreditCard },
];

const services = [
  { title: "City Services", text: "Services provided at city administration", icon: Building2 },
  { title: "Sub City Services", text: "Services provided at sub city level", icon: Users },
  { title: "Woreda Services", text: "Services provided at woreda level", icon: FileText },
  { title: "Certificates", text: "Apply and verify different certificates", icon: FileBadge },
  { title: "Reports", text: "View and download official reports", icon: ClipboardList },
  { title: "Payments & Fines", text: "Pay your fees and check fines", icon: CreditCard },
];

export default function HomePage() {
  const [applicationNumber, setApplicationNumber] = useState("");
  const [language, setLanguage] = useState("Afaan Oromoo");
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
    <main className="min-h-screen bg-[#f4f8fc] text-[#08214a]">
      <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-[86px] max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src={mesob} alt="Adama MESOB" width={70} height={70} className="h-16 w-16 rounded-full object-cover" />
            <div className="leading-tight">
              <h1 className="text-2xl font-black text-[#08346f]">Adama MESOB</h1>
              <p className="text-2xl font-black text-emerald-600">eService</p>
            </div>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            <div className="group relative">
              <Button variant="outline" className="h-11 min-w-48 justify-between rounded-xl bg-white px-5 font-semibold">
                <span className="flex items-center gap-2"><Globe2 className="h-4 w-4" />{language}</span>
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
              <Button className="h-11 rounded-xl bg-[#063d91] px-8 font-bold shadow-lg">
                <LockKeyhole className="mr-2 h-4 w-4" />Sign In
              </Button>
              <div className="invisible absolute right-0 top-full z-50 w-52 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                <div className="rounded-xl border bg-white p-3 text-[#08214a] shadow-xl">
                  <Link href="/login" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-100"><LockKeyhole className="h-4 w-4" />Sign In</Link>
                  <Link href="/register" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold hover:bg-slate-100"><UserPlus className="h-4 w-4" />Create Account</Link>
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden"><Menu /></Button>
        </div>

        <nav className="mx-auto hidden max-w-7xl items-center rounded-t-2xl border bg-white px-4 shadow-sm lg:flex">
          {navGroups.map((group) => {
            const GroupIcon = group.icon;

            if (!group.items) {
              return (
                <Link
                  key={group.label}
                  href={group.href}
                  className="flex h-16 min-w-36 items-center justify-center gap-2 border-b-4 border-transparent px-5 text-sm font-bold hover:border-[#0a49aa] hover:text-[#0a49aa]"
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
                  className="flex h-16 min-w-44 items-center justify-center gap-2 border-b-4 border-transparent px-5 text-sm font-bold hover:border-[#0a49aa] hover:text-[#0a49aa]"
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

      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-sky-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_12%_30%,rgba(16,185,129,0.11),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-28 text-center md:px-8 md:pt-36">
          <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight text-[#07347c] md:text-5xl">eService for ensuring<br />good governance</h2>
          <div className="mx-auto mt-4 h-1 w-16 bg-emerald-500" />
          <p className="mx-auto mt-5 max-w-3xl text-3xl font-black leading-tight text-emerald-700">Tajaajila elektiroonikaalaa<br />bulchiinsa gaarii mirkaneessuuf</p>

          <div className="mx-auto mt-10 flex max-w-4xl rounded-2xl bg-white p-2 shadow-2xl">
            <div className="relative flex-1"><Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#08214a]" /><Input value={applicationNumber} onChange={(e) => setApplicationNumber(e.target.value)} placeholder="Search services, information..." className="h-16 border-0 pl-14 text-base shadow-none focus-visible:ring-0" /></div>
            <Button onClick={handleTrack} disabled={trackMutation.isPending} className="h-16 rounded-xl bg-[#063d91] px-12 text-lg font-bold">Search</Button>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-0 overflow-hidden rounded-2xl bg-white/95 p-4 shadow-xl md:grid-cols-5">
            {categories.map((item) => <Link href="/services" key={item.title} className="flex items-center gap-4 border-b p-4 text-left last:border-0 md:border-b-0 md:border-r"><span className="rounded-xl bg-emerald-100 p-3 text-emerald-700"><item.icon className="h-6 w-6" /></span><span className="font-bold leading-tight">{item.title}</span></Link>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1fr_440px] md:px-8">
        <div className="rounded-2xl bg-white p-7 shadow-lg">
          <div className="mb-6 flex items-center justify-between"><h3 className="text-3xl font-black">Our Services</h3><Link href="/services" className="flex items-center gap-2 font-bold text-[#063d91]">View All <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="grid gap-4 md:grid-cols-3">
            {services.map((service, index) => <Link href="/services" key={service.title} className="rounded-xl border bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${index % 3 === 0 ? "bg-emerald-100 text-emerald-700" : index % 3 === 1 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}><service.icon className="h-8 w-8" /></div><h4 className="font-black">{service.title}</h4><p className="mt-2 text-sm leading-6 text-slate-700">{service.text}</p></Link>)}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-lg">
          <h3 className="mb-6 text-3xl font-black">Contact Us</h3>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="relative"><Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input value={contactForm.name} onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))} className="h-14 rounded-xl pl-12" placeholder="Name" required /></div>
            <div className="relative"><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input type="email" value={contactForm.email} onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))} className="h-14 rounded-xl pl-12" placeholder="Email" required /></div>
            <div className="relative"><MessageSquare className="absolute left-4 top-5 h-5 w-5 text-slate-400" /><Textarea value={contactForm.message} onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))} className="min-h-40 rounded-xl pl-12 pt-4" placeholder="Message" required /></div>
            <Button disabled={contactMutation.isPending} className="h-14 w-full rounded-xl bg-[#063d91] text-base font-bold"><Send className="mr-2 h-5 w-5" />{contactMutation.isPending ? "Sending..." : "Send Message"}</Button>
          </form>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-[#06295a] to-[#04507f] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-5 md:px-8">
          <div><div className="flex items-center gap-3"><Image src={mesob} alt="Adama MESOB" width={58} height={58} className="rounded-full" /><div className="text-xl font-black">Adama MESOB<br /><span className="text-emerald-400">eService</span></div></div><p className="mt-5 text-sm leading-7 text-white/85">Tajaajila elektiroonikaalaa bulchiinsa gaarii mirkaneessuuf hojjanna.</p></div>
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
          <div><h4 className="mb-4 font-black">Contact</h4><p className="flex gap-3 text-sm"><MapPin className="h-5 w-5" />Adama, Oromia, Ethiopia</p><p className="mt-4 flex gap-3 text-sm"><Phone className="h-5 w-5" />+251 9141</p></div>
        </div>
        <div className="border-t border-white/20"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm md:flex-row md:px-8"><p>© 2026 Adama MESOB eService. All Rights Reserved.</p><div className="flex items-center gap-4"><span>Follow Us</span><Facebook /><Send /><Youtube /><Linkedin /></div></div></div>
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
