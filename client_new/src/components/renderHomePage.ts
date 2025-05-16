import { game_multiplayer_url } from "../config/api_url_config";
import Navigo from "navigo";

export function renderHomePage(router: Navigo) {
    const app = document.getElementById('app');
    if (!app) {
        console.error('No element with id="app" found.');
        return;
    }
    app.replaceChildren();
    app.className = "md:container mx-auto md:p-4"
    app.innerHTML = `
    <!-- Hero Section -->
    <section class="bg-blue-600 text-white py-16 text-center">
      <h1 class="text-4xl font-bold mb-4">Welcome to Pong</h1>
      <p class="text-lg max-w-xl mx-auto">
        A blazing-fast, multiplayer, and secure and good old-fashioned PONG game built with love.
      </p>
      <button
        id="get-started-btn"
        class="mt-8 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition">
        Play Multiplayer Pong
      </button>
    </section>

    <!-- Features Grid -->
    <section class="py-16 px-4">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 class="text-2xl font-semibold mb-2">High Performance</h2>
          <p>
            Leveraging asynchronous I/O and optimized memory management made by Martin.
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 class="text-2xl font-semibold mb-2">Secure by Design</h2>
          <p>
            Built with industry-standard encryption and best practices.
          </p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 class="text-2xl font-semibold mb-2">Cross-Platform</h2>
          <p>
            Runs seamlessly on Linux, macOS, and Windows with little bit of luck.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-300 py-8 text-center">
      <p>&copy; ${new Date().getFullYear()} TrdLaZe42. All rights reserved.</p>
    </footer>
  `;

    const button = document.getElementById('get-started-btn') as HTMLButtonElement;
    button.addEventListener('click', () => {
        // one option to tell the router to route to the webpage
        // Check the attribute data-navigo - the router can see this and does the navigation
        // const a = document.createElement('a');
        // a.href = game_multiplayer_url;
        // a.setAttribute('data-navigo', '');
        // a.click();
        router.navigate(game_multiplayer_url)
    });
}

