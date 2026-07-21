export class BlobManager {
  private static createdUrls: Set<string> = new Set();

  public static createURL(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    BlobManager.createdUrls.add(url);
    return url;
  }

  public static revokeURL(url: string): void {
    if (BlobManager.createdUrls.has(url)) {
      URL.revokeObjectURL(url);
      BlobManager.createdUrls.delete(url);
    }
  }

  public static revokeAll(): void {
    BlobManager.createdUrls.forEach((url) => URL.revokeObjectURL(url));
    BlobManager.createdUrls.clear();
  }
}
