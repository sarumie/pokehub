export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="hidden md:flex md:w-1/2 bg-blue-600 flex-col items-center justify-center p-8 text-white">
          <img
            src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/8a5d5bc8-94fe-46e1-ac40-03969b602a62/dg4mjze-33edda11-2e31-4a6b-8fb7-a4607735d063.png"
            width="150"
            alt="Pokemon Logo"
            className="mb-4"
          />
          <h1 className="text-4xl font-bold mb-2">
            Poke<span className="text-yellow-300">Hub</span>
          </h1>
          <p className="text-lg">Join us to the world of Pokemons</p>
        </div>
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Register</h2>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="E-mail"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="re-type password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold">
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
