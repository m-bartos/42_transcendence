export function renderHomePage() {
    const app = document.getElementById('app');
    if (!app) {
        console.error('No element with id="app" found.');
        return;
    }

    app.innerHTML = `
    <!-- Hero Section -->
    <section class="bg-blue-600 text-white py-16 text-center">
      <h1 class="text-4xl font-bold mb-4">Welcome to MyApp</h1>
      <p class="text-lg max-w-xl mx-auto">
        A blazing-fast, scalable, and secure platform built with love.
      </p>
      <button
        id="get-started-btn"
        class="mt-8 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
      >
        Get Started
      </button>
    </section>

    <!-- Features Grid -->
    <section class="py-16 px-4">
      <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 class="text-2xl font-semibold mb-2">High Performance</h2>
          <p>
            Leveraging asynchronous I/O and optimized memory management.
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
            Runs seamlessly on Linux, macOS, and Windows.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-300 py-8 text-center">
      <p>&copy; ${new Date().getFullYear()} MyApp. All rights reserved.</p>
    </footer>
  `;

    // Example of hooking up an event after injection:
    // @ts-ignore
    document
        .getElementById('get-started-btn')
        .addEventListener('click', () => {
            alert('Let’s get started!');
        });
}

// When the DOM is ready, render the page:
document.addEventListener('DOMContentLoaded', renderHomePage);
