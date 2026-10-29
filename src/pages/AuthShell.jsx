import Logo from '../components/Logo';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-600 p-12 text-white lg:flex">
        <Logo className="!text-white" />
        <div>
          <h2 className="max-w-md text-4xl font-extrabold leading-tight">Keep up with the people and posts that matter to you.</h2>
          <p className="mt-4 max-w-md text-brand-100">Share updates, join conversations, and stay close to your circle.</p>
        </div>
        <p className="text-sm text-brand-200">© {new Date().getFullYear()} Connectly</p>
      </div>
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          <div className="card p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
            <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
            {children}
          </div>
          <p className="mt-5 text-center text-sm text-slate-600">{footer}</p>
        </div>
      </div>
    </div>
  );
}
