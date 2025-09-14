"use client";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
// import { useRouter } from "next/navigation";

// NODE_OPTIONS="--max-old-space-size=4096" npm run build -- for build
// pm2 restart fiverr01-app -- for start server
// pm2 stop fiverr01-app -- for start server


export default function Home() {
  // const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [route, setRoute] = useState("/login");
  useEffect(() => {
    async function fetchRoute() {
      try {
        let result = await fetch("/api/auth");
        result = await result.json();
        if (result.success) {
          setSuccess(result.success);
          setRoute(result.route);
        }
        // router.push(result.route);
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchRoute();
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-2 bg-gray-200 text-black flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Welcome to Company
          </h1>
          <p className="text-xl mb-10 text-gray-700">
            Simplify your billing process with our easy-to-use platform.
          </p>
          {success ? (
            <Link
              href={route}
              className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Error handling stock transfer: Error: RetailStock validation failed: stocks.0.quantity.totalStrips: Path `quantity.totalStrips` is required.
//     at ValidationError.inspect (/root/fiverr01/node_modules/mongoose/lib/error/validation.js:52:26)
//     at formatValue (node:internal/util/inspect:805:19)
//     at inspect (node:internal/util/inspect:364:10)
//     at formatWithOptionsInternal (node:internal/util/inspect:2279:40)
//     at formatWithOptions (node:internal/util/inspect:2141:10)
//     at console.value (node:internal/console/constructor:352:14)
//     at console.warn (node:internal/console/constructor:385:61)
//     at m (/root/fiverr01/.next/server/app/api/stockRequest/receivedStock/route.js:1:2962)
//     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
//     at async /root/fiverr01/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36957 {
//   errors: {
//     'stocks.0.quantity.totalStrips': ValidatorError: Path `quantity.totalStrips` is required.
//         at validate (/root/fiverr01/node_modules/mongoose/lib/schemaType.js:1385:13)
//         at SchemaType.doValidate (/root/fiverr01/node_modules/mongoose/lib/schemaType.js:1369:7)
//         at /root/fiverr01/node_modules/mongoose/lib/document.js:3071:18
//         at process.processTicksAndRejections (node:internal/process/task_queues:77:11) {
//       properties: [Object],
//       kind: 'required',
//       path: 'quantity.totalStrips',
//       value: null,
//       reason: undefined,
//       [Symbol(mongoose#validatorError)]: true
//     }
//   },
//   _message: 'RetailStock validation failed'
// }


// Error handling stock transfer: Error: RetailStock validation failed: stocks.0.quantity.totalStrips: Path `quantity.totalStrips` is required.
//     at ValidationError.inspect (/root/fiverr01/node_modules/mongoose/lib/error/validation.js:52:26)
//     at formatValue (node:internal/util/inspect:805:19)
//     at inspect (node:internal/util/inspect:364:10)
//     at formatWithOptionsInternal (node:internal/util/inspect:2279:40)
//     at formatWithOptions (node:internal/util/inspect:2141:10)
//     at console.value (node:internal/console/constructor:352:14)
//     at console.warn (node:internal/console/constructor:385:61)
//     at m (/root/fiverr01/.next/server/app/api/stockRequest/receivedStock/route.js:1:2966)
//     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
//     at async /root/fiverr01/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:36957 {
//   errors: {
//     'stocks.0.quantity.totalStrips': ValidatorError: Path `quantity.totalStrips` is required.
//         at validate (/root/fiverr01/node_modules/mongoose/lib/schemaType.js:1385:13)
//         at SchemaType.doValidate (/root/fiverr01/node_modules/mongoose/lib/schemaType.js:1369:7)
//         at /root/fiverr01/node_modules/mongoose/lib/document.js:3071:18
//         at process.processTicksAndRejections (node:internal/process/task_queues:77:11) {
//       properties: [Object],
//       kind: 'required',
//       path: 'quantity.totalStrips',
//       value: null,
//       reason: undefined,
//       [Symbol(mongoose#validatorError)]: true
//     }
//   },
//   _message: 'RetailStock validation failed'
// }

// 