const net = require('net');

const getPortCandidates = (startPort, maxAttempts = 10) => {
  const basePort = Number(startPort) || 5000;
  return Array.from({ length: maxAttempts }, (_, index) => basePort + index);
};

const isPortAvailable = (port) =>
  new Promise((resolve) => {
    const tester = net.createServer();

    tester.once('error', () => {
      resolve(false);
    });

    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port, '127.0.0.1');
  });

const getAvailablePort = async (startPort, maxAttempts = 10) => {
  for (const port of getPortCandidates(startPort, maxAttempts)) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`No available port found for ${startPort} after ${maxAttempts} attempts`);
};

module.exports = {
  getPortCandidates,
  isPortAvailable,
  getAvailablePort,
};
