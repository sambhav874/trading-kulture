export default function About() {
    return (
      <div className="min-h-screen bg-white py-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            About Our Business Management System
          </h1>
          <div className="mt-6 space-y-6 text-gray-600">
            <p>
              Our Business Management System is a comprehensive solution designed to streamline your business operations.
              Whether you're an administrator or a business partner, our platform provides the tools you need to manage
              leads, inventory, sales, and commissions effectively.
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Key Features</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Secure authentication system with role-based access</li>
              <li>Comprehensive lead management</li>
              <li>Real-time inventory tracking</li>
              <li>Sales performance monitoring</li>
              <li>Automated commission calculations</li>
              <li>Detailed reporting and analytics</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }