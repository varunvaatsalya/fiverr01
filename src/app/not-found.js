import { FaRegSadTear } from "react-icons/fa";

function notfound() {
  return (
    <>
      <main className="grid min-h-screen bg-slate-950 place-items-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
            <FaRegSadTear className="w-full text-4xl my-2 text-gray-100"/>
          <p className="text-2xl font-semibold text-gray-100">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-100 sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-400">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/"
              className="rounded-md bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-100"
            >
              Go back home
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

export default notfound;
