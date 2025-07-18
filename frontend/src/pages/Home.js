import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-[#fff8e1] min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-orange-600">
            Blogging
          </h1>
          <div className="space-x-4">
            <Link
              to="/login"
              className="text-gray-700 font-medium hover:text-black"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <h2 className="text-5xl md:text-6xl font-serif font-bold tracking-tight max-w-3xl leading-tight text-orange-700">
          Share Your Stories
        </h2>
        <p className="mt-4 text-lg text-gray-700 max-w-xl">
          Read, write, and inspire others with your words.
        </p>
        <Link
          to="/login"
          className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600"
        >
          Start reading
        </Link>
      </div>
    </div>
  );
}
