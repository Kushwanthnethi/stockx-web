import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-5 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-orange-500">SwiggyClone</h1>
        <div className="space-x-6">
          <a href="#" className="hover:text-orange-500">Home</a>
          <a href="#" className="hover:text-orange-500">Restaurants</a>
          <a href="#" className="hover:text-orange-500">Offers</a>
          <a href="#" className="hover:text-orange-500">Help</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-[400px]">
        <Image
          src="/hero-swiggy.png"
          alt="Delicious Food"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white">
          <h1 className="text-4xl font-bold">Order Food Anytime, Anywhere</h1>
          <p className="mt-2">Delicious meals from your favorite restaurants</p>
          <button className="mt-4 px-6 py-2 bg-orange-500 rounded-lg hover:bg-orange-600">Order Now</button>
        </div>
      </section>

      {/* Categories */}
      <section className="p-8">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {["pizza", "biryani", "burgers", "desserts", "drinks", "chinese"].map((item) => (
            <div key={item} className="text-center">
              <Image src={`/categories/${item}.jpg`} alt={item} width={100} height={100} className="rounded-full mx-auto" />
              <p className="mt-2 capitalize">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Restaurants */}
      <section className="p-8 bg-white">
        <h2 className="text-2xl font-bold mb-4">Popular Restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="bg-gray-100 p-3 rounded-lg shadow hover:shadow-lg transition">
              <Image src={`/restaurants/restaurant${num}.jpg`} alt={`Restaurant ${num}`} width={300} height={200} className="rounded-lg" />
              <h3 className="mt-2 font-semibold">Restaurant {num}</h3>
              <p className="text-sm text-gray-500">Delicious & Fresh</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chef Section */}
      <section className="p-8 text-center bg-orange-50">
        <Image src="/chef.png" alt="Chef" width={200} height={200} className="mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Be the Chef of Your Kitchen</h2>
        <p className="mt-2 text-gray-600">Get inspired by our delicious recipes</p>
        <button className="mt-4 px-6 py-2 bg-orange-500 rounded-lg text-white hover:bg-orange-600">Explore Recipes</button>
      </section>

      {/* Instagram Section */}
      <section className="p-8 bg-white">
        <h2 className="text-2xl font-bold mb-4">Check out @SwiggyClone on Instagram</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <Image key={num} src={`/instagram/insta${num}.jpg`} alt={`Instagram ${num}`} width={300} height={200} className="rounded-lg" />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="p-5 bg-gray-900 text-white text-center mt-5">
        <p>© 2025 SwiggyClone. All rights reserved.</p>
      </footer>
    </div>
  );
}
