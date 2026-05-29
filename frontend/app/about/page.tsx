import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Globe2,
  Landmark,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import mesob from "@/app/mesob.jpg";

type City = {
  id: number;
  name: string;
  code?: string | null;
};

type Subcity = {
  id: number;
  city_id?: number | null;
  name: string;
};

type Woreda = {
  id: number;
  city_id?: number | null;
  subcity_id?: number | null;
  name: string;
};

type PublicService = {
  id: number;
  name: string;
  description?: string | null;
};

type AboutData = {
  cities: City[];
  subcities: Subcity[];
  woredas: Woreda[];
  services: PublicService[];
};

const fallbackSubCities = [
  "Abdi Jilo Sub City",
  "Bokku Sub City",
  "Dabe Sub City",
  "Geda Sub City",
  "Melka Adama Sub City",
  "Hidhabu Abote Sub City",
];

const fallbackWoredas = Array.from(
  { length: 19 },
  (_, index) => `Woreda ${String(index + 1).padStart(2, "0")}`
);

const fallbackServices = [
  "Civil registration and certificates",
  "Business licensing and renewal",
  "Land and construction services",
  "Payment and finance services",
  "Appointment and notification services",
  "Document verification and tracking",
];

const workflow = [
  "Apply Online",
  "Upload Documents",
  "Officer Review",
  "Approval",
  "Payment",
  "Service Delivery",
];

function apiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://127.0.0.1:8000/api"
  ).replace(/\/$/, "");
}

async function getAboutData(): Promise<AboutData> {
  const baseUrl = apiBaseUrl();

  try {
    const [locationsResponse, servicesResponse] = await Promise.all([
      fetch(`${baseUrl}/public/locations`, {
        next: { revalidate: 60 },
      }),
      fetch(`${baseUrl}/public/services/featured`, {
        next: { revalidate: 60 },
      }),
    ]);

    if (!locationsResponse.ok) {
      throw new Error("Unable to fetch public locations");
    }

    const locationsPayload = await locationsResponse.json();

    const servicesPayload = servicesResponse.ok
      ? await servicesResponse.json()
      : null;

    return {
      cities: locationsPayload?.data?.cities ?? [],
      subcities: locationsPayload?.data?.subcities ?? [],
      woredas: locationsPayload?.data?.woredas ?? [],
      services: servicesPayload?.data ?? [],
    };
  } catch {
    return {
      cities: [],
      subcities: fallbackSubCities.map((name, index) => ({
        id: index + 1,
        name,
      })),
      woredas: fallbackWoredas.map((name, index) => ({
        id: index + 1,
        name,
      })),
      services: fallbackServices.map((name, index) => ({
        id: index + 1,
        name,
        description: null,
      })),
    };
  }
}

export default async function AboutPage() {
  const { cities, subcities, woredas, services } =
    await getAboutData();

  const cityName =
    cities[0]?.name || "Adama City Administration";

  const displayedSubcities =
    subcities.length > 0
      ? subcities
      : fallbackSubCities.map((name, index) => ({
          id: index + 1,
          name,
        }));

  const displayedWoredas =
    woredas.length > 0
      ? woredas
      : fallbackWoredas.map((name, index) => ({
          id: index + 1,
          name,
        }));

  const displayedServices =
    services.length > 0
      ? services
      : fallbackServices.map((name, index) => ({
          id: index + 1,
          name,
          description: null,
        }));

  const stats = [
    {
      label: "City Administration",
      value: String(Math.max(cities.length, 1)),
      icon: Landmark,
    },
    {
      label: "Sub Cities",
      value: String(displayedSubcities.length),
      icon: Building2,
    },
    {
      label: "Woredas",
      value: String(displayedWoredas.length),
      icon: MapPin,
    },
    {
      label: "Digital Services",
      value: `${displayedServices.length}+`,
      icon: Globe2,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-[#062f6f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.35),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.45),transparent_28%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur hover:bg-white/20"
            >
              <Image
                src={mesob}
                alt="Adama MESOB"
                width={34}
                height={34}
                className="h-8 w-8 rounded-full object-cover"
              />

              Adama MESOB eService
            </Link>

            <p className="mb-4 inline-flex rounded-full bg-emerald-400/20 px-4 py-2 text-sm font-bold text-emerald-100">
              City • Sub City • Woreda Digital Service Center
            </p>

            <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Modern public service delivery for all Adama City
              residents.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-50">
              Adama MESOB eService Center is a unified role-based
              digital government platform built to connect
              citizens, businesses, and public institutions with
              efficient, secure, transparent, and accountable
              services across the city administration,
              {" "}
              {displayedSubcities.length} sub cities, and
              {" "}
              {displayedWoredas.length} woredas.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/services"
                className="inline-flex items-center rounded-xl bg-emerald-500 px-6 py-3 font-black text-white shadow-xl hover:bg-emerald-600"
              >
                Explore Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <Link
                href="/track-application"
                className="inline-flex items-center rounded-xl bg-white px-6 py-3 font-black text-[#062f6f] shadow-xl hover:bg-slate-100"
              >
                Track Application
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] bg-white p-5 text-slate-900">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border bg-slate-50 p-5 shadow-sm"
                    >
                      <Icon className="mb-4 h-8 w-8 text-emerald-600" />

                      <div className="text-4xl font-black text-[#063d91]">
                        {item.value}
                      </div>

                      <p className="mt-1 text-sm font-bold text-slate-600">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#063d91] to-emerald-600 p-5 text-white">
                <p className="text-sm font-bold uppercase tracking-wider text-blue-100">
                  Service Promise
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Less waiting. More transparency. Better governance.
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <InfoCard
            icon={ShieldCheck}
            title="Our Vision"
            text="To become a leading smart city digital service platform that provides accessible, transparent, and citizen-centered public services."
          />

          <InfoCard
            icon={ClipboardCheck}
            title="Our Mission"
            text="To digitize public services, reduce service delivery time, improve accountability, and strengthen institutional efficiency."
          />

          <InfoCard
            icon={Sparkles}
            title="Our Value"
            text="Good governance, transparency, security, inclusion, accountability, and reliable service delivery at every administrative level."
          />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionTitle
            eyebrow="Administrative Coverage"
            title="One digital service center serving the full city structure"
          />

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
            <div className="rounded-3xl bg-[#063d91] p-8 text-white shadow-xl">
              <Landmark className="h-12 w-12 text-emerald-300" />

              <h3 className="mt-6 text-3xl font-black">
                {cityName}
              </h3>

              <p className="mt-4 leading-7 text-blue-50">
                MESOB provides a single digital gateway where
                city-level offices can publish services, assign
                officers, manage workflows, receive applications,
                approve requests, and monitor service performance.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {displayedSubcities.map((subcity, index) => (
                <div
                  key={subcity.id}
                  className="rounded-2xl border bg-slate-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 font-black text-emerald-700">
                    {index + 1}
                  </div>

                  <h4 className="text-lg font-black text-[#063d91]">
                    {subcity.name}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Sub city service delivery, officer assignment,
                    application review, and citizen support.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-3xl border bg-slate-50 p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <MapPin className="h-7 w-7 text-emerald-600" />

              <h3 className="text-2xl font-black text-[#063d91]">
                {displayedWoredas.length} Woreda Service Points
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {displayedWoredas.map((woreda) => (
                <div
                  key={woreda.id}
                  className="rounded-xl border bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm"
                >
                  {woreda.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <SectionTitle
          eyebrow="Digital Services"
          title="Built for citizens, businesses, and government institutions"
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {displayedServices.map((service) => (
            <div
              key={service.id}
              className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <FileCheck2 className="mb-5 h-9 w-9 text-emerald-600" />

              <h3 className="text-lg font-black text-[#063d91]">
                {service.name}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {service.description ||
                  "Submit, review, approve, track, and deliver services through a clear digital workflow."}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#08214a] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionTitle
            eyebrow="Workflow"
            title="A simple transparent service journey"
            light
          />

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {workflow.map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-lg font-black">
                  {index + 1}
                </div>

                <h3 className="font-black">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-xl md:p-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-emerald-600">
              Why MESOB
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#063d91] md:text-4xl">
              Designed for real municipal service delivery.
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              The platform supports role-based dashboards for
              city, sub city, and woreda officers. It improves
              coordination, reduces paper movement, enables
              application tracking, and gives management better
              reports for decision making.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Online application",
              "Document upload",
              "Real-time tracking",
              "Notifications",
              "Online payment",
              "Digital reports",
              "Role-based access",
              "Secure workflow",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 font-bold text-slate-700"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black text-[#063d91]">
              Adama MESOB Service Center
            </h2>

            <p className="mt-4 max-w-3xl leading-8 text-slate-600">
              MESOB brings government closer to the people by
              providing one organized service platform for
              {" "}
              {cityName},
              {" "}
              its {displayedSubcities.length} sub cities, and
              {" "}
              {displayedWoredas.length} woredas. It helps
              residents access public services without unnecessary
              physical visits, while helping offices deliver
              services with measurable quality and accountability.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-6 shadow-sm">
            <Users className="h-10 w-10 text-emerald-600" />

            <h3 className="mt-4 text-xl font-black text-[#063d91]">
              Contact
            </h3>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Adama, Oromia, Ethiopia
              <br />
              Email: temamaman156@gmail.com
              <br />
              Digital service support center
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

type InfoCardProps = {
  icon: LucideIcon;
  title: string;
  text: string;
};

function InfoCard({
  icon: Icon,
  title,
  text,
}: InfoCardProps) {
  return (
    <div className="rounded-3xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
        <Icon className="h-8 w-8 text-emerald-700" />
      </div>

      <h2 className="text-2xl font-black text-[#063d91]">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  light?: boolean;
};

function SectionTitle({
  eyebrow,
  title,
  light = false,
}: SectionTitleProps) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="text-sm font-black uppercase tracking-widest text-emerald-600">
        {eyebrow}
      </p>

      <h2
        className={`mt-3 text-3xl font-black md:text-4xl ${
          light ? "text-white" : "text-[#063d91]"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}