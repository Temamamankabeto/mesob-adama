import {
  HeroSection,
  CoverageSection,
  ServicesSection,
  WorkflowSection,
  FeatureSection,
  ContactSection,
  VisionMissionSection,
} from "@/components/about";

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
    (_, i) => `Woreda ${String(i + 1).padStart(2, "0")}`
);

const fallbackServices = [
  "Civil Registration",
  "Business Licensing",
  "Land Administration",
  "Payment Services",
  "Appointment Booking",
  "Document Verification",
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
    const [locationsRes, servicesRes] = await Promise.all([
      fetch(`${baseUrl}/public/locations`, {
        next: {
          revalidate: 60,
        },
      }),

      fetch(`${baseUrl}/public/services/featured`, {
        next: {
          revalidate: 60,
        },
      }),
    ]);

    if (!locationsRes.ok) {
      throw new Error("Unable to fetch locations");
    }

    const locations = await locationsRes.json();

    const services = servicesRes.ok
        ? await servicesRes.json()
        : null;

    return {
      cities: locations?.data?.cities ?? [],
      subcities: locations?.data?.subcities ?? [],
      woredas: locations?.data?.woredas ?? [],
      services: services?.data ?? [],
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
  const {
    cities,
    subcities,
    woredas,
    services,
  } = await getAboutData();

  const cityName =
      cities[0]?.name ??
      "Adama City Administration";

  const displayedSubcities =
      subcities.length
          ? subcities
          : fallbackSubCities.map((name, index) => ({
            id: index + 1,
            name,
          }));

  const displayedWoredas =
      woredas.length
          ? woredas
          : fallbackWoredas.map((name, index) => ({
            id: index + 1,
            name,
          }));

  const displayedServices =
      services.length
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
    },
    {
      label: "Sub Cities",
      value: String(displayedSubcities.length),
    },
    {
      label: "Woredas",
      value: String(displayedWoredas.length),
    },
    {
      label: "Digital Services",
      value: `${displayedServices.length}+`,
    },
  ];

  return (
      <main className="min-h-screen bg-background">
        <HeroSection
            cityName={cityName}
            stats={stats}
            subcityCount={displayedSubcities.length}
            woredaCount={displayedWoredas.length}
        />

        <VisionMissionSection />

        <CoverageSection
            cityName={cityName}
            subcities={displayedSubcities}
            woredas={displayedWoredas}
        />

        <ServicesSection
            services={displayedServices}
        />

        <WorkflowSection
            workflow={workflow}
        />

        <FeatureSection />

        <ContactSection
            cityName={cityName}
            subcityCount={displayedSubcities.length}
            woredaCount={displayedWoredas.length}
        />
      </main>
  );
}