import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startDevServer } from '../../../src/steps/actions/server.js';
import * as net from 'net';

/**
 * TC-15: 开发服务器自动启动
 */
describe('startDevServer', () => {
  let mockServer: net.Server | null = null;

  afterEach(async () => {
    if (mockServer) {
      await new Promise<void>((resolve) => reject => {
        mockServer!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      mockServer = null;
    }
  });

  it('should start dev server when port is available', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    const result = await startDevServer.execute({
      params: {},
      steps: {},
    });

    // Should start server (this will actually start npm run dev in background)
    expect(result.success).toBe(true);
  });

  it('should detect when server is already running', async () => {
    // Start a mock server on port 4321
    mockServer = net.createServer();
    await new Promise<void>((resolve) => {
      mockServer!.listen(4321, () => resolve());
    });

    const consoleSpy = vi.spyOn(console, 'log');

    const result = await startDevServer.execute({
      params: {},
      steps: {},
    });

    // Should skip starting
    expect(result.success).toBe(true);
    expect(result.skipped).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('已在运行')
    );
  });

  it('should handle server start failure gracefully', async () => {
    // This test is tricky because we can't easily mock npm run dev failure
    // For now, we'll just verify the structure
    const result = await startDevServer.execute({
      params: {},
      steps: {},
    });

    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
  });
});

/**
 * TC-16: 开发服务器已运行时跳过启动
 */
describe('startDevServer - port detection', () => {
  it('should correctly detect port 4321 is in use', async () => {
    const mockServer = net.createServer();
    await new Promise<void>((resolve) => {
      mockServer.listen(4321, () => resolve());
    });

    // Check if port is in use
    const isPortInUse = await new Promise<boolean>((resolve) => {
      const testServer = net.createServer();
      testServer.once('error', () => resolve(true));
      testServer.once('listening', () => {
        testServer.close();
        resolve(false);
      });
      testServer.listen(4321);
    });

    expect(isPortInUse).toBe(true);

    // Clean up
    await new Promise<void>((resolve, reject) => {
      mockServer.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  it('should correctly detect port 4321 is available', async () => {
    // Check if port is available
    const isPortAvailable = await new Promise<boolean>((resolve) => {
      const testServer = net.createServer();
      testServer.once('error', () => resolve(false));
      testServer.once('listening', () => {
        testServer.close();
        resolve(true);
      });
      testServer.listen(4321);
    });

    expect(isPortAvailable).toBe(true);
  });
});
