import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileUploadError, storeFile } from "@/lib/storage";

// Mock prisma so tests don't need a real DB
vi.mock("@/lib/prisma", () => ({
  prisma: {
    storedFile: {
      create: vi.fn().mockResolvedValue({ id: "file_test_123" }),
    },
  },
}));

// Prevent Prisma client from trying to load real generated types
vi.mock("@/generated/prisma", () => ({}));

function makeFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes);
  return new File([content], name, { type });
}

describe("storeFile — validation", () => {
  it("accepts JPEG files", async () => {
    const file = makeFile("receipt.jpg", "image/jpeg", 100);
    const id = await storeFile({ file, uploadedById: "user_1" });
    expect(id).toBe("file_test_123");
  });

  it("accepts PNG files", async () => {
    const file = makeFile("receipt.png", "image/png", 100);
    const id = await storeFile({ file, uploadedById: "user_1" });
    expect(id).toBe("file_test_123");
  });

  it("accepts PDF files", async () => {
    const file = makeFile("invoice.pdf", "application/pdf", 100);
    const id = await storeFile({ file, uploadedById: "user_1" });
    expect(id).toBe("file_test_123");
  });

  it("rejects disallowed MIME types", async () => {
    const file = makeFile("script.exe", "application/octet-stream", 100);
    await expect(storeFile({ file, uploadedById: "user_1" })).rejects.toThrow(
      FileUploadError
    );
  });

  it("rejects files over 5 MB", async () => {
    const file = makeFile("huge.jpg", "image/jpeg", 6 * 1024 * 1024);
    await expect(storeFile({ file, uploadedById: "user_1" })).rejects.toThrow(
      FileUploadError
    );
  });

  it("accepts files exactly at 5 MB", async () => {
    const file = makeFile("ok.jpg", "image/jpeg", 5 * 1024 * 1024);
    const id = await storeFile({ file, uploadedById: "user_1" });
    expect(id).toBe("file_test_123");
  });
});
