#!/usr/bin/env node

/**
 * Ferry API Test Script
 *
 * This script tests the ferry booking system APIs to identify what's working
 * and what needs attention.
 *
 * Usage:
 *   node scripts/test-ferry-apis.js
 *   node scripts/test-ferry-apis.js --search
 *   node scripts/test-ferry-apis.js --seat-layout
 */

const https = require("https");
const http = require("http");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "blue");
}

// Test configuration
const TEST_CONFIG = {
  baseUrl: "http://localhost:3000",
  searchParams: {
    from: "port-blair",
    to: "havelock",
    date: "2024-12-20",
    adults: 2,
    children: 0,
    infants: 0,
  },
  timeout: 10000,
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https://");
    const client = isHttps ? https : http;

    const requestOptions = {
      timeout: TEST_CONFIG.timeout,
      ...options,
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Test 1: Ferry Search API
async function testFerrySearch() {
  logInfo("Testing Ferry Search API...");

  try {
    const response = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/ferry/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(TEST_CONFIG.searchParams),
      }
    );

    if (response.status === 200) {
      logSuccess("Ferry Search API is working");

      if (response.data.success) {
        const results = response.data.data?.results || [];
        logInfo(`Found ${results.length} ferry results`);

        // Check operator results
        const operators = [...new Set(results.map((r) => r.operator))];
        logInfo(`Operators returning results: ${operators.join(", ")}`);

        // Check for errors
        const errors = response.data.data?.meta?.operatorErrors || [];
        if (errors.length > 0) {
          logWarning(
            `Some operators failed: ${errors.map((e) => e.operator).join(", ")}`
          );
        }

        // Display first result details
        if (results.length > 0) {
          const firstResult = results[0];
          logInfo(
            `Sample result: ${firstResult.ferryName} (${firstResult.operator})`
          );
          logInfo(
            `  Route: ${firstResult.route.from.name} → ${firstResult.route.to.name}`
          );
          logInfo(
            `  Time: ${firstResult.schedule.departureTime} - ${firstResult.schedule.arrivalTime}`
          );
          logInfo(`  Classes: ${firstResult.classes.length}`);
        }
      } else {
        logError("Search API returned success: false");
        console.log("Response:", JSON.stringify(response.data, null, 2));
      }
    } else {
      logError(`Search API returned status ${response.status}`);
      console.log("Response:", response.data);
    }
  } catch (error) {
    logError(`Search API test failed: ${error.message}`);
  }
}

// Test 2: Seat Layout API (Green Ocean)
async function testSeatLayout() {
  logInfo("Testing Seat Layout API...");

  try {
    const response = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/ferry/seat-layout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operator: "greenocean",
          ferryId: "test-ferry-id",
          classId: "1",
          fromLocation: "port-blair",
          toLocation: "havelock",
          date: "2024-12-20",
        }),
      }
    );

    if (response.status === 200) {
      logSuccess("Seat Layout API is working");
      console.log("Response:", JSON.stringify(response.data, null, 2));
    } else {
      logWarning(`Seat Layout API returned status ${response.status}`);
      console.log("Response:", response.data);
    }
  } catch (error) {
    logError(`Seat Layout API test failed: ${error.message}`);
  }
}

// Test 3: Booking Session API
async function testBookingSession() {
  logInfo("Testing Booking Session API...");

  try {
    const response = await makeRequest(
      `${TEST_CONFIG.baseUrl}/api/ferry/booking/create-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchParams: TEST_CONFIG.searchParams,
          selectedFerry: {
            operator: "greenocean",
            ferryId: "test-ferry-id",
            ferryName: "Green Ocean 1",
            routeData: {},
          },
          selectedClass: {
            classId: "1",
            className: "Economy",
            price: 1150,
          },
        }),
      }
    );

    if (response.status === 200) {
      logSuccess("Booking Session API is working");
      console.log("Response:", JSON.stringify(response.data, null, 2));
    } else {
      logWarning(`Booking Session API returned status ${response.status}`);
      console.log("Response:", response.data);
    }
  } catch (error) {
    logError(`Booking Session API test failed: ${error.message}`);
  }
}

// Test 4: Environment Variables Check
function checkEnvironmentVariables() {
  logInfo("Checking Environment Variables...");

  const requiredVars = [
    "SEALINK_USERNAME",
    "SEALINK_TOKEN",
    "MAKRUZZ_USERNAME",
    "MAKRUZZ_PASSWORD",
    "GREEN_OCEAN_PUBLIC_KEY",
    "GREEN_OCEAN_PRIVATE_KEY",
  ];

  const missingVars = [];

  requiredVars.forEach((varName) => {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`);
    } else {
      logError(`${varName} is missing`);
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    logWarning(`Missing environment variables: ${missingVars.join(", ")}`);
    logInfo("Add these to your .env.local file to enable full testing");
  }
}

// Test 5: Direct Operator API Tests
async function testDirectOperatorAPIs() {
  logInfo("Testing Direct Operator APIs...");

  // Test Sealink API
  if (process.env.SEALINK_USERNAME && process.env.SEALINK_TOKEN) {
    try {
      const sealinkUrl =
        process.env.SEALINK_API_URL || "http://api.gonautika.com:8012/";
      const response = await makeRequest(`${sealinkUrl}getTripData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: "20-12-2024",
          from: "Port Blair",
          to: "Swaraj Dweep",
          userName: process.env.SEALINK_USERNAME,
          token: process.env.SEALINK_TOKEN,
        }),
      });

      if (response.status === 200) {
        logSuccess("Sealink API is accessible");
      } else {
        logWarning(`Sealink API returned status ${response.status}`);
      }
    } catch (error) {
      logError(`Sealink API test failed: ${error.message}`);
    }
  }

  // Test Green Ocean API
  if (
    process.env.GREEN_OCEAN_PUBLIC_KEY &&
    process.env.GREEN_OCEAN_PRIVATE_KEY
  ) {
    try {
      const greenOceanUrl =
        process.env.GREEN_OCEAN_API_URL ||
        "https://tickets.greenoceanseaways.com/test-v-1.0-api/";
      const response = await makeRequest(`${greenOceanUrl}v1/route-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from_id: 1,
          dest_to: 2,
          number_of_adults: 2,
          number_of_infants: 0,
          travel_date: "20-12-2024",
          public_key: process.env.GREEN_OCEAN_PUBLIC_KEY,
          hash_string: "test-hash", // This will fail but tests connectivity
        }),
      });

      if (response.status === 200 || response.status === 400) {
        logSuccess("Green Ocean API is accessible");
      } else {
        logWarning(`Green Ocean API returned status ${response.status}`);
      }
    } catch (error) {
      logError(`Green Ocean API test failed: ${error.message}`);
    }
  }
}

// Main test runner
async function runTests() {
  const args = process.argv.slice(2);
  const testType = args[0];

  log("🚢 Ferry API Test Suite", "bright");
  log("=====================\n", "bright");

  // Check environment variables first
  checkEnvironmentVariables();
  console.log("");

  // Run specific test or all tests
  if (testType === "--search") {
    await testFerrySearch();
  } else if (testType === "--seat-layout") {
    await testSeatLayout();
  } else if (testType === "--booking-session") {
    await testBookingSession();
  } else if (testType === "--operators") {
    await testDirectOperatorAPIs();
  } else {
    // Run all tests
    await testFerrySearch();
    console.log("");
    await testSeatLayout();
    console.log("");
    await testBookingSession();
    console.log("");
    await testDirectOperatorAPIs();
  }

  console.log("");
  log("🏁 Test suite completed", "bright");
}

// Handle script execution
if (require.main === module) {
  runTests().catch((error) => {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testFerrySearch,
  testSeatLayout,
  testBookingSession,
  testDirectOperatorAPIs,
  checkEnvironmentVariables,
};
