import { prisma } from "@/lib/prisma";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export class FileUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileUploadError";
  }
}

/**
 * Store an uploaded file as bytea in PostgreSQL.
 * Returns the StoredFile id — save this on the parent record.
 */
export async function storeFile({
  file,
  uploadedById,
}: {
  file: File;
  uploadedById: string;
}): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new FileUploadError(
      `File type "${file.type}" not allowed. Upload a JPG, PNG, WebP, or PDF.`
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new FileUploadError(
      `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.`
    );
  }

  const buffer = await file.arrayBuffer();

  const stored = await prisma.storedFile.create({
    data: {
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      data: Buffer.from(buffer),
      uploadedById,
    },
    select: { id: true },
  });

  return stored.id;
}

/**
 * Retrieve file metadata + content for serving.
 * The caller is responsible for authorisation before calling this.
 */
export async function getFile(fileId: string) {
  return prisma.storedFile.findUnique({
    where: { id: fileId },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
      data: true,
      uploadedAt: true,
    },
  });
}

/**
 * Delete a stored file. Use only when the parent record is also deleted
 * (i.e. dispute withdrawn). Expenses are immutable — never delete their files.
 */
export async function deleteFile(fileId: string): Promise<void> {
  await prisma.storedFile.delete({ where: { id: fileId } });
}
