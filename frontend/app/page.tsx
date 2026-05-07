export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              Mesob Adama eService
            </h1>
            <p className="text-sm text-muted-foreground">
              Digital Government Service Platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-lg border px-5 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Login
            </a>

            <a
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Register
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <div className="max-w-3xl">
          <h2 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900">
            Welcome to Mesob Adama eService Portal
          </h2>

          <p className="mb-10 text-lg leading-8 text-gray-600">
            Access city administration services digitally.
            Apply online, track applications, receive approvals,
            and manage government services from anywhere.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/login"
              className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow hover:bg-blue-700"
            >
              Get Started
            </a>

            <a
              href="/services"
              className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold hover:bg-gray-50"
            >
              View Services
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h3 className="mb-3 text-xl font-bold">
            Online Applications
          </h3>

          <p className="text-gray-600">
            Submit applications digitally without visiting offices.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h3 className="mb-3 text-xl font-bold">
            Track Status
          </h3>

          <p className="text-gray-600">
            Monitor your service progress in real time.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h3 className="mb-3 text-xl font-bold">
            Secure Digital Service
          </h3>

          <p className="text-gray-600">
            Safe authentication and transparent workflows.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          <p className="text-sm text-gray-500">
            © 2026 Mesob Adama eService System
          </p>

          <div className="flex gap-4 text-sm text-gray-500">
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
            <a href="/help">Help</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
