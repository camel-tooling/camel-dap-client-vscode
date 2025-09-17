import net from 'net';

/**
 * Checks if a port is available.
 * @param port - The port number to check.
 * @returns A promise that resolves when the port is free.
 */
export async function waitForPortToBeFreed(port: number): Promise<void> {
    while (true) {
        const isFree = await isPortFree(port);
        if (isFree) {
            return;
        }
        await delay(1000); // Wait for 1 second before checking again
    }
}

/**
 * Checks if a port is free.
 * @param port - The port number to check.
 * @returns A promise that resolves to true if the port is free, otherwise false.
 */
function isPortFree(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once('error', () => {
            resolve(false); // Port is in use
        });

        server.once('listening', () => {
            server.close();
            resolve(true); // Port is free
        });

        server.listen(port);
    });
}

/**
 * Delays execution for a given number of milliseconds.
 * @param ms - The number of milliseconds to delay.
 * @returns A promise that resolves after the delay.
 */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
